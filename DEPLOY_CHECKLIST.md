# ✅ Checklist de Deploy - Vercel Blob Storage

## 🎯 O que foi implementado

✅ **Vercel Blob Storage** - Substitui armazenamento em `/tmp` (efêmero)  
✅ **Limite de 4MB** - Compatível com Vercel FREE plan  
✅ **Processamento síncrono** - Garante conclusão em <10s  
✅ **URLs persistentes** - Imagens armazenadas em CDN  
✅ **Error handling robusto** - Mensagens claras em português  

## 📋 Passos para Deploy (FAÇA AGORA)

### 1️⃣ Verificar Deploy Automático no Vercel

O código já foi enviado ao GitHub. Verifique se o deploy automático iniciou:

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto **envdiff**
3. Verifique a aba **Deployments**
4. Aguarde o deploy completar (1-2 min)

### 2️⃣ Criar e Conectar Blob Store

**🚨 IMPORTANTE: Sem isso, o upload NÃO vai funcionar em produção!**

1. No dashboard do Vercel, clique em **Storage** (menu lateral)
2. Clique em **Create Database**
3. Selecione **Blob**
4. Nome sugerido: `envdiff-screenshots`
5. Região: **São Paulo (sao1)** ou mais próxima
6. Clique em **Create**

### 3️⃣ Conectar ao Projeto

1. Na tela do Blob Store criado
2. Clique em **Connect Project**
3. Selecione o projeto **envdiff**
4. Confirme a adição da variável `BLOB_READ_WRITE_TOKEN`
5. Clique em **Connect**

### 4️⃣ Redeploy (Essencial!)

A variável de ambiente só estará disponível após redeploy:

1. Vá em **Deployments**
2. Clique nos **três pontos** do último deploy
3. Selecione **Redeploy**
4. Aguarde completar (1-2 min)

### 5️⃣ Testar a Aplicação

1. Acesse: `https://seu-projeto.vercel.app/compare/manual`
2. Faça upload de **2 imagens** (máx 4MB cada)
3. Clique em **"Comparar Imagens"**
4. ✅ Deve funcionar sem erros!

## 🐛 Se der erro...

### Erro: "Missing BLOB_READ_WRITE_TOKEN"
**Solução:** Você esqueceu de conectar o Blob Store ou não fez redeploy.  
👉 Volte ao passo 3 e faça redeploy (passo 4).

### Erro: "Request Entity Too Large"
**Solução:** A imagem excede 4MB.  
👉 Reduza o tamanho/qualidade da imagem.

### Erro: "Upload failed"
**Solução:** Blob Store não está configurado.  
👉 Siga os passos 2-4 novamente.

## 📊 Limites do Vercel (Plano FREE)

| Recurso | Limite |
|---------|--------|
| Tamanho por imagem | 4 MB |
| Armazenamento Blob | 100 GB |
| Transferência/mês | 100 GB |
| Tempo de execução | 10 segundos |

## 📚 Documentação

- [VERCEL_BLOB_SETUP.md](./VERCEL_BLOB_SETUP.md) - Guia detalhado
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)

## 🎉 Pronto!

Após seguir todos os passos:
- ✅ Upload de imagens funcionando
- ✅ Armazenamento persistente na nuvem
- ✅ URLs com CDN para carregamento rápido
- ✅ Sem erros de JSON parse
- ✅ Compatível com plano FREE do Vercel

---

**🚀 Última etapa:** Acesse a aplicação e teste! 🎯
