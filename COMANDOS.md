# 🚀 COMANDOS PARA COPIAR E COLAR

## ✅ Tudo está pronto! 3 commits aguardando push.

---

## 📋 PASSO A PASSO (3 minutos no total)

### 1. Criar repositório no GitHub (1 minuto)

Abra esta URL no navegador:
```
https://github.com/new
```

Preencha:
- **Nome**: envdiff
- **Descrição**: Ferramenta de comparação automática de ambientes GREEN e BLUE
- **Visibilidade**: Public (ou Private)
- ⚠️ **DESMARQUE** todas as opções (README, .gitignore, license)

Clique em **"Create repository"**

---

### 2. Copie seu username do GitHub

Após criar o repositório, você verá uma URL assim:
```
https://github.com/SEU_USUARIO/envdiff
```

**Copie o SEU_USUARIO** (você vai usar nos comandos abaixo)

---

### 3. Execute estes comandos (30 segundos)

**IMPORTANTE**: Substitua `SEU_USUARIO` pelo seu username do GitHub!

```bash
cd /home/peves/projetos/canta/envdiff

# Adicionar remote (SUBSTITUIR SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/envdiff.git

# Fazer push
git push -u origin main
```

**Se pedir senha/autenticação**:
- Username: seu username do GitHub
- Password: use Personal Access Token (não sua senha!)
  - Criar token aqui: https://github.com/settings/tokens/new
  - Marque: `repo` e `workflow`
  - Copie o token e use como senha

---

### 4. Deploy na Vercel (2 minutos)

Abra esta URL:
```
https://vercel.com/new
```

1. **Login** com sua conta (GitHub recomendado)

2. **Import Repository**: Selecione `envdiff`

3. **Configure Project**:
   - Framework Preset: Next.js (auto-detectado)
   - Root Directory: `./` (padrão)
   
4. **Environment Variables** - Clique em "Add" e adicione:
   ```
   Name: DATABASE_URL
   Value: postgresql://neondb_owner:npg_DylPigS9A6mC@ep-gentle-credit-acgy4xlu-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

5. Clique em **"Deploy"**

6. Aguarde 2-3 minutos ⏳

7. **✅ PRONTO!** Sua aplicação estará no ar!

---

## 🎯 Exemplo Completo

### Se seu username for "joaosilva":

```bash
cd /home/peves/projetos/canta/envdiff

# Adicionar remote
git remote add origin https://github.com/joaosilva/envdiff.git

# Verificar se está correto
git remote -v

# Fazer push
git push -u origin main
```

---

## ⚠️ Se der erro "remote origin already exists"

```bash
# Ver qual remote está configurado
git remote -v

# Se estiver errado, remover e adicionar de novo
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/envdiff.git
git push -u origin main
```

---

## ⚠️ Se der erro de autenticação

### Criar Personal Access Token:

1. Acesse: https://github.com/settings/tokens/new
2. Note: `EnvDiff Deploy`
3. Expiration: 90 days (ou o que preferir)
4. Marque: ✅ `repo` (todos os sub-itens)
5. Marque: ✅ `workflow`
6. Clique em **"Generate token"**
7. **COPIE O TOKEN** (você não verá de novo!)
8. Use o token como senha no `git push`

---

## 📊 Verificar se deu certo

### GitHub
Acesse: `https://github.com/SEU_USUARIO/envdiff`

Você deve ver:
- ✅ 39 arquivos
- ✅ README.md renderizado
- ✅ 3 commits
- ✅ Última atualização: agora

### Vercel
Após deploy, você receberá uma URL tipo:
```
https://envdiff-xxx.vercel.app
```

Teste abrindo a URL e criando uma comparação!

---

## 🎉 PRONTO!

Agora você tem:
- ✅ Código no GitHub
- ✅ Aplicação rodando na Vercel
- ✅ Banco de dados NeonDB conectado
- ✅ Tudo funcionando!

---

## 📱 Testar a aplicação

Acesse a URL da Vercel e teste:

**URLs de exemplo**:
- GREEN: https://example.com
- BLUE: https://example.org

Ou use suas URLs reais do Liferay! 🚀

---

## 🆘 Precisa de Ajuda?

Documentação completa em:
- GITHUB_PUSH.md - Detalhes do GitHub
- DEPLOY.md - Detalhes da Vercel
- PRONTO.md - Resumo do projeto

---

**BOA SORTE! 🎊**
