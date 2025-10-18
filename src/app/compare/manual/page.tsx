/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ComparisonResult {
	viewport: { width: number; height: number };
	greenScreenshot: string;
	blueScreenshot: string;
	diffScreenshot: string;
	diffPixels: number;
	totalPixels: number;
	diffPercentage: number;
}

export default function ManualComparePage() {
	const [greenImage, setGreenImage] = useState<File | null>(null);
	const [blueImage, setBlueImage] = useState<File | null>(null);
	const [greenPreview, setGreenPreview] = useState<string>("");
	const [bluePreview, setBluePreview] = useState<string>("");
	const [pixelThreshold, setPixelThreshold] = useState(0.15);
	const [strictDimensions, setStrictDimensions] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState("");
	const [greenDragActive, setGreenDragActive] = useState(false);
	const [blueDragActive, setBlueDragActive] = useState(false);
	const [result, setResult] = useState<ComparisonResult | null>(null);

	const handleImageUpload = (file: File, type: "green" | "blue") => {
		// Valida tipo de arquivo
		if (!file.type.startsWith("image/")) {
			setError("Por favor, selecione uma imagem válida (PNG, JPG, etc)");
			return;
		}

		// Valida tamanho do arquivo (máximo 20MB antes da compressão)
		const maxSize = 20 * 1024 * 1024; // 20MB em bytes
		if (file.size > maxSize) {
			setError(
				`A imagem ${type === "green" ? "GREEN" : "BLUE"} é muito grande. Tamanho máximo: 20MB. Tamanho atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`
			);
			return;
		}

		// Comprime a imagem para caber no limite do Vercel (4MB)
		const img = new Image();
		const reader = new FileReader();

		reader.onloadend = () => {
			img.src = reader.result as string;
		};

		img.onload = () => {
			// Cria canvas para redimensionar/comprimir
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				setError("Erro ao processar imagem");
				return;
			}

			// Calcula dimensões mantendo aspect ratio
			let width = img.width;
			let height = img.height;
			const maxDimension = 1920; // Máximo 1920px

			if (width > maxDimension || height > maxDimension) {
				if (width > height) {
					height = (height / width) * maxDimension;
					width = maxDimension;
				} else {
					width = (width / height) * maxDimension;
					height = maxDimension;
				}
			}

			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(img, 0, 0, width, height);

			// Converte para blob com qualidade ajustada (sempre PNG para compatibilidade com servidor)
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						setError("Erro ao comprimir imagem");
						return;
					}

					const compressedFile = new File(
						[blob],
						file.name.replace(/\.[^.]+$/, ".png"),
						{
							type: "image/png"
						}
					);

					if (type === "green") {
						setGreenImage(compressedFile);
						setGreenPreview(URL.createObjectURL(blob));
					} else {
						setBlueImage(compressedFile);
						setBluePreview(URL.createObjectURL(blob));
					}
					setError("");
				},
				"image/png" // Sempre PNG para compatibilidade
			);
		};

		reader.readAsDataURL(file);
	};

	const handleDrag = (
		e: React.DragEvent,
		type: "green" | "blue",
		isEnter: boolean
	) => {
		e.preventDefault();
		e.stopPropagation();

		if (type === "green") {
			setGreenDragActive(isEnter);
		} else {
			setBlueDragActive(isEnter);
		}
	};

	const handleDrop = (e: React.DragEvent, type: "green" | "blue") => {
		e.preventDefault();
		e.stopPropagation();

		if (type === "green") {
			setGreenDragActive(false);
		} else {
			setBlueDragActive(false);
		}

		const file = e.dataTransfer.files?.[0];
		if (file) {
			handleImageUpload(file, type);
		}
	};

	const handleCompare = async () => {
		if (!greenImage || !blueImage) {
			setError("Por favor, faça upload das duas imagens");
			return;
		}

		setIsProcessing(true);
		setError("");
		setResult(null); // Limpa resultado anterior

		try {
			const formData = new FormData();
			formData.append("greenImage", greenImage);
			formData.append("blueImage", blueImage);
			formData.append("pixelThreshold", pixelThreshold.toString());
			formData.append("strictDimensions", strictDimensions.toString());

			const response = await fetch("/api/compare/manual", {
				method: "POST",
				body: formData
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Erro ao processar comparação");
			}

			const comparisonResult = await response.json();
			setResult(comparisonResult); // Armazena o resultado para exibir inline
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro desconhecido");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-12">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">
						Comparação Manual de Screenshots
					</h1>
					<p className="text-muted-foreground">
						Faça upload de duas imagens para comparar visualmente. As diferenças
						serão destacadas em vermelho.
					</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
						<p className="text-red-500 text-sm">{error}</p>
					</div>
				)}

				{/* Upload Areas */}
				<div className="grid md:grid-cols-2 gap-6 mb-8">
					{/* GREEN Upload */}
					<Card className="p-6">
						<Label className="text-lg font-semibold mb-4 block">
							Screenshot GREEN
						</Label>

						{!greenPreview ? (
							<label className="cursor-pointer">
								<div
									className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
										greenDragActive
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/50"
									}`}
									onDragEnter={(e) => handleDrag(e, "green", true)}
									onDragLeave={(e) => handleDrag(e, "green", false)}
									onDragOver={(e) => e.preventDefault()}
									onDrop={(e) => handleDrop(e, "green")}
								>
									<Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
									<p className="text-sm text-muted-foreground mb-2">
										Clique ou arraste uma imagem aqui
									</p>
									<p className="text-xs text-muted-foreground">
										PNG, JPG ou WebP
									</p>
								</div>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleImageUpload(file, "green");
									}}
								/>
							</label>
						) : (
							<div className="space-y-4">
								<div className="relative rounded-lg overflow-hidden border border-border">
									<img
										src={greenPreview}
										alt="Green preview"
										className="w-full h-auto"
									/>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="w-full"
									onClick={() => {
										setGreenImage(null);
										setGreenPreview("");
									}}
								>
									<Upload className="w-4 h-4 mr-2" />
									Trocar Imagem
								</Button>
								<p className="text-xs text-muted-foreground text-center">
									{greenImage?.name}
								</p>
							</div>
						)}
					</Card>

					{/* BLUE Upload */}
					<Card className="p-6">
						<Label className="text-lg font-semibold mb-4 block">
							Screenshot BLUE
						</Label>

						{!bluePreview ? (
							<label className="cursor-pointer">
								<div
									className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
										blueDragActive
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/50"
									}`}
									onDragEnter={(e) => handleDrag(e, "blue", true)}
									onDragLeave={(e) => handleDrag(e, "blue", false)}
									onDragOver={(e) => e.preventDefault()}
									onDrop={(e) => handleDrop(e, "blue")}
								>
									<Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
									<p className="text-sm text-muted-foreground mb-2">
										Clique ou arraste uma imagem aqui
									</p>
									<p className="text-xs text-muted-foreground">
										PNG, JPG ou WebP
									</p>
								</div>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleImageUpload(file, "blue");
									}}
								/>
							</label>
						) : (
							<div className="space-y-4">
								<div className="relative rounded-lg overflow-hidden border border-border">
									<img
										src={bluePreview}
										alt="Blue preview"
										className="w-full h-auto"
									/>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="w-full"
									onClick={() => {
										setBlueImage(null);
										setBluePreview("");
									}}
								>
									<Upload className="size-4 mr-2" />
									Trocar Imagem
								</Button>
								<p className="text-xs text-muted-foreground text-center">
									{blueImage?.name}
								</p>
							</div>
						)}
					</Card>
				</div>

				{/* Settings */}
				<Card className="p-6 mb-8">
					<Label className="text-base font-semibold mb-6 block">
						Configurações de Comparação
					</Label>
					<div className="space-y-6">
						{/* Sensibilidade de Detecção */}
						<div className="space-y-4">
							<Label className="text-sm font-medium">
								Sensibilidade de Detecção
							</Label>
							<div className="flex items-center gap-4">
								<Slider
									value={[pixelThreshold]}
									onValueChange={(value) => setPixelThreshold(value[0])}
									min={0}
									max={1}
									step={0.01}
									className="flex-1"
								/>
								<span className="text-sm font-mono w-12 text-right">
									{pixelThreshold.toFixed(2)}
								</span>
							</div>
							<p className="text-xs text-muted-foreground">
								Valores menores = mais sensível (detecta pequenas diferenças).
								Valores maiores = menos sensível (ignora pequenas variações).
							</p>
						</div>

						{/* Validação de Dimensões */}
						<div className="flex items-center justify-between space-x-4 pt-4 border-t">
							<div className="flex-1 space-y-1">
								<Label
									htmlFor="strict-dimensions"
									className="text-sm font-medium cursor-pointer"
								>
									Validação Estrita de Dimensões
								</Label>
								<p className="text-xs text-muted-foreground">
									Quando ativado, aceita diferença de até 3px nas dimensões.
									Desative para comparar imagens com dimensões diferentes.
								</p>
							</div>
							<Switch
								id="strict-dimensions"
								checked={strictDimensions}
								onCheckedChange={setStrictDimensions}
							/>
						</div>
					</div>
				</Card>

				{/* Compare Button */}
				<Button
					onClick={handleCompare}
					disabled={!greenImage || !blueImage || isProcessing}
					className="w-full h-12 text-lg"
					size="lg"
				>
					{isProcessing ? (
						<>
							<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
							Processando...
						</>
					) : (
						<>
							<ImageIcon className="w-5 h-5 mr-2" />
							Comparar Imagens
						</>
					)}
				</Button>

				{/* Resultado da Comparação */}
				{result && (
					<Card className="mt-8 p-6">
						<h2 className="text-2xl font-bold mb-4">Resultado da Comparação</h2>

						<div className="mb-4 p-4 bg-muted rounded-lg">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-muted-foreground">Dimensões:</span>
									<p className="font-mono font-semibold">
										{result.viewport.width}x{result.viewport.height}
									</p>
								</div>
								<div>
									<span className="text-muted-foreground">Diferença:</span>
									<p className="font-mono font-semibold text-red-500">
										{result.diffPercentage.toFixed(2)}%
									</p>
								</div>
								<div>
									<span className="text-muted-foreground">
										Pixels diferentes:
									</span>
									<p className="font-mono font-semibold">
										{result.diffPixels.toLocaleString()}
									</p>
								</div>
								<div>
									<span className="text-muted-foreground">
										Total de pixels:
									</span>
									<p className="font-mono font-semibold">
										{result.totalPixels.toLocaleString()}
									</p>
								</div>
							</div>
						</div>

						<div className="grid md:grid-cols-3 gap-4">
							<div>
								<h3 className="text-sm font-semibold mb-2">GREEN</h3>
								<img
									src={result.greenScreenshot}
									alt="GREEN screenshot"
									className="w-full border rounded"
								/>
							</div>
							<div>
								<h3 className="text-sm font-semibold mb-2">BLUE</h3>
								<img
									src={result.blueScreenshot}
									alt="BLUE screenshot"
									className="w-full border rounded"
								/>
							</div>
							<div>
								<h3 className="text-sm font-semibold mb-2 text-red-500">
									DIFF
								</h3>
								<img
									src={result.diffScreenshot}
									alt="DIFF screenshot"
									className="w-full border rounded"
								/>
							</div>
						</div>
					</Card>
				)}

				{/* Info Box */}
				<div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
					<h3 className="font-semibold mb-2 text-blue-400">💡 Como funciona</h3>
					<ul className="text-sm text-muted-foreground space-y-1">
						<li>• Faça upload de dois screenshots para comparar</li>
						<li>• Ajuste a sensibilidade conforme necessário</li>
						<li>• As áreas diferentes serão destacadas em vermelho</li>
						<li>• Você verá a porcentagem de diferença calculada</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
