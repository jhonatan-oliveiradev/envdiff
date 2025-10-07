import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Configuração mínima - Vercel Blob lida com uploads
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.public.blob.vercel-storage.com"
			}
		]
	}
};

export default nextConfig;