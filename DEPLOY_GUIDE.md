# 🚀 Guia Rápido: Deploy com Vercel Blob

## ✅ Checklist de Implementação

### Passo 1: Criar Blob Store no Vercel

1. **Acesse:** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Navegue:** Clique em **"Storage"** no menu lateral
3. **Crie:** 
   - Clique em **"Create Database"**
   - Selecione **"Blob"**
   - Nome: `envdiff-screenshots`
   - Região: `São Paulo (sao1)` ou mais próxima
   - Clique em **"Create"**

### Passo 2: Conectar ao Projeto EnvDiff

1. Na página do Blob Store recém-criado
2. Clique em **"Connect Project"**
3. Selecione o projeto **`envdiff`**
4. Confirme em **"Connect"**

> ⚡ **Automático:** A variável `BLOB_READ_WRITE_TOKEN` será adicionada automaticamente!

### Passo 3: Fazer Deploy

```bash
# O código já está no GitHub, basta fazer redeploy:
git push origin main  # ✅ Já feito!
```

Ou no Vercel Dashboard:
1. Vá em **Deployments**
2. Clique em **"Redeploy"** no último deploy
3. Aguarde finalizar

### Passo 4: Testar

Acesse: `https://envdiff.vercel.app/compare/manual`

1. Faça upload de 2 screenshots (máx 4MB cada)
2. Clique em **"Comparar Imagens"**
3. Veja o resultado!

---

## 🐛 Troubleshooting

### Erro: "BLOB_READ_WRITE_TOKEN is not defined"

**Solução:**
1. Verifique se o Blob Store está conectado ao projeto
2. Vá em **Settings → Environment Variables**
3. Confirme que `BLOB_READ_WRITE_TOKEN` existe
4. Faça um novo deploy

### Erro: "Request Entity Too Large"

**Solução:**
- As imagens devem ter **menos de 4MB** cada
- Frontend já valida isso, mas pode ser bug de cache
- Limpe cache do navegador

### Imagens não aparecem

**Solução:**
1. Abra DevTools (F12) → Network
2. Veja se as URLs das imagens estão retornando 200 OK
3. Verifique se URLs começam com `https://blob.vercel-storage.com/`

---

## 📊 Monitoramento

### Verificar uso do Blob Storage:

1. Dashboard → Storage → `envdiff-screenshots`
2. Veja:
   - **Storage usado** (de 500 MB)
   - **Requests** (de 1,000/mês)
   - **Bandwidth** (de 1 GB/mês)

### Se exceder limites:

Implemente limpeza automática de comparações antigas (>30 dias):

```typescript
// Exemplo de cron job para limpar
await prisma.comparison.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  }
});
```

---

## ✨ O que mudou?

| Antes (Filesystem) | Agora (Blob Storage) |
|-------------------|----------------------|
| ❌ Não funciona em produção | ✅ Funciona perfeitamente |
| ❌ /tmp efêmero | ✅ URLs persistentes |
| ❌ 10MB limite (não real) | ✅ 4MB real (Vercel limit) |
| ❌ 60s timeout | ✅ 10s (otimizado) |
| ❌ Background processing | ✅ Síncrono (confiável) |

---

## 🎯 Próximos Passos (Opcional)

1. **Adicionar compressão de imagens no cliente**
   - Reduzir tamanho antes de enviar
   - Usar bibliotecas como `browser-image-compression`

2. **Implementar limpeza automática**
   - Cron job diário
   - Delete comparações >30 dias

3. **Upgrade para Vercel Pro** (se necessário)
   - 1 TB storage
   - Sem limite de requests
   - 1 TB bandwidth

---

📚 **Docs:** [VERCEL_BLOB_SETUP.md](./VERCEL_BLOB_SETUP.md)
