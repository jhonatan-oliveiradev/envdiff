import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export interface PixelDiffResult {
	diffPercentage: number;
	diffPixels: number;
	totalPixels: number;
	diffBuffer: Buffer;
	width: number;
	height: number;
}

export function comparePixels(
	bufferA: Buffer,
	bufferB: Buffer,
	threshold = 0.15
): PixelDiffResult {
	const imgA = PNG.sync.read(bufferA);
	const imgB = PNG.sync.read(bufferB);

	// Garante que as imagens têm o mesmo tamanho
	if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
		throw new Error(
			`Images have different dimensions: A(${imgA.width}x${imgA.height}) vs B(${imgB.width}x${imgB.height})`
		);
	}

	const { width, height } = imgA;
	const diff = new PNG({ width, height });

	const diffPixels = pixelmatch(
		imgA.data,
		imgB.data,
		diff.data,
		width,
		height,
		{
			threshold,
			includeAA: true // Inclui anti-aliasing na comparação
		}
	);

	const totalPixels = width * height;
	const diffPercentage = (diffPixels / totalPixels) * 100;

	return {
		diffPercentage,
		diffPixels,
		totalPixels,
		diffBuffer: PNG.sync.write(diff),
		width,
		height
	};
}
