import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ comparisonId: string; filename: string }> }
) {
	try {
		const { comparisonId, filename } = await params;

		// Em produção (Vercel), screenshots estão em /tmp
		const isProduction = process.env.VERCEL === "1";
		const screenshotsDir = isProduction
			? join("/tmp", "screenshots", comparisonId)
			: join(process.cwd(), "public", "screenshots", comparisonId);

		const filePath = join(screenshotsDir, filename);

		// Lê o arquivo
		const fileBuffer = await readFile(filePath);

		// Retorna a imagem com headers corretos
		return new NextResponse(fileBuffer as unknown as BodyInit, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=31536000, immutable"
			}
		});
	} catch (error) {
		console.error("Error serving screenshot:", error);
		return NextResponse.json(
			{ error: "Screenshot not found" },
			{ status: 404 }
		);
	}
}
