import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePixels } from "@/lib/pixel-diff";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const greenImage = formData.get("greenImage") as File;
		const blueImage = formData.get("blueImage") as File;
		const pixelThreshold = parseFloat(
			formData.get("pixelThreshold") as string
		);

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

		// Processa em background
		processManualComparison(comparison.id, greenImage, blueImage, pixelThreshold).catch(
			console.error
		);

		return NextResponse.json({
			id: comparison.id,
			status: "processing"
		});
	} catch (error) {
		console.error("Error creating manual comparison:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
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
		// Detecta ambiente (produção vs desenvolvimento)
		const isProduction = process.env.VERCEL === "1";
		const screenshotsDir = isProduction
			? join("/tmp", "screenshots", comparisonId)
			: join(process.cwd(), "public", "screenshots", comparisonId);

		await mkdir(screenshotsDir, { recursive: true });

		// Converte arquivos para Buffer
		const greenBuffer = Buffer.from(await greenImage.arrayBuffer());
		const blueBuffer = Buffer.from(await blueImage.arrayBuffer());

		// Paths dos arquivos
		const greenPath = join(screenshotsDir, "green-manual.png");
		const bluePath = join(screenshotsDir, "blue-manual.png");
		const diffPath = join(screenshotsDir, "diff-manual.png");

		// Salva imagens originais
		await writeFile(greenPath, greenBuffer);
		await writeFile(bluePath, blueBuffer);

		// Compara pixels
		const pixelComparison = comparePixels(
			greenBuffer,
			blueBuffer,
			pixelThreshold
		);

		// Salva diff visual
		await writeFile(diffPath, pixelComparison.diffBuffer);

		// Monta resultado
		const visualResult = {
			viewport: "manual",
			greenUrl: isProduction
				? `/api/screenshots/${comparisonId}/green-manual.png`
				: `/screenshots/${comparisonId}/green-manual.png`,
			blueUrl: isProduction
				? `/api/screenshots/${comparisonId}/blue-manual.png`
				: `/screenshots/${comparisonId}/blue-manual.png`,
			diffUrl: isProduction
				? `/api/screenshots/${comparisonId}/diff-manual.png`
				: `/screenshots/${comparisonId}/diff-manual.png`,
			diffPixels: pixelComparison.diffPixels,
			diffPercentage: pixelComparison.diffPercentage,
			passed: pixelComparison.diffPercentage < 0.5 // 0.5% threshold
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

		await prisma.comparison.update({
			where: { id: comparisonId },
			data: {
				status: "failed"
			}
		});
	}
}
