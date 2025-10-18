import { NextRequest, NextResponse } from "next/server";
import { comparePixels } from "@/lib/pixel-diff";
import { PNG } from "pngjs";

// Configuração para Vercel
export const maxDuration = 60; // 60 segundos (plano Pro) ou 10s (Free)
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const greenImage = formData.get("greenImage") as File;
		const blueImage = formData.get("blueImage") as File;
		const pixelThreshold = parseFloat(formData.get("pixelThreshold") as string);
		const strictDimensions = formData.get("strictDimensions") === "true";

		if (!greenImage || !blueImage) {
			return NextResponse.json(
				{ error: "Ambas as imagens são obrigatórias" },
				{ status: 400 }
			);
		}

		// Valida tipos de arquivo
		const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
		if (
			!validTypes.includes(greenImage.type) ||
			!validTypes.includes(blueImage.type)
		) {
			return NextResponse.json(
				{ error: "Formato de imagem inválido. Use PNG, JPG ou WebP" },
				{ status: 400 }
			);
		}

		// Processa a comparação diretamente (sem salvar)
		const result = await processManualComparison(
			greenImage,
			blueImage,
			pixelThreshold,
			strictDimensions
		);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error creating manual comparison:", error);

		// Verifica se é erro de tamanho de payload
		if (error instanceof Error) {
			if (
				error.message.includes("payload") ||
				error.message.includes("too large") ||
				error.message.includes("body size")
			) {
				return NextResponse.json(
					{
						error:
							"As imagens são muito grandes. Por favor, use imagens menores que 20MB cada."
					},
					{ status: 413 }
				);
			}

			// Retorna mensagem de erro específica
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(
			{ error: "Erro interno do servidor. Tente novamente." },
			{ status: 500 }
		);
	}
}

async function processManualComparison(
	greenImage: File,
	blueImage: File,
	pixelThreshold: number,
	strictDimensions: boolean = true
) {
	// Converte arquivos para Buffer
	const greenBuffer = Buffer.from(await greenImage.arrayBuffer());
	const blueBuffer = Buffer.from(await blueImage.arrayBuffer());

	// Valida dimensões antes de comparar
	let greenImg, blueImg;
	try {
		greenImg = PNG.sync.read(greenBuffer);
		blueImg = PNG.sync.read(blueBuffer);
	} catch {
		throw new Error(
			"Erro ao ler imagens. Certifique-se de que são PNG, JPG ou WebP válidos."
		);
	}

	// Verifica dimensões com tolerância ou estritamente
	const widthDiff = Math.abs(greenImg.width - blueImg.width);
	const heightDiff = Math.abs(greenImg.height - blueImg.height);
	const tolerance = 3; // Tolerância de 3px

	if (strictDimensions) {
		// Modo estrito: aceita diferença de até 3px
		if (widthDiff > tolerance || heightDiff > tolerance) {
			throw new Error(
				`As imagens têm dimensões muito diferentes. GREEN: ${greenImg.width}x${greenImg.height}, BLUE: ${blueImg.width}x${blueImg.height}. Diferença máxima permitida: ${tolerance}px.`
			);
		}
	}
	// Se strictDimensions = false, aceita qualquer dimensão

	// Se as dimensões forem diferentes, redimensiona para a menor dimensão comum
	let greenBufferToCompare: Buffer = greenBuffer;
	let blueBufferToCompare: Buffer = blueBuffer;
	let comparisonWidth = greenImg.width;
	let comparisonHeight = greenImg.height;

	if (widthDiff > 0 || heightDiff > 0) {
		// Precisa redimensionar para as dimensões menores
		const minWidth = Math.min(greenImg.width, blueImg.width);
		const minHeight = Math.min(greenImg.height, blueImg.height);

		// Cria novas imagens com as dimensões menores
		const greenResized = new PNG({ width: minWidth, height: minHeight });
		const blueResized = new PNG({ width: minWidth, height: minHeight });

		// Copia os pixels da área comum
		for (let y = 0; y < minHeight; y++) {
			for (let x = 0; x < minWidth; x++) {
				const idxSrc = (y * greenImg.width + x) << 2;
				const idxDst = (y * minWidth + x) << 2;

				// Copia GREEN
				greenResized.data[idxDst] = greenImg.data[idxSrc];
				greenResized.data[idxDst + 1] = greenImg.data[idxSrc + 1];
				greenResized.data[idxDst + 2] = greenImg.data[idxSrc + 2];
				greenResized.data[idxDst + 3] = greenImg.data[idxSrc + 3];

				// Copia BLUE
				const idxSrcBlue = (y * blueImg.width + x) << 2;
				blueResized.data[idxDst] = blueImg.data[idxSrcBlue];
				blueResized.data[idxDst + 1] = blueImg.data[idxSrcBlue + 1];
				blueResized.data[idxDst + 2] = blueImg.data[idxSrcBlue + 2];
				blueResized.data[idxDst + 3] = blueImg.data[idxSrcBlue + 3];
			}
		}

		greenBufferToCompare = Buffer.from(PNG.sync.write(greenResized));
		blueBufferToCompare = Buffer.from(PNG.sync.write(blueResized));
		comparisonWidth = minWidth;
		comparisonHeight = minHeight;
	}

	// Compara pixels
	const pixelComparison = comparePixels(
		greenBufferToCompare,
		blueBufferToCompare,
		pixelThreshold
	);

	// Calcula total de pixels baseado nas dimensões usadas na comparação
	const totalPixels = comparisonWidth * comparisonHeight;

	// Retorna resultado com imagens em base64 (SEM salvar)
	return {
		viewport: { width: greenImg.width, height: greenImg.height },
		greenScreenshot: `data:image/png;base64,${greenBuffer.toString("base64")}`,
		blueScreenshot: `data:image/png;base64,${blueBuffer.toString("base64")}`,
		diffScreenshot: `data:image/png;base64,${pixelComparison.diffBuffer.toString("base64")}`,
		diffPixels: pixelComparison.diffPixels,
		totalPixels: totalPixels,
		diffPercentage: pixelComparison.diffPercentage
	};
}
