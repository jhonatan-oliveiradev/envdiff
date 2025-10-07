import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePixels } from "@/lib/pixel-diff";
import { put } from "@vercel/blob";
import { PNG } from "pngjs";

// Configuração para Vercel (Node.js runtime é necessário para zlib/pngjs)
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

		// Cria registro no banco
		const comparison = await prisma.comparison.create({
			data: {
				greenUrl: `manual-upload-green-${Date.now()}`,
				blueUrl: `manual-upload-blue-${Date.now()}`,
				viewports: JSON.stringify([{ width: 0, height: 0 }]), // Manual upload
				pixelThreshold: pixelThreshold || 0.15,
				status: "processing"
			}
		});

		// Processa SÍNCRONO (não background) para garantir conclusão em <10s
		await processManualComparison(
			comparison.id,
			greenImage,
			blueImage,
			pixelThreshold
		);

		return NextResponse.json({
			id: comparison.id,
			status: "completed"
		});
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
		}

		return NextResponse.json(
			{ error: "Erro interno do servidor. Tente novamente." },
			{ status: 500 }
		);
	}
}

async function processManualComparison(
	comparisonId: string,
	greenImage: File,
	blueImage: File,
	pixelThreshold: number
) {
	try {
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
		if (
			greenImg.width !== blueImg.width ||
			greenImg.height !== blueImg.height
		) {
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

		// Upload para Vercel Blob Storage com multipart (suporta até 500MB no FREE)
		const [greenBlob, blueBlob, diffBlob] = await Promise.all([
			put(`comparisons/${comparisonId}/green-manual.png`, greenBuffer, {
				access: "public",
				contentType: "image/png",
				multipart: greenBuffer.length > 5 * 1024 * 1024 // Use multipart se > 5MB
			}),
			put(`comparisons/${comparisonId}/blue-manual.png`, blueBuffer, {
				access: "public",
				contentType: "image/png",
				multipart: blueBuffer.length > 5 * 1024 * 1024
			}),
			put(
				`comparisons/${comparisonId}/diff-manual.png`,
				pixelComparison.diffBuffer,
				{
					access: "public",
					contentType: "image/png",
					multipart: pixelComparison.diffBuffer.length > 5 * 1024 * 1024
				}
			)
		]);

		// Calcula total de pixels
		const totalPixels = greenImg.width * greenImg.height;

		// Monta resultado com URLs do Blob
		const visualResult = {
			viewport: { width: greenImg.width, height: greenImg.height },
			greenScreenshot: greenBlob.url,
			blueScreenshot: blueBlob.url,
			diffScreenshot: diffBlob.url,
			diffPixels: pixelComparison.diffPixels,
			totalPixels: totalPixels,
			diffPercentage: pixelComparison.diffPercentage
		};

		// Atualiza registro com resultados
		await prisma.comparison.update({
			where: { id: comparisonId },
			data: {
				status: "completed",
				visualResults: JSON.stringify([visualResult])
			}
		});
	} catch (error) {
		console.error("Error processing manual comparison:", error);

		// Mensagem de erro mais específica
		let errorMessage = "Erro desconhecido ao processar comparação";
		if (error instanceof Error) {
			errorMessage = error.message;
			console.error("Detailed error:", {
				message: error.message,
				stack: error.stack
			});
		}

		await prisma.comparison.update({
			where: { id: comparisonId },
			data: {
				status: "failed",
				// Armazena erro nos visualResults para debug
				visualResults: JSON.stringify({
					error: errorMessage,
					timestamp: new Date().toISOString()
				})
			}
		});

		// Re-lança o erro para ser capturado pelo handler principal
		throw error;
	}
}
