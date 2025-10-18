# EnvDiff 🔍

<div align="center">
  <img src="public/logo-dark.svg" alt="EnvDiff Logo" height="80" />
  
  <p><strong>Environment Comparison Tool</strong></p>
  <p>Comparação automática de ambientes web GREEN e BLUE</p>
  
  <p>
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-stack-tecnológica">Stack</a> •
    <a href="#-início-rápido">Quick Start</a> •
    <a href="LOGO.md">Brand Guidelines</a>
  </p>
</div>

---

## 🎯 Problema que Resolve

Durante o processo de "freezing" e sincronização entre ambientes GREEN e BLUE no Liferay (ou qualquer outro sistema), é necessário validar que todo o conteúdo foi replicado corretamente antes do sync final. O método manual é trabalhoso e sujeito a erros humanos. **EnvDiff automatiza esse processo**.

## ✨ Funcionalidades

### MVP (Implementado)

- ✅ **Screenshots Automáticos**: Usa Playwright para capturar screenshots determinísticos
- ✅ **Comparação Manual**: Upload de 2 screenshots para comparação direta (sem autenticação)
- ✅ **Comparação Pixel a Pixel**: Algoritmo de diff visual com pixelmatch
- ✅ **Máscaras Customizáveis**: Oculte elementos dinâmicos (relógios, carrosséis, banners)
- ✅ **Comparação DOM**: Analisa diferenças estruturais no HTML
- ✅ **Relatórios Visuais**: Interface intuitiva para visualizar diferenças
- ✅ **Múltiplos Viewports**: Suporte para desktop (1366x768)
- ✅ **Autenticação Liferay**: Login automático em ambientes STG protegidos
- ✅ **PWA (Progressive Web App)**: Instale como app nativo no seu dispositivo
- ✅ **Uso Offline**: Funcionalidades básicas disponíveis sem internet
- ✅ **Tolerância de Dimensões**: Aceita até 3px de diferença nas dimensões das imagens

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
- **Design System**: RIMG+ compatible (#0A66FF blue)
- **Fonte**: Inter (Google Fonts)
- **Automação**: Playwright (screenshots)
- **Comparação Visual**: pixelmatch + pngjs
- **Comparação DOM**: JSDOM
- **Banco de Dados**: Prisma + PostgreSQL (NeonDB)
- **Linguagem**: TypeScript

## 🎨 Identidade Visual

O **EnvDiff** usa um design minimalista com o símbolo matemático **≠** (não igual) como elemento central da marca, representando a essência da comparação de diferenças.

**Recursos visuais:**
- 📄 [Brand Guidelines](LOGO.md) - Documentação completa do logo
- 🔵 Cor primária: `#0A66FF` (Círculo do ícone)
- 🎀 Cor accent: `#FF3264` (Borda do ícone)
- � Responsivo: Logo adapta-se a diferentes tamanhos

**Componentes disponíveis:**
- `<LogoWordmark />` - Ícone circular + texto "EnvDiff" (responsivo)
- `<LogoMonogram />` - Logo compacto "E + ≠"
- `<LogoIcon />` - Ícone circular puro (símbolo ≠)

## 🚀 Como Usar

### Opção 1: Comparação Manual (Sem Autenticação) ⚡

**Perfeito para testar sem configurar autenticação!**

1. Acesse `/compare/manual`
2. Faça upload de dois screenshots (GREEN e BLUE)
3. Ajuste a sensibilidade (opcional)
4. Clique em "Comparar Imagens"
5. Veja as diferenças destacadas em vermelho

📖 **Documentação**: [MANUAL_COMPARISON.md](./MANUAL_COMPARISON.md)

### Opção 2: Comparação Automática (Com URLs)

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
DATABASE_URL="postgresql://..."
```

### 🔐 Autenticação no Liferay STG

Se os ambientes GREEN/BLUE exigem autenticação, configure as variáveis:

```env
LIFERAY_LOGIN_URL=https://seu-liferay-stg.com/c/portal/login
LIFERAY_USER=service.account@empresa.com
LIFERAY_PASS=sua-senha-segura
```

📖 **Documentação completa**: [LIFERAY_AUTH.md](./LIFERAY_AUTH.md)

**Recursos:**
- ✅ Login automático via Playwright
- ✅ Reutilização de sessão (storage state)
- ✅ Suporte a seletores customizados
- ✅ Fallback para URLs públicas

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

## 📱 Progressive Web App (PWA)

O **EnvDiff** pode ser instalado como um aplicativo nativo no seu dispositivo!

### Benefícios do PWA

- ⚡ **Acesso Rápido**: Ícone na tela inicial do dispositivo
- 📴 **Uso Offline**: Funcionalidades básicas disponíveis sem internet
- 🚀 **Desempenho**: Carregamento mais rápido com cache inteligente
- 📱 **Experiência Nativa**: Interface sem barras do navegador

### Como Instalar

#### No Desktop (Chrome/Edge)

1. Acesse o EnvDiff
2. Clique no ícone de instalação (➕) na barra de endereços
3. Ou clique no prompt que aparece no canto inferior direito
4. Confirme a instalação

#### No Mobile (Android/iOS)

**Android (Chrome):**
1. Acesse o EnvDiff
2. Toque no menu (⋮) > "Instalar app" ou "Adicionar à tela inicial"
3. Confirme a instalação

**iOS (Safari):**
1. Acesse o EnvDiff
2. Toque em "Compartilhar" (📤)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Confirme

### Recursos PWA

- ✅ Ícones otimizados (192x192, 512x512)
- ✅ Service Worker para cache
- ✅ Manifest.json configurado
- ✅ Prompt de instalação customizado
- ✅ Suporte offline para páginas visitadas

### Gerando Ícones PWA

Se precisar regenerar os ícones:

```bash
npm run generate:icons
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
