import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Configurações para upload de arquivos (Next.js 15+)
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb" // Limite de 10MB para uploads
		}
	},
	
	// Headers para permitir uploads maiores
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{
						key: "Access-Control-Allow-Origin",
						value: "*"
					},
					{
						key: "Access-Control-Allow-Methods", 
						value: "GET, POST, PUT, DELETE, OPTIONS"
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "Content-Type, Authorization"
					}
				]
			}
		];
	}
};

export default nextConfig;
