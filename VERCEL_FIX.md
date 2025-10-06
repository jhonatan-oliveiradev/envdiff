# 🔧 Correções para Vercel Serverless

## Problema Identificado

A aplicação estava falhando em produção com erro **"Falha ao processar comparação"** porque:

1. **Playwright não funciona** diretamente no ambiente serverless do Vercel
2. **File system é read-only** - não é possível escrever em `public/screenshots/`
3. O Chromium não estava instalado no ambiente serverless

## Soluções Implementadas

### 1. Instalação de Pacotes para Serverless

```bash
npm install @sparticuz/chromium playwright-core
```

- **@sparticuz/chromium**: Fornece binário do Chromium otimizado para AWS Lambda/Vercel
- **playwright-core**: Versão leve do Playwright sem baixar browsers

### 2. Configuração Dinâmica de Ambiente

```typescript
const isProduction = process.env.VERCEL === "1";

// Screenshots vão para /tmp em produção (único diretório writable no Vercel)
const screenshotsDir = isProduction
	? join("/tmp", "screenshots", comparisonId)
	: join(process.cwd(), "public", "screenshots", comparisonId);
```

### 3. Chromium com Executable Path

```typescript
import { chromium } from "playwright-core";
import chromiumPkg from "@sparticuz/chromium";

const executablePath = isProduction
	? await chromiumPkg.executablePath()
	: undefined;

browser = await chromium.launch({
	headless: true,
	executablePath,
	args: isProduction ? chromiumPkg.args : []
});
```

### 4. API para Servir Screenshots

Criada rota `/api/screenshots/[comparisonId]/[filename]/route.ts`:

```typescript
// Serve imagens do /tmp em produção
export async function GET(request, { params }) {
	const filePath = isProduction
		? join("/tmp", "screenshots", comparisonId, filename)
		: join(process.cwd(), "public", "screenshots", comparisonId, filename);
	
	const fileBuffer = await readFile(filePath);
	
	return new NextResponse(fileBuffer, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable"
		}
	});
}
```

### 5. Correções de Código

- ✅ Removido import não usado (`takeScreenshot`)
- ✅ Corrigidas chamadas de função para corresponder às assinaturas reais
- ✅ Removidos campos inexistentes do Prisma (`completedAt`, `error`)
- ✅ Adicionado `finally` block para fechar browser
- ✅ Screenshot inline em vez de função externa

## Arquivos Modificados

1. **src/app/api/compare/route.ts** (principal)
   - Import de `playwright-core` e `@sparticuz/chromium`
   - Detecção de ambiente de produção
   - Screenshots salvos em `/tmp`
   - Browser launch configurado para serverless

2. **src/app/api/screenshots/[comparisonId]/[filename]/route.ts** (novo)
   - GET endpoint para servir screenshots
   - Lê de `/tmp` em produção
   - Headers de cache otimizados

3. **package.json**
   - Adicionadas dependências: `@sparticuz/chromium`, `playwright-core`

## Como Funciona Agora

### Desenvolvimento Local
```
1. Screenshots → public/screenshots/[id]/
2. URLs → /screenshots/[id]/green-1920x1080.png
3. Chromium → playwright instalado localmente
```

### Produção (Vercel)
```
1. Screenshots → /tmp/screenshots/[id]/
2. URLs → /api/screenshots/[id]/green-1920x1080.png
3. Chromium → @sparticuz/chromium binário serverless
```

## Limitações do Vercel Serverless

⚠️ **Tempo de execução**: Máximo 10 segundos (Hobby) ou 60 segundos (Pro)
⚠️ **Memória**: 1024 MB (Hobby) ou 3008 MB (Pro)
⚠️ **/tmp storage**: Máximo 512 MB
⚠️ **Tamanho do deployment**: Máximo 250 MB

## Próximos Passos

Se você tiver problemas de performance ou timeout:

1. **Usar fila de processamento** (Bull, BullMQ)
2. **Armazenar screenshots** em Vercel Blob Storage ou S3
3. **Considerar upgrade** para Vercel Pro para timeouts maiores
4. **Processar em background** com webhook/callback

## Teste Local

```bash
# Simular ambiente de produção localmente
VERCEL=1 npm run dev

# Verificar se screenshots vão para /tmp
ls -la /tmp/screenshots/
```

## Teste em Produção

1. Acesse: https://envdiff.vercel.app
2. Preencha os campos:
   - GREEN: `https://liferay.design/lexicon/`
   - BLUE: `https://liferay.design/lexicon-1/`
3. Clique em "Iniciar Comparação"
4. Aguarde processamento (pode levar 30-60 segundos)
5. Verifique logs no Vercel Dashboard se houver erro

## Comandos Git

```bash
# Commit já feito:
git log --oneline -1
# de5726e fix: Configure Playwright for Vercel serverless with @sparticuz/chromium

# Push já enviado para GitHub
# Vercel irá fazer deploy automático
```

## Verificar Deploy

1. Acesse: https://vercel.com/seu-usuario/envdiff
2. Vá em "Deployments" → Último deploy
3. Clique em "View Build Logs"
4. Procure por:
   - ✅ `Installing @sparticuz/chromium`
   - ✅ `Build Completed`
   - ❌ Erros de instalação do Chromium

---

**Status**: ✅ Correções aplicadas e enviadas para produção
**Próximo deploy**: Automático via GitHub → Vercel
**Tempo estimado**: ~3-5 minutos
