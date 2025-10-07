import Image from "next/image";

export function LogoWordmark({
	className = "h-6 w-auto"
}: {
	className?: string;
}) {
	return (
		<div className="flex items-center gap-2">
			<Image
				src={"/icon.svg"}
				alt="EnvDiff"
				width={120}
				height={30}
				className={`${className} border-2 border-white rounded-full`}
			/>
			<h2 className="font-extrabold text-4xl hidden md:block">EnvDiff</h2>
		</div>
	);
}

export function LogoMonogram({
	className = "h-10 w-10"
}: {
	className?: string;
}) {
	return (
		<svg
			className={className}
			viewBox="0 0 96 96"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="EnvDiff Icon"
		>
			<rect
				width="96"
				height="96"
				rx="16"
				style={{ fill: "var(--background)" }}
			/>
			{/* E em foreground (branco/preto baseado no tema) */}
			<path
				style={{ fill: "var(--foreground)" }}
				d="M20 24h40v16H36v6h20v14H36v8h24v16H20V24z"
			/>
			{/* Diff Symbol (≠) em primary (azul #0A66FF) */}
			<g style={{ fill: "var(--primary)" }}>
				{/* Linha diagonal */}
				<rect
					x="66"
					y="38"
					width="6"
					height="36"
					transform="rotate(20 69 56)"
				/>
				{/* Linhas horizontais do símbolo ≠ */}
				<rect x="58" y="44" width="28" height="6" />
				<rect x="58" y="60" width="28" height="6" />
			</g>
		</svg>
	);
}

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 64 64"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="EnvDiff"
		>
			{/* Círculo de fundo */}
			<circle cx="32" cy="32" r="32" style={{ fill: "var(--primary)" }} />
			{/* Símbolo ≠ em branco */}
			<g style={{ fill: "white" }}>
				{/* Linha diagonal */}
				<rect
					x="30"
					y="18"
					width="4"
					height="28"
					transform="rotate(20 32 32)"
				/>
				{/* Linhas horizontais */}
				<rect x="18" y="24" width="28" height="4" />
				<rect x="18" y="36" width="28" height="4" />
			</g>
		</svg>
	);
}
