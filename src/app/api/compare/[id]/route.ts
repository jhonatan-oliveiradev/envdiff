import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;

		const comparison = await prisma.comparison.findUnique({
			where: { id }
		});

		if (!comparison) {
			return NextResponse.json(
				{ error: "Comparison not found" },
				{ status: 404 }
			);
		}

		const response = {
			id: comparison.id,
			status: comparison.status,
			greenUrl: comparison.greenUrl,
			blueUrl: comparison.blueUrl,
			visualResults: comparison.visualResults
				? JSON.parse(comparison.visualResults)
				: null,
			domDiff: comparison.domDiff ? JSON.parse(comparison.domDiff) : null,
			httpDiff: comparison.httpDiff ? JSON.parse(comparison.httpDiff) : null,
			createdAt: comparison.createdAt.toISOString(),
			updatedAt: comparison.updatedAt.toISOString()
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error fetching comparison:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
