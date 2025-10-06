# EnvDiff 🔍

**EnvDiff** é uma ferramenta de comparação automática de ambientes web (GREEN e BLUE), especialmente projetada para validação de sincronização entre ambientes de pré-produção e produção.

## 🎯 Problema que Resolve

Durante o processo de "freezing" e sincronização entre ambientes GREEN e BLUE no Liferay (ou qualquer outro sistema), é necessário validar que todo o conteúdo foi replicado corretamente antes do sync final. O método manual é trabalhoso e sujeito a erros humanos. **EnvDiff automatiza esse processo**.

## ✨ Funcionalidades

### MVP (Implementado)

- ✅ **Screenshots Automáticos**: Usa Playwright para capturar screenshots determinísticos
- ✅ **Comparação Pixel a Pixel**: Algoritmo de diff visual com pixelmatch
- ✅ **Máscaras Customizáveis**: Oculte elementos dinâmicos (relógios, carrosséis, banners)
- ✅ **Comparação DOM**: Analisa diferenças estruturais no HTML
- ✅ **Relatórios Visuais**: Interface intuitiva para visualizar diferenças
- ✅ **Múltiplos Viewports**: Suporte para desktop (1366x768)

### Próximas Funcionalidades

- ⏳ Mobile viewports (375x812, etc)
- ⏳ Comparação HTTP/Headers
- ⏳ Exportação de relatórios (PDF/ZIP/JSON)
- ⏳ Profiles de comparação por rota
- ⏳ Baseline/Golden screenshots
- ⏳ Extensão Chrome
- ⏳ CLI para CI/CD

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router) + React 19
- **Estilização**: TailwindCSS 4 + shadcn/ui
- **Fonte**: Inter (identidade visual RIMG+)
- **Automação**: Playwright (screenshots)
- **Comparação Visual**: pixelmatch + pngjs
- **Comparação DOM**: JSDOM
- **Banco de Dados**: Prisma + SQLite (migração fácil para Postgres)
- **Linguagem**: TypeScript

## 🚀 Como Usar

### Instalação

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npx prisma migrate dev

# Executar em desenvolvimento
npm run dev
```

### Criar uma Comparação

1. Acesse `http://localhost:3000`
2. Insira as URLs dos ambientes GREEN e BLUE
3. Configure:
   - **Threshold**: Sensibilidade às diferenças (0-100%)
   - **Máscaras**: Seletores CSS para ocultar elementos dinâmicos
   - **Comparar DOM**: Ative para análise estrutural
4. Clique em "Comparar Agora"
5. Aguarde o processamento (pode levar alguns minutos)
6. Visualize os resultados

### Exemplo de Máscaras

```
.cookie-banner
#carousel
.ads
[data-timestamp]
```

## 📊 Como Funciona

1. **Captura**: Playwright navega para ambas URLs e captura screenshots
2. **Normalização**: Remove animações e aplica máscaras
3. **Comparação**: pixelmatch compara pixel a pixel
4. **Análise DOM**: (Opcional) Compara estrutura HTML
5. **Relatório**: Gera visualização com heatmap de diferenças

## 🎨 Identidade Visual

EnvDiff mantém a identidade visual da **RIMG+**:
- **Cor Primária**: `#0A66FF` (Azul)
- **Fonte**: Inter
- **Tema**: Dark mode por padrão
- **Cards**: Blur leve, bordas arredondadas

## 📝 Interpretação dos Resultados

| Badge | Percentual | Significado |
|-------|-----------|-------------|
| 🟢 OK | < 1% | Ambientes praticamente idênticos |
| 🟡 Atenção | 1-5% | Pequenas diferenças (revisar) |
| 🔴 Alerta | > 5% | Diferenças significativas (ação necessária) |

## 🔧 Configuração Avançada

### Variáveis de Ambiente

O arquivo `.env` já foi criado com:

```env
DATABASE_URL="file:./dev.db"
```

### Migrar para PostgreSQL

1. Instale `pg`
2. Atualize `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Execute `npx prisma migrate dev`

## 📂 Estrutura do Projeto

```
envdiff/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Página principal (formulário)
│   │   ├── comparisons/[id]/     # Página de resultados
│   │   └── api/
│   │       └── compare/          # API de comparação
│   ├── lib/
│   │   ├── screenshot.ts         # Captura com Playwright
│   │   ├── pixel-diff.ts         # Comparação visual
│   │   ├── dom-diff.ts           # Comparação estrutural
│   │   └── prisma.ts             # Cliente Prisma
│   └── components/ui/            # Componentes shadcn/ui
├── prisma/
│   └── schema.prisma             # Schema do banco
└── public/
    └── screenshots/              # Screenshots gerados
```

---

**Desenvolvido com ❤️ para automatizar validações de ambiente**


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
