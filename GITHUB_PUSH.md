# 📦 Enviar para o GitHub

## ✅ Commit Realizado!

O código foi commitado localmente. Agora vamos enviar para o GitHub.

---

## Passo 1: Criar Repositório no GitHub

### Opção A: Via Interface Web (Mais Fácil)

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `envdiff`
   - **Description**: `Ferramenta de comparação automática de ambientes GREEN e BLUE`
   - **Visibility**: Public ou Private (sua escolha)
   - ⚠️ **NÃO** marque "Add a README file"
   - ⚠️ **NÃO** marque "Add .gitignore"
   - ⚠️ **NÃO** marque "Choose a license"
3. Clique em **"Create repository"**

### Opção B: Via GitHub CLI (se tiver instalado)

```bash
gh repo create envdiff --public --source=. --remote=origin --push
```

---

## Passo 2: Conectar ao Repositório Remoto

Após criar o repositório no GitHub, você verá instruções. Use este comando:

```bash
cd /home/peves/projetos/canta/envdiff

# Substituir SEU_USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU_USUARIO/envdiff.git

# Ou via SSH (se tiver configurado)
# git remote add origin git@github.com:SEU_USUARIO/envdiff.git
```

---

## Passo 3: Push para o GitHub

```bash
cd /home/peves/projetos/canta/envdiff

# Fazer push do commit
git push -u origin main
```

Se pedir autenticação:
- **Username**: seu username do GitHub
- **Password**: use um **Personal Access Token** (não sua senha)
  - Criar token: https://github.com/settings/tokens/new
  - Scopes necessários: `repo`, `workflow`

---

## Passo 4: Verificar no GitHub

Acesse: `https://github.com/SEU_USUARIO/envdiff`

Você deve ver:
- ✅ Todos os arquivos
- ✅ README.md renderizado
- ✅ Commit com mensagem descritiva

---

## Passo 5: Deploy na Vercel

Agora que está no GitHub, siga o **DEPLOY.md** para fazer deploy na Vercel!

### Quick Start Vercel:

1. Acesse: https://vercel.com/new
2. Importe o repositório `envdiff`
3. Configure a variável de ambiente:
   ```
   DATABASE_URL = postgresql://neondb_owner:npg_DylPigS9A6mC@ep-gentle-credit-acgy4xlu-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
4. Clique em **Deploy**
5. Aguarde ~2-3 minutos
6. Acesse a URL fornecida!

---

## 🎯 Comandos Completos (Copiar e Colar)

```bash
# 1. Ir para a pasta do projeto
cd /home/peves/projetos/canta/envdiff

# 2. Conectar ao repositório remoto (SUBSTITUIR SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/envdiff.git

# 3. Verificar se conectou
git remote -v

# 4. Fazer push
git push -u origin main
```

---

## ⚠️ Troubleshooting

### Erro: "remote origin already exists"

```bash
# Ver qual é o remote atual
git remote -v

# Remover e adicionar novamente
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/envdiff.git
```

### Erro: "failed to push some refs"

```bash
# Forçar push (use com cuidado!)
git push -u origin main --force
```

### Erro de autenticação

Use Personal Access Token ao invés da senha:
1. Vá em: https://github.com/settings/tokens/new
2. Crie um token com scope `repo`
3. Use o token como password no git push

---

## 📋 Checklist

Antes de fazer deploy na Vercel:

- [ ] Repositório criado no GitHub
- [ ] Push feito com sucesso
- [ ] README.md aparece no GitHub
- [ ] Todos os arquivos estão lá
- [ ] `.env` NÃO está no repositório (verificar)
- [ ] Banco de dados NeonDB funcionando
- [ ] Connection string do NeonDB em mãos

---

## 🚀 Próximo Passo

Depois do push, vá para o **DEPLOY.md** e siga as instruções para deploy na Vercel!

Ou acesse direto: https://vercel.com/new

---

**Boa sorte! 🎉**
