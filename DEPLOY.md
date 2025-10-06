# 🚀 Deploy na Vercel

## Pré-requisitos

- ✅ Conta no GitHub
- ✅ Conta na Vercel
- ✅ Banco de dados PostgreSQL (NeonDB, Supabase, etc)

---

## Passo 1: Preparar o Banco de Dados

### Opção A: NeonDB (Recomendado)

1. Acesse [NeonDB](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Formato: `postgresql://user:password@host/database?sslmode=require`

### Opção B: Supabase

1. Acesse [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings → Database
4. Copie a "Connection String" (modo Session)

---

## Passo 2: Push para o GitHub

```bash
# Se ainda não commitou
git add .
git commit -m "feat: EnvDiff - Environment comparison tool"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/SEU_USUARIO/envdiff.git
git branch -M main
git push -u origin main
```

---

## Passo 3: Deploy na Vercel

### Via Dashboard (Recomendado)

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New Project"**
3. Importe o repositório do GitHub
4. Configure as **Environment Variables**:
   ```
   DATABASE_URL = sua_connection_string_aqui
   ```
5. Clique em **"Deploy"**

### Via CLI (Alternativa)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add DATABASE_URL production
```

---

## Passo 4: Rodar Migrations no Banco de Produção

Após o deploy, você precisa rodar as migrations:

### Opção A: Via Vercel CLI

```bash
# Conectar ao projeto
vercel link

# Rodar migration
vercel env pull .env.production.local
npx prisma migrate deploy
```

### Opção B: Localmente apontando para produção

```bash
# Temporariamente, altere .env para apontar para o banco de produção
DATABASE_URL="sua_connection_string_de_producao"

# Rode a migration
npx prisma migrate deploy

# IMPORTANTE: Reverta o .env para desenvolvimento depois!
```

### Opção C: Via Prisma Data Platform

1. Acesse [Prisma Data Platform](https://cloud.prisma.io)
2. Conecte seu repositório
3. Configure para rodar migrations automaticamente

---

## Passo 5: Configurações Adicionais na Vercel

### Build & Development Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (padrão)
- **Output Directory**: `.next` (padrão)
- **Install Command**: `npm install` (padrão)

### Environment Variables

Adicione estas variáveis:

```
DATABASE_URL = postgresql://...
NODE_ENV = production
```

---

## Passo 6: Testar a Aplicação

1. Acesse a URL fornecida pela Vercel (ex: `https://envdiff.vercel.app`)
2. Crie uma comparação de teste
3. Verifique se os screenshots são salvos
4. Confirme que os dados aparecem no banco

---

## 🔧 Troubleshooting

### Erro: "Can't reach database server"

**Causa**: Connection string incorreta ou firewall

**Solução**:
1. Verifique se a connection string está correta
2. Confirme que permite conexões externas
3. NeonDB: Use o endpoint com `-pooler` para serverless

### Erro: "Prisma Client not generated"

**Causa**: Build não gerou o Prisma Client

**Solução**:
1. Adicione no `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```
2. Faça novo deploy

### Screenshots não aparecem

**Causa**: Vercel não persiste arquivos no filesystem

**Solução** (Futuro):
1. Use serviço de storage (S3, Cloudinary, etc)
2. Ou salve como base64 no banco
3. Por enquanto, screenshots são temporários no Vercel

### Timeout nas comparações

**Causa**: Vercel Serverless tem limite de 10s (Hobby) ou 60s (Pro)

**Solução**:
1. Upgrade para Vercel Pro
2. Ou use Vercel Functions com timeout maior
3. Ou processe em background worker (Upstash, Inngest)

---

## 🎯 Otimizações para Produção

### 1. Caching de Screenshots

Adicione cabeçalhos de cache:

```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/screenshots/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### 2. Background Processing

Para comparações longas, considere:
- [Vercel Queue](https://vercel.com/docs/functions/queue)
- [Upstash QStash](https://upstash.com/docs/qstash)
- [Inngest](https://www.inngest.com/)

### 3. Storage Externo

Para persistir screenshots:
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- [Cloudinary](https://cloudinary.com/)
- [AWS S3](https://aws.amazon.com/s3/)

---

## 📊 Monitoramento

### Vercel Analytics

Já está incluído! Veja em:
- Dashboard → Seu Projeto → Analytics

### Logs

Para ver logs de execução:
```bash
vercel logs
```

Ou no Dashboard → Seu Projeto → Logs

---

## 🔐 Segurança

### Proteger Rotas (Opcional)

Se quiser restringir acesso:

```bash
# Adicionar variável de ambiente
ADMIN_PASSWORD = sua_senha_secreta
```

Depois implemente middleware de autenticação.

---

## 🎉 Pronto!

Sua aplicação está no ar! 🚀

**URLs Importantes**:
- Produção: `https://seu-projeto.vercel.app`
- Dashboard: `https://vercel.com/dashboard`
- Banco de dados: Dashboard do seu provider

---

## 📚 Recursos Úteis

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NeonDB Docs](https://neon.tech/docs)
