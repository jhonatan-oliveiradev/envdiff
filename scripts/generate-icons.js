const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [192, 512];
const svgPath = path.join(__dirname, "../public/icon.svg");

async function generateIcons() {
	const svgBuffer = fs.readFileSync(svgPath);

	for (const size of sizes) {
		const outputPath = path.join(
			__dirname,
			`../public/icon-${size}x${size}.png`
		);

		await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);

		console.log(`✓ Generated ${size}x${size} icon`);
	}

	console.log("✓ All PWA icons generated successfully!");
}

generateIcons().catch(console.error);
