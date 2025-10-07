# 🗂️ Configuração do Vercel Blob Storage

Este projeto usa **Vercel Blob** para armazenar screenshots de comparação. Siga os passos abaixo para configurar:

## 📋 Pré-requisitos

- Conta no Vercel
- Projeto EnvDiff já deployado no Vercel

## 🚀 Passo a Passo

### 1. Acesse o Dashboard do Vercel

Vá para: https://vercel.com/dashboard

### 2. Crie um Blob Store

1. No menu lateral, clique em **"Storage"**
2. Clique em **"Create Database"**
3. Selecione **"Blob"**
4. Dê um nome (ex: `envdiff-screenshots`)
5. Escolha a região mais próxima (ex: `São Paulo - sao1`)
6. Clique em **"Create"**

### 3. Conecte ao Projeto

1. Na tela do Blob Store recém-criado
2. Clique em **"Connect Project"**
3. Selecione o projeto **`envdiff`**
4. Clique em **"Connect"**

### 4. Variável de Ambiente

A variável `BLOB_READ_WRITE_TOKEN` será **automaticamente adicionada** ao projeto no Vercel.

### 5. Para Desenvolvimento Local

1. No dashboard do Blob Store, copie o token
2. Adicione no arquivo `.env.local` (crie se não existir):

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

**⚠️ IMPORTANTE:** Nunca commite o `.env.local` com tokens reais!

## 📊 Limites do Vercel Blob

| Plano | Storage Total | Upload Simples | Upload Multipart | Requests/mês | Bandwidth/mês | Timeout |
|-------|---------------|----------------|------------------|--------------|---------------|---------|
| **FREE (Hobby)** | 500 MB | 5 MB | **500 MB** | 1,000 | 1 GB | 10s |
| **Pro** | Ilimitado | 500 MB | **5 GB** | Ilimitado | Ilimitado | 60s |

💡 **Configuração atual:** 
- Limite de upload: **20 MB por imagem**
- Timeout: **10 segundos** (plano FREE) ou **60 segundos** (plano Pro)
- Upload multipart automático para arquivos > 5MB

## ✅ Verificação

Após configurar, faça deploy e teste o upload manual em:
```
https://envdiff.vercel.app/compare/manual
```

## 🔍 Debug

Se houver erros, verifique:

1. ✅ Blob Store foi criado
2. ✅ Projeto está conectado ao Store
3. ✅ Variável `BLOB_READ_WRITE_TOKEN` existe nas Environment Variables
4. ✅ Último deploy foi após conectar o Blob

---

📚 **Documentação oficial:** https://vercel.com/docs/storage/vercel-blob
