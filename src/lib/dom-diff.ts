import { JSDOM } from "jsdom";

export interface DomDiffItem {
	path: string;
	type: "added" | "removed" | "modified";
	before?: string;
	after?: string;
}

export async function compareDom(
	htmlA: string,
	htmlB: string,
	ignoreAttributes: string[] = ["id", "data-*", "aria-*"]
): Promise<DomDiffItem[]> {
	const domA = new JSDOM(htmlA);
	const domB = new JSDOM(htmlB);

	const normalizeNode = (doc: Document) => {
		const walker = doc.createTreeWalker(doc.body, 1); // NodeFilter.SHOW_ELEMENT

		let node: Node | null;
		while ((node = walker.nextNode())) {
			if (node.nodeType === 1) {
				// Element node
				const element = node as Element;

				// Remove atributos ignorados
				for (const attr of ignoreAttributes) {
					if (attr.endsWith("*")) {
						const prefix = attr.slice(0, -1);
						const attrsToRemove: string[] = [];
						for (let i = 0; i < element.attributes.length; i++) {
							const attrName = element.attributes[i].name;
							if (attrName.startsWith(prefix)) {
								attrsToRemove.push(attrName);
							}
						}
						attrsToRemove.forEach((a) => element.removeAttribute(a));
					} else {
						element.removeAttribute(attr);
					}
				}

				// Normaliza espaços em branco no texto
				if (element.textContent) {
					element.textContent = element.textContent.trim().replace(/\s+/g, " ");
				}
			}
		}
	};

	normalizeNode(domA.window.document);
	normalizeNode(domB.window.document);

	// Compara as estruturas HTML normalizadas
	const htmlANormalized = domA.window.document.body.innerHTML;
	const htmlBNormalized = domB.window.document.body.innerHTML;

	const diffs: DomDiffItem[] = [];

	if (htmlANormalized !== htmlBNormalized) {
		// Implementação simples: compara linha por linha
		const linesA = htmlANormalized.split("\n");
		const linesB = htmlBNormalized.split("\n");

		const maxLines = Math.max(linesA.length, linesB.length);

		for (let i = 0; i < maxLines; i++) {
			const lineA = linesA[i] || "";
			const lineB = linesB[i] || "";

			if (lineA !== lineB) {
				if (!lineA) {
					diffs.push({
						path: `line:${i + 1}`,
						type: "added",
						after: lineB
					});
				} else if (!lineB) {
					diffs.push({
						path: `line:${i + 1}`,
						type: "removed",
						before: lineA
					});
				} else {
					diffs.push({
						path: `line:${i + 1}`,
						type: "modified",
						before: lineA,
						after: lineB
					});
				}
			}
		}
	}

	return diffs;
}
