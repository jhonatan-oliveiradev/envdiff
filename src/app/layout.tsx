import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter"
});

export const metadata: Metadata = {
	title: "EnvDiff - Environment Comparison Tool",
	description: "Compare GREEN and BLUE environments visually and structurally",
	icons: {
		icon: [{ url: "/icon.svg", type: "image/svg+xml" }]
	},
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "EnvDiff"
	},
	applicationName: "EnvDiff",
	themeColor: "#0a0a0a",
	viewport: {
		width: "device-width",
		initialScale: 1,
		maximumScale: 1
	}
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning className="dark">
			<head>
				<link rel="apple-touch-icon" href="/icon-192x192.png" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="EnvDiff" />
				<meta name="mobile-web-app-capable" content="yes" />
			</head>
			<body className={`${inter.variable} font-sans antialiased`}>
				{children}
				<PWAInstallPrompt />
			</body>
		</html>
	);
}
