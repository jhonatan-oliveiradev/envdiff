import { z } from "zod";

export const ComparisonRequestSchema = z.object({
	greenUrl: z.string().url(),
	blueUrl: z.string().url(),
	viewports: z
		.array(
			z.object({
				width: z.number().min(320).max(3840),
				height: z.number().min(480).max(2160)
			})
		)
		.default([{ width: 1366, height: 768 }]),
	ignoreSelectors: z.array(z.string()).default([]),
	maskSelectors: z.array(z.string()).default([]),
	pixelThreshold: z.number().min(0).max(1).default(0.15),
	compareDom: z.boolean().default(false),
	compareHttp: z.boolean().default(false)
});

export type ComparisonRequest = z.infer<typeof ComparisonRequestSchema>;

export interface ViewportResult {
	viewport: { width: number; height: number };
	greenScreenshot: string;
	blueScreenshot: string;
	diffScreenshot: string;
	diffPercentage: number;
	diffPixels: number;
	totalPixels: number;
}

export interface ComparisonResponse {
	id: string;
	status: "queued" | "processing" | "done" | "failed";
	greenUrl: string;
	blueUrl: string;
	visualResults?: ViewportResult[];
	domDiff?: unknown;
	httpDiff?: unknown;
	createdAt: string;
	error?: string;
}
