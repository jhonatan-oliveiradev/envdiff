import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ComparisonRequestSchema } from "@/lib/types";
import { comparePixels } from "@/lib/pixel-diff";
import { compareDom } from "@/lib/dom-diff";
import { writeFile, mkdir, readFile, access } from "fs/promises";
import { join } from "path";
import { chromium } from "playwright-core";
import chromiumPkg from "@sparticuz/chromium";

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
	let browser;
	try {
		const visualResults = [];

		// Em produção (Vercel), usa /tmp que é writable
		// Em desenvolvimento, usa public/screenshots
		const isProduction = process.env.VERCEL === "1";
		const screenshotsDir = isProduction
			? join("/tmp", "screenshots", comparisonId)
			: join(process.cwd(), "public", "screenshots", comparisonId);

		await mkdir(screenshotsDir, { recursive: true });

		// Inicia browser com configurações para Vercel
		const executablePath = isProduction
			? await chromiumPkg.executablePath()
			: undefined;

		browser = await chromium.launch({
			headless: true,
			executablePath,
			args: isProduction ? chromiumPkg.args : []
		});

		// --- AUTH / storageState handling ---
		// Diretório para armazenar storageState (persistência em /tmp)
		const authDir = isProduction
			? join("/tmp", "auth")
			: join(process.cwd(), "tmp", "auth");
		await mkdir(authDir, { recursive: true });

		// Usa uma chave global por ambiente (reutiliza entre comparações)
		const storagePath = join(authDir, "liferay-stg-session.json");

		// Função de login básica — ajusta seletores conforme seu Liferay
		async function performLogin(page: import("playwright-core").Page) {
			const loginUrl = process.env.LIFERAY_LOGIN_URL;
			const user = process.env.LIFERAY_USER;
			const pass = process.env.LIFERAY_PASS;
			const userSel =
				process.env.LIFERAY_USER_SELECTOR ?? 'input[name="login"]';
			const passSel =
				process.env.LIFERAY_PASS_SELECTOR ?? 'input[name="password"]';
			const submitSel =
				process.env.LIFERAY_SUBMIT_SELECTOR ?? 'button[type="submit"]';

			if (!loginUrl || !user || !pass) {
				console.warn(
					"⚠️  LIFERAY_LOGIN_URL/USER/PASS não configurados - pulando autenticação"
				);
				return; // Não faz login se não tiver credenciais
			}

			console.log(`🔐 Fazendo login no Liferay: ${loginUrl}`);
			await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 30000 });
			await page.fill(userSel, user);
			await page.fill(passSel, pass);
			await Promise.all([
				page.waitForNavigation({ waitUntil: "networkidle", timeout: 30000 }),
				page.click(submitSel)
			]);
			// Espera extra se Liferay redirecionar via JS
			await page.waitForTimeout(2000);
			console.log("✅ Login realizado com sucesso");
		}

		// Cria contexto reutilizando storageState se existir, senão faz login e salva
		let context;
		const hasAuth =
			process.env.LIFERAY_LOGIN_URL &&
			process.env.LIFERAY_USER &&
			process.env.LIFERAY_PASS;

		if (hasAuth) {
			try {
				await access(storagePath);
				// Arquivo existe -> reutiliza sessão
				console.log("♻️  Reutilizando sessão salva do Liferay");
				const raw = await readFile(storagePath, "utf8");
				const state = JSON.parse(raw);
				context = await browser.newContext({ storageState: state });
			} catch {
				// Não existe -> criar, logar e salvar
				console.log("🆕 Criando nova sessão no Liferay");
				context = await browser.newContext();
				const loginPage = await context.newPage();
				await performLogin(loginPage);
				// Salva estado para reaproveitamento
				await context.storageState({ path: storagePath });
				await loginPage.close();
				console.log("💾 Sessão salva em:", storagePath);
			}
		} else {
			// Sem autenticação configurada
			console.log("⚠️  Executando sem autenticação (URLs públicas)");
			context = await browser.newContext();
		}

		const page = await context.newPage();

		// Processa cada viewport
		for (const viewport of data.viewports) {
			const viewportKey = `${viewport.width}x${viewport.height}`;

			// Define viewport
			await page.setViewportSize(viewport);

			// Captura screenshot GREEN
			await page.goto(data.greenUrl, {
				waitUntil: "networkidle",
				timeout: 30000
			});

			// Aplica máscaras
			for (const selector of data.maskSelectors) {
				await page
					.$$eval(selector, (elements) => {
						elements.forEach((el) => {
							(el as HTMLElement).style.visibility = "hidden";
						});
					})
					.catch(() => {
						// Ignora se o seletor não for encontrado
					});
			}

			const greenScreenshot = await page.screenshot({ fullPage: true });

			// Captura screenshot BLUE
			await page.goto(data.blueUrl, {
				waitUntil: "networkidle",
				timeout: 30000
			});

			// Aplica máscaras
			for (const selector of data.maskSelectors) {
				await page
					.$$eval(selector, (elements) => {
						elements.forEach((el) => {
							(el as HTMLElement).style.visibility = "hidden";
						});
					})
					.catch(() => {
						// Ignora se o seletor não for encontrado
					});
			}

			const blueScreenshot = await page.screenshot({ fullPage: true });

			// Salva screenshots
			const greenPath = join(screenshotsDir, `green-${viewportKey}.png`);
			const bluePath = join(screenshotsDir, `blue-${viewportKey}.png`);
			const diffPath = join(screenshotsDir, `diff-${viewportKey}.png`);

			await writeFile(greenPath, greenScreenshot);
			await writeFile(bluePath, blueScreenshot);

			// Compara pixels
			const pixelComparison = comparePixels(
				greenScreenshot,
				blueScreenshot,
				data.pixelThreshold
			);

			// Salva diff visual
			await writeFile(diffPath, pixelComparison.diffBuffer);

			// Monta resultado para este viewport
			const visualResult = {
				viewport: viewportKey,
				greenUrl: isProduction
					? `/api/screenshots/${comparisonId}/green-${viewportKey}.png`
					: `/screenshots/${comparisonId}/green-${viewportKey}.png`,
				blueUrl: isProduction
					? `/api/screenshots/${comparisonId}/blue-${viewportKey}.png`
					: `/screenshots/${comparisonId}/blue-${viewportKey}.png`,
				diffUrl: isProduction
					? `/api/screenshots/${comparisonId}/diff-${viewportKey}.png`
					: `/screenshots/${comparisonId}/diff-${viewportKey}.png`,
				diffPixels: pixelComparison.diffPixels,
				diffPercentage: pixelComparison.diffPercentage,
				passed: pixelComparison.diffPercentage < 0.5 // 0.5% threshold
			};

			visualResults.push(visualResult);
		}

		// DOM comparison
		let domDiffResult = null;
		if (data.compareDom) {
			// Busca HTML de ambas as páginas
			await page.goto(data.greenUrl, {
				waitUntil: "networkidle",
				timeout: 30000
			});
			const greenHtml = await page.content();

			await page.goto(data.blueUrl, {
				waitUntil: "networkidle",
				timeout: 30000
			});
			const blueHtml = await page.content();

			domDiffResult = await compareDom(
				greenHtml,
				blueHtml,
				data.ignoreSelectors
			);
		}

		// Atualiza o registro com os resultados
		await prisma.comparison.update({
			where: { id: comparisonId },
			data: {
				status: "completed",
				visualResults: JSON.stringify(visualResults),
				domDiff: domDiffResult ? JSON.stringify(domDiffResult) : null
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
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
