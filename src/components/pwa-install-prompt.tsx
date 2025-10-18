"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
	const [showPrompt, setShowPrompt] = useState(false);
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

	useEffect(() => {
		const handler = (e: Event) => {
			// Previne o prompt automático do Chrome
			e.preventDefault();
			// Armazena o evento para usar depois
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			// Mostra nosso prompt customizado
			setShowPrompt(true);
		};

		window.addEventListener("beforeinstallprompt", handler);

		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) return;

		// Mostra o prompt de instalação
		deferredPrompt.prompt();

		// Aguarda a escolha do usuário
		const { outcome } = await deferredPrompt.userChoice;
		
		console.log(`User response to install prompt: ${outcome}`);

		// Limpa o prompt
		setDeferredPrompt(null);
		setShowPrompt(false);
	};

	const handleDismiss = () => {
		setShowPrompt(false);
		// Salva no localStorage que o usuário dispensou
		localStorage.setItem("pwa-prompt-dismissed", "true");
	};

	// Não mostra se já foi dispensado ou se não há prompt
	if (!showPrompt || localStorage.getItem("pwa-prompt-dismissed")) {
		return null;
	}

	return (
		<Card className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 p-4 shadow-lg border-2 border-primary/50 bg-card z-50">
			<button
				onClick={handleDismiss}
				className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
				aria-label="Fechar"
			>
				<X className="w-4 h-4" />
			</button>

			<div className="flex items-start gap-3 mb-3">
				<div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
					<Download className="w-6 h-6 text-primary-foreground" />
				</div>
				<div>
					<h3 className="font-semibold text-sm mb-1">Instalar EnvDiff</h3>
					<p className="text-xs text-muted-foreground">
						Instale o app para acesso rápido e use offline
					</p>
				</div>
			</div>

			<div className="flex gap-2">
				<Button
					onClick={handleInstall}
					size="sm"
					className="flex-1"
				>
					Instalar
				</Button>
				<Button
					onClick={handleDismiss}
					variant="outline"
					size="sm"
					className="flex-1"
				>
					Agora não
				</Button>
			</div>
		</Card>
	);
}
