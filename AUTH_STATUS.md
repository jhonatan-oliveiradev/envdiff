# ✅ Autenticação no Liferay - Implementação Concluída

## 🎯 Problema Resolvido

**Ambientes GREEN e BLUE do Liferay STG exigem autenticação** para visualização.

## ✅ Solução Implementada

### Funcionalidades Adicionadas

1. **Login Automático via Playwright**
   - ✅ Detecta automaticamente se credenciais estão configuradas
   - ✅ Faz login antes de capturar screenshots
   - ✅ Usa seletores CSS customizáveis

2. **Persistência de Sessão**
   - ✅ Salva cookies + localStorage em arquivo JSON
   - ✅ Reutiliza sessão entre comparações (evita logins repetidos)
   - ✅ Path: `/tmp/auth/liferay-stg-session.json` (prod) ou `tmp/auth/` (dev)

3. **Fallback Inteligente**
   - ✅ Se credenciais não configuradas → tenta acessar URLs públicas
   - ✅ Logs informativos (🔐 login, ♻️ reutiliza, ⚠️ sem auth)

## 📝 Arquivos Modificados

### Código
- ✅ `src/app/api/compare/route.ts` - Lógica de autenticação

### Documentação
- ✅ `LIFERAY_AUTH.md` - Guia completo de configuração
- ✅ `README.md` - Seção sobre autenticação
- ✅ `.env.example` - Variáveis de ambiente documentadas

## 🔧 Como Configurar

### 1. Desenvolvimento Local

Crie `.env.local`:

```env
LIFERAY_LOGIN_URL=https://seu-liferay-stg.com/c/portal/login
LIFERAY_USER=service.account@empresa.com
LIFERAY_PASS=sua-senha-segura
```

### 2. Produção (Vercel)

Adicione variáveis em:
```
https://vercel.com/[usuario]/envdiff/settings/environment-variables
```

Variáveis obrigatórias:
- `LIFERAY_LOGIN_URL`
- `LIFERAY_USER`
- `LIFERAY_PASS`

Variáveis opcionais (usa defaults):
- `LIFERAY_USER_SELECTOR` → `input[name="login"]`
- `LIFERAY_PASS_SELECTOR` → `input[name="password"]`
- `LIFERAY_SUBMIT_SELECTOR` → `button[type="submit"]`

## 🧪 Como Testar

### Desenvolvimento

```bash
# 1. Configure .env.local com credenciais
# 2. Execute
npm run dev

# 3. Teste comparação
# Você verá:
🔐 Fazendo login no Liferay: https://...
✅ Login realizado com sucesso
💾 Sessão salva em: tmp/auth/liferay-stg-session.json

# 4. Segunda comparação reutiliza:
♻️ Reutilizando sessão salva do Liferay
```

### Produção

```bash
# 1. Configure variáveis no Vercel
# 2. Redeploy
git commit --allow-empty -m "trigger: redeploy with auth"
git push origin main

# 3. Verifique logs no Vercel
# Dashboard → Deployments → View Function Logs
```

## 🔍 Como Funciona

### Fluxo de Autenticação

```
┌─────────────────────────┐
│ Inicia Comparação       │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │ Credenciais?  │
    └───┬───────┬───┘
        │       │
       Não     Sim
        │       │
        ▼       ▼
   ┌─────┐  ┌─────────────┐
   │ Sem │  │ Sessão      │
   │Auth │  │ Salva?      │
   └─────┘  └───┬─────┬───┘
                │     │
               Sim   Não
                │     │
                ▼     ▼
           ┌──────┐ ┌────────┐
           │Reusa │ │ Login  │
           │State │ │+ Salva │
           └──────┘ └────────┘
                │     │
                └──┬──┘
                   ▼
         ┌──────────────────┐
         │ Captura          │
         │ Screenshots      │
         └──────────────────┘
```

### Código Implementado

```typescript
// Tenta reutilizar sessão
if (hasAuth) {
  try {
    await access(storagePath);
    const state = JSON.parse(await readFile(storagePath, "utf8"));
    context = await browser.newContext({ storageState: state });
  } catch {
    // Login e salva
    context = await browser.newContext();
    const loginPage = await context.newPage();
    await performLogin(loginPage);
    await context.storageState({ path: storagePath });
  }
}
```

## ⚠️ Requisitos da Conta

### ✅ Deve Ter
- Sem MFA/2FA (Playwright não resolve códigos)
- Permissões de visualização nas páginas STG
- Senha que não expire (ou rotacionar manualmente)

### 🔐 Segurança
- ✅ Use conta de **serviço dedicada**
- ✅ **NUNCA** use credenciais pessoais
- ✅ Limite permissões ao mínimo
- ✅ Use Vercel Secret Variables

## 📊 Status

| Item | Status |
|------|--------|
| Código implementado | ✅ |
| Testes locais | ⏳ Pendente configuração de credenciais |
| Deploy no Vercel | ✅ |
| Variáveis configuradas | ⏳ Pendente |
| Testes em produção | ⏳ Pendente |

## 🔗 Links Úteis

- **Documentação Completa**: [LIFERAY_AUTH.md](./LIFERAY_AUTH.md)
- **Configuração**: [.env.example](./.env.example)
- **Código**: [src/app/api/compare/route.ts](./src/app/api/compare/route.ts)

## 📚 Commits

```bash
6283249 - feat: Add Liferay STG authentication support
```

## ⏭️ Próximos Passos

1. **Criar conta de serviço** no Liferay STG
   - Sem MFA
   - Apenas visualização
   - Senha que não expire

2. **Configurar variáveis no Vercel**
   - LIFERAY_LOGIN_URL
   - LIFERAY_USER
   - LIFERAY_PASS

3. **Ajustar seletores** (se necessário)
   - Inspecionar página de login
   - Copiar seletores corretos
   - Configurar LIFERAY_*_SELECTOR

4. **Testar em produção**
   - Fazer comparação
   - Verificar logs
   - Confirmar screenshots capturados

5. **(Opcional) Migrar para S3/Blob**
   - Para persistência entre deploys
   - Evitar logins repetidos em cold starts

---

**Status Atual**: ✅ Código pronto - aguardando configuração de credenciais
