export function LogoWordmark({
	className = "h-6 w-auto"
}: {
	className?: string;
}) {
	return (
		<svg
			className={className}
			viewBox="0 0 560 120"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="EnvDiff"
		>
			<rect width="560" height="120" fill="none" />
			{/* EnvDiff em foreground (branco/preto baseado no tema) */}
			<g style={{ fill: "var(--foreground)" }}>
				{/* E */}
				<path d="M20 25h60v24H52v10h24v22H52v12h28v24H20V25z" />
				{/* n */}
				<path d="M100 45h26v8c6-6 13-10 22-10 16 0 26 11 26 28v46h-28V77c0-7-4-11-10-11-6 0-10 4-10 11v40h-26V45z" />
				{/* v */}
				<path d="M186 45h26l14 38 14-38h26l-24 72h-32l-24-72z" />
				{/* D */}
				<path d="M282 25h40c28 0 48 18 48 46s-20 46-48 46h-40V25zm32 68h8c12 0 20-8 20-22s-8-22-20-22h-8v44z" />
				{/* i */}
				<path d="M382 25h28v18h-28V25zm0 20h28v72h-28V45z" />
				{/* f */}
				<path d="M428 25h28v20h12v22h-12v50h-28V67h-8V45h8V25z" />
				{/* f */}
				<path d="M486 25h28v20h12v22h-12v50h-28V67h-8V45h8V25z" />
			</g>
		</svg>
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
