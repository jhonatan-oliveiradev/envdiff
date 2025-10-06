"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function Home() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		greenUrl: "",
		blueUrl: "",
		pixelThreshold: 0.15,
		viewports: [{ width: 1366, height: 768 }],
		maskSelectors: "",
		ignoreSelectors: "",
		compareDom: false
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch("/api/compare", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					greenUrl: formData.greenUrl,
					blueUrl: formData.blueUrl,
					pixelThreshold: formData.pixelThreshold,
					viewports: formData.viewports,
					maskSelectors: formData.maskSelectors
						? formData.maskSelectors.split("\n").filter(Boolean)
						: [],
					ignoreSelectors: formData.ignoreSelectors
						? formData.ignoreSelectors.split("\n").filter(Boolean)
						: [],
					compareDom: formData.compareDom
				})
			});

			const data = await response.json();

			if (response.ok) {
				router.push(`/comparisons/${data.id}`);
			} else {
				alert(`Erro: ${data.error}`);
			}
		} catch (error) {
			console.error("Error creating comparison:", error);
			alert("Erro ao criar comparação");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-4xl space-y-8">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6 text-primary-foreground"
						>
							<path d="M21 12a9 9 0 1 1-6.219-8.56" />
							<circle cx="12" cy="12" r="1" />
						</svg>
					</div>
					<div className="flex-1">
						<h1 className="text-3xl font-bold tracking-tight">EnvDiff</h1>
						<p className="text-muted-foreground">
							Comparação automática de ambientes GREEN e BLUE
						</p>
					</div>
					<Link href="/compare/manual">
						<Button variant="outline" size="lg">
							<Upload className="w-4 h-4 mr-2" />
							Comparação Manual
						</Button>
					</Link>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Nova Comparação</CardTitle>
						<CardDescription>
							Insira as URLs dos ambientes para comparar visualmente e
							estruturalmente
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid gap-6 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="greenUrl">
										URL GREEN
										<Badge variant="secondary" className="ml-2">
											Ambiente 1
										</Badge>
									</Label>
									<Input
										id="greenUrl"
										type="url"
										placeholder="https://green.example.com"
										value={formData.greenUrl}
										onChange={(e) =>
											setFormData({ ...formData, greenUrl: e.target.value })
										}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="blueUrl">
										URL BLUE
										<Badge variant="secondary" className="ml-2">
											Ambiente 2
										</Badge>
									</Label>
									<Input
										id="blueUrl"
										type="url"
										placeholder="https://blue.example.com"
										value={formData.blueUrl}
										onChange={(e) =>
											setFormData({ ...formData, blueUrl: e.target.value })
										}
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="threshold">
									Threshold de Diferença:{" "}
									{(formData.pixelThreshold * 100).toFixed(0)}%
								</Label>
								<Slider
									id="threshold"
									min={0}
									max={1}
									step={0.05}
									value={[formData.pixelThreshold]}
									onValueChange={(value) =>
										setFormData({ ...formData, pixelThreshold: value[0] })
									}
								/>
								<p className="text-sm text-muted-foreground">
									Quanto menor, mais sensível às diferenças
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="maskSelectors">
									Máscaras (seletores CSS a ocultar)
								</Label>
								<textarea
									id="maskSelectors"
									className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									placeholder=".cookie-banner&#10;#carousel&#10;.ads"
									rows={3}
									value={formData.maskSelectors}
									onChange={(e) =>
										setFormData({ ...formData, maskSelectors: e.target.value })
									}
								/>
								<p className="text-sm text-muted-foreground">
									Um seletor por linha. Use para elementos dinâmicos (relógios,
									banners, etc)
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="ignoreSelectors">
									Ignorar Seletores (opcional)
								</Label>
								<textarea
									id="ignoreSelectors"
									className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									placeholder=".random-id&#10;[data-timestamp]"
									rows={3}
									value={formData.ignoreSelectors}
									onChange={(e) =>
										setFormData({
											...formData,
											ignoreSelectors: e.target.value
										})
									}
								/>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="compareDom"
									checked={formData.compareDom}
									onChange={(e) =>
										setFormData({ ...formData, compareDom: e.target.checked })
									}
									className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<Label htmlFor="compareDom" className="cursor-pointer">
									Comparar estrutura DOM (mais lento)
								</Label>
							</div>

							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? "Processando..." : "Comparar Agora"}
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Como funciona?</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-3">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
								1
							</div>
							<div>
								<h3 className="font-medium">Screenshots Automáticos</h3>
								<p className="text-sm text-muted-foreground">
									O sistema tira screenshots de ambos ambientes usando navegador
									automatizado
								</p>
							</div>
						</div>

						<div className="flex gap-3">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
								2
							</div>
							<div>
								<h3 className="font-medium">Comparação Pixel a Pixel</h3>
								<p className="text-sm text-muted-foreground">
									Compara as imagens e gera um heatmap das diferenças
									encontradas
								</p>
							</div>
						</div>

						<div className="flex gap-3">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
								3
							</div>
							<div>
								<h3 className="font-medium">Relatório Detalhado</h3>
								<p className="text-sm text-muted-foreground">
									Visualize as diferenças, percentual de mudança e detalhes
									estruturais
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
