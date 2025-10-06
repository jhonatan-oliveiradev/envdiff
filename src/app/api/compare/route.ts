import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ComparisonRequestSchema } from "@/lib/types";
import { takeScreenshot } from "@/lib/screenshot";
import { comparePixels } from "@/lib/pixel-diff";
import { compareDom } from "@/lib/dom-diff";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { chromium } from "playwright";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const data = ComparisonRequestSchema.parse(body);

		// Cria o registro no banco
		const comparison = await prisma.comparison.create({
			data: {
				greenUrl: data.greenUrl,
				blueUrl: data.blueUrl,
				viewports: JSON.stringify(data.viewports),
				ignoreSelectors: JSON.stringify(data.ignoreSelectors),
				maskSelectors: JSON.stringify(data.maskSelectors),
				pixelThreshold: data.pixelThreshold,
				status: "processing"
			}
		});

		// Processa em background (em produção, use uma fila como Bull/BullMQ)
		processComparison(comparison.id, data).catch(console.error);

		return NextResponse.json({
			id: comparison.id,
			status: "processing",
			greenUrl: data.greenUrl,
			blueUrl: data.blueUrl,
			createdAt: comparison.createdAt.toISOString()
		});
	} catch (error) {
		console.error("Error creating comparison:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

async function processComparison(
	comparisonId: string,
	data: {
		greenUrl: string;
		blueUrl: string;
		viewports: Array<{ width: number; height: number }>;
		ignoreSelectors: string[];
		maskSelectors: string[];
		pixelThreshold: number;
		compareDom: boolean;
		compareHttp: boolean;
	}
) {
	try {
		const visualResults = [];

		// Cria diretório para screenshots
		const screenshotsDir = join(
			process.cwd(),
			"public",
			"screenshots",
			comparisonId
		);
		await mkdir(screenshotsDir, { recursive: true });

		// Para cada viewport
		for (const viewport of data.viewports) {
			const viewportKey = `${viewport.width}x${viewport.height}`;

			// Tira screenshots
			const greenBuffer = await takeScreenshot({
				url: data.greenUrl,
				viewport,
				maskSelectors: data.maskSelectors
			});

			const blueBuffer = await takeScreenshot({
				url: data.blueUrl,
				viewport,
				maskSelectors: data.maskSelectors
			});

			// Salva screenshots
			const greenPath = join(screenshotsDir, `green-${viewportKey}.png`);
			const bluePath = join(screenshotsDir, `blue-${viewportKey}.png`);
			await writeFile(greenPath, greenBuffer);
			await writeFile(bluePath, blueBuffer);

			// Compara pixels
			const diffResult = comparePixels(
				greenBuffer,
				blueBuffer,
				data.pixelThreshold
			);

			// Salva diff
			const diffPath = join(screenshotsDir, `diff-${viewportKey}.png`);
			await writeFile(diffPath, diffResult.diffBuffer);

			visualResults.push({
				viewport,
				greenScreenshot: `/screenshots/${comparisonId}/green-${viewportKey}.png`,
				blueScreenshot: `/screenshots/${comparisonId}/blue-${viewportKey}.png`,
				diffScreenshot: `/screenshots/${comparisonId}/diff-${viewportKey}.png`,
				diffPercentage: diffResult.diffPercentage,
				diffPixels: diffResult.diffPixels,
				totalPixels: diffResult.totalPixels
			});
		}

		// Compara DOM se solicitado
		let domDiff = null;
		if (data.compareDom) {
			const browser = await chromium.launch({ headless: true });
			const page = await browser.newPage();

			await page.goto(data.greenUrl, { waitUntil: "networkidle" });
			const htmlGreen = await page.content();

			await page.goto(data.blueUrl, { waitUntil: "networkidle" });
			const htmlBlue = await page.content();

			await browser.close();

			domDiff = await compareDom(htmlGreen, htmlBlue);
		}

		// Atualiza registro com resultados
		await prisma.comparison.update({
			where: { id: comparisonId },
			data: {
				status: "done",
				visualResults: JSON.stringify(visualResults),
				domDiff: domDiff ? JSON.stringify(domDiff) : null
			}
		});
	} catch (error) {
		console.error("Error processing comparison:", error);

		await prisma.comparison.update({
			where: { id: comparisonId },
			data: {
				status: "failed"
			}
		});
	}
}
