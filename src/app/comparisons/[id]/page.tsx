"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface ViewportResult {
	viewport: { width: number; height: number };
	greenScreenshot: string;
	blueScreenshot: string;
	diffScreenshot: string;
	diffPercentage: number;
	diffPixels: number;
	totalPixels: number;
}

interface DomDiffItem {
	path: string;
	type: "added" | "removed" | "modified";
	before?: string;
	after?: string;
}

interface ComparisonData {
	id: string;
	status: string;
	greenUrl: string;
	blueUrl: string;
	visualResults?: ViewportResult[];
	domDiff?: DomDiffItem[];
	createdAt: string;
}

export default function ComparisonPage() {
	const params = useParams();
	const id = params?.id as string;
	const [data, setData] = useState<ComparisonData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		const fetchComparison = async () => {
			try {
				const response = await fetch(`/api/compare/${id}`);
				if (!response.ok) {
					throw new Error("Comparação não encontrada");
				}
				const result = await response.json();
				setData(result);

				// Se ainda está processando, fazer polling
				if (result.status === "processing" || result.status === "queued") {
					setTimeout(fetchComparison, 3000);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Erro desconhecido");
			} finally {
				setLoading(false);
			}
		};

		fetchComparison();
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen bg-background p-8">
				<div className="mx-auto max-w-6xl">
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<div className="text-center space-y-4">
								<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
								<p className="text-muted-foreground">
									Carregando comparação...
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="min-h-screen bg-background p-8">
				<div className="mx-auto max-w-6xl space-y-4">
					<Card>
						<CardContent className="py-12">
							<div className="text-center space-y-4">
								<p className="text-destructive">
									{error || "Comparação não encontrada"}
								</p>
								<Link href="/">
									<Button>Voltar ao início</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const getDiffBadge = (percentage: number) => {
		if (percentage < 1) {
			return (
				<Badge className="bg-green-500">OK - {percentage.toFixed(2)}%</Badge>
			);
		} else if (percentage < 5) {
			return (
				<Badge className="bg-yellow-500">
					Atenção - {percentage.toFixed(2)}%
				</Badge>
			);
		} else {
			return (
				<Badge className="bg-red-500">Alerta - {percentage.toFixed(2)}%</Badge>
			);
		}
	};

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-6xl space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<Link
							href="/"
							className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
						>
							← Voltar
						</Link>
						<h1 className="text-3xl font-bold tracking-tight">
							Resultado da Comparação
						</h1>
						<p className="text-muted-foreground mt-1">
							{data.status === "done"
								? "Comparação concluída"
								: "Processando..."}
						</p>
					</div>
					<Badge variant={data.status === "done" ? "default" : "secondary"}>
						{data.status}
					</Badge>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium">GREEN</CardTitle>
						</CardHeader>
						<CardContent>
							<a
								href={data.greenUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-primary hover:underline break-all"
							>
								{data.greenUrl}
							</a>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium">BLUE</CardTitle>
						</CardHeader>
						<CardContent>
							<a
								href={data.blueUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-primary hover:underline break-all"
							>
								{data.blueUrl}
							</a>
						</CardContent>
					</Card>
				</div>

				{data.status === "processing" || data.status === "queued" ? (
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<div className="text-center space-y-4">
								<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
								<p className="text-muted-foreground">
									Processando comparação...
								</p>
								<p className="text-sm text-muted-foreground">
									Isso pode levar alguns minutos
								</p>
							</div>
						</CardContent>
					</Card>
				) : data.status === "failed" ? (
					<Card>
						<CardContent className="py-12">
							<div className="text-center space-y-4">
								<p className="text-destructive">
									Falha ao processar comparação
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<Tabs defaultValue="visual" className="space-y-6">
						<TabsList>
							<TabsTrigger value="visual">Visual</TabsTrigger>
							{data.domDiff && <TabsTrigger value="dom">DOM</TabsTrigger>}
						</TabsList>

						<TabsContent value="visual" className="space-y-6">
							{data.visualResults?.map((result, index) => (
								<Card key={index}>
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle>
												{result.viewport.width}x{result.viewport.height}
											</CardTitle>
											{getDiffBadge(result.diffPercentage)}
										</div>
										<CardDescription>
											{result.diffPixels.toLocaleString()} pixels diferentes de{" "}
											{result.totalPixels.toLocaleString()} totais
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="grid gap-4 md:grid-cols-3">
											<div className="space-y-2">
												<h3 className="text-sm font-medium">GREEN</h3>
												<div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
													<Image
														src={result.greenScreenshot}
														alt="GREEN screenshot"
														fill
														className="object-contain"
														unoptimized
													/>
												</div>
											</div>

											<div className="space-y-2">
												<h3 className="text-sm font-medium">BLUE</h3>
												<div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
													<Image
														src={result.blueScreenshot}
														alt="BLUE screenshot"
														fill
														className="object-contain"
														unoptimized
													/>
												</div>
											</div>

											<div className="space-y-2">
												<h3 className="text-sm font-medium">Diferenças</h3>
												<div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
													<Image
														src={result.diffScreenshot}
														alt="Diff screenshot"
														fill
														className="object-contain"
														unoptimized
													/>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</TabsContent>

						{data.domDiff && (
							<TabsContent value="dom">
								<Card>
									<CardHeader>
										<CardTitle>Diferenças no DOM</CardTitle>
										<CardDescription>
											{data.domDiff.length} diferenças encontradas
										</CardDescription>
									</CardHeader>
									<CardContent>
										{data.domDiff.length === 0 ? (
											<p className="text-muted-foreground">
												Nenhuma diferença no DOM
											</p>
										) : (
											<div className="space-y-2">
												{data.domDiff.map((diff, index) => (
													<div
														key={index}
														className="rounded-lg border p-3 text-sm"
													>
														<div className="flex items-center gap-2 mb-1">
															<Badge variant="outline">{diff.type}</Badge>
															<code className="text-xs">{diff.path}</code>
														</div>
														{diff.before && (
															<div className="text-red-500">
																- {diff.before}
															</div>
														)}
														{diff.after && (
															<div className="text-green-500">
																+ {diff.after}
															</div>
														)}
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>
						)}
					</Tabs>
				)}
			</div>
		</div>
	);
}
