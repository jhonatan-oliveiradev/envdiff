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
			pixelThreshold
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
	pixelThreshold: number
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

	// Verifica se dimensões são iguais
	if (greenImg.width !== blueImg.width || greenImg.height !== blueImg.height) {
		throw new Error(
			`As imagens devem ter as mesmas dimensões. GREEN: ${greenImg.width}x${greenImg.height}, BLUE: ${blueImg.width}x${blueImg.height}`
		);
	}

	// Compara pixels
	const pixelComparison = comparePixels(
		greenBuffer,
		blueBuffer,
		pixelThreshold
	);

	// Calcula total de pixels
	const totalPixels = greenImg.width * greenImg.height;

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
