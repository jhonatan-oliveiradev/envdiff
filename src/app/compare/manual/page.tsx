/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManualComparePage() {
	const router = useRouter();
	const [greenImage, setGreenImage] = useState<File | null>(null);
	const [blueImage, setBlueImage] = useState<File | null>(null);
	const [greenPreview, setGreenPreview] = useState<string>("");
	const [bluePreview, setBluePreview] = useState<string>("");
	const [pixelThreshold, setPixelThreshold] = useState(0.15);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState("");
	const [greenDragActive, setGreenDragActive] = useState(false);
	const [blueDragActive, setBlueDragActive] = useState(false);

	const handleImageUpload = (file: File, type: "green" | "blue") => {
		// Valida tipo de arquivo
		if (!file.type.startsWith("image/")) {
			setError("Por favor, selecione uma imagem válida (PNG, JPG, etc)");
			return;
		}

		// Valida tamanho do arquivo (máximo 20MB - Vercel Blob com multipart)
		const maxSize = 20 * 1024 * 1024; // 20MB em bytes
		if (file.size > maxSize) {
			setError(
				`A imagem ${type === "green" ? "GREEN" : "BLUE"} é muito grande. Tamanho máximo: 20MB. Tamanho atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`
			);
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			if (type === "green") {
				setGreenImage(file);
				setGreenPreview(reader.result as string);
			} else {
				setBlueImage(file);
				setBluePreview(reader.result as string);
			}
			setError("");
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

		try {
			const formData = new FormData();
			formData.append("greenImage", greenImage);
			formData.append("blueImage", blueImage);
			formData.append("pixelThreshold", pixelThreshold.toString());

			const response = await fetch("/api/compare/manual", {
				method: "POST",
				body: formData
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Erro ao processar comparação");
			}

			const result = await response.json();
			router.push(`/comparisons/${result.id}`);
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
					<Label className="text-base font-semibold mb-4 block">
						Sensibilidade de Detecção
					</Label>
					<div className="space-y-4">
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
