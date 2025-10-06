import { chromium } from "playwright";

export interface ScreenshotOptions {
	url: string;
	viewport: { width: number; height: number };
	maskSelectors?: string[];
	freezeCSS?: string;
	waitForSelector?: string;
}

export async function takeScreenshot(
	options: ScreenshotOptions
): Promise<Buffer> {
	const {
		url,
		viewport,
		maskSelectors = [],
		freezeCSS = "",
		waitForSelector
	} = options;

	const browser = await chromium.launch({
		headless: true
	});

	const page = await browser.newPage({
		viewport: { width: viewport.width, height: viewport.height }
	});

	try {
		// Navega para a URL e aguarda network idle
		await page.goto(url, {
			waitUntil: "networkidle",
			timeout: 30000
		});

		// Aguarda selector específico se fornecido
		if (waitForSelector) {
			await page.waitForSelector(waitForSelector, { timeout: 10000 });
		}

		// Congela animações e transições
		await page.addStyleTag({
			content: `
        * { 
          animation: none !important; 
          transition: none !important; 
        }
        ${freezeCSS}
      `
		});

		// Mascara áreas dinâmicas (como relógios, carrosséis, etc)
		for (const selector of maskSelectors) {
			await page.addStyleTag({
				content: `${selector} { visibility: hidden !important; }`
			});
		}

		// Tira screenshot da página completa
		const buffer = await page.screenshot({
			fullPage: true,
			type: "png"
		});

		return buffer;
	} finally {
		await browser.close();
	}
}
