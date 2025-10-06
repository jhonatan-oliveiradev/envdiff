# 📖 Exemplos de Uso do EnvDiff

## Exemplo 1: Comparação Básica

### Cenário
Você precisa validar que o ambiente BLUE está idêntico ao GREEN antes do sync.

### Passos

1. **Acesse** `http://localhost:3000`

2. **Preencha o formulário**:
   ```
   URL GREEN: https://green.meusite.com.br/home
   URL BLUE: https://blue.meusite.com.br/home
   Threshold: 15%
   ```

3. **Clique em "Comparar Agora"**

4. **Resultado esperado**:
   - Se < 1%: ✅ Ambientes OK para sync
   - Se 1-5%: ⚠️ Revisar diferenças
   - Se > 5%: ❌ Investigar antes do sync

---

## Exemplo 2: Ignorar Elementos Dinâmicos

### Cenário
Sua página tem relógio, banner de cookies e carrossel que sempre mudam.

### Configuração

**Máscaras CSS** (um por linha):
```
.cookie-consent-banner
#header-clock
.carousel-slider
.live-chat-widget
[data-timestamp]
```

**Ignorar Seletores**:
```
[data-random-id]
.analytics-tracker
```

Esses elementos serão ocultados antes da comparação.

---

## Exemplo 3: Comparação com Análise DOM

### Cenário
Você quer verificar não só visual, mas também mudanças estruturais no HTML.

### Configuração

1. ✅ Marcar checkbox "Comparar estrutura DOM"

2. **Resultado na aba DOM**:
   ```
   ❌ line:42 - modified
   - <h1 class="title">Bem-vindo</h1>
   + <h1 class="title">Olá</h1>
   
   ✅ line:55 - added
   + <div class="new-section">Conteúdo novo</div>
   ```

---

## Exemplo 4: Validação de Múltiplas Páginas

### Cenário
Validar várias páginas do site antes do sync.

### Fluxo

**Página 1 - Home**:
```
GREEN: https://green.site.com/
BLUE: https://blue.site.com/
```

**Página 2 - Produtos**:
```
GREEN: https://green.site.com/produtos
BLUE: https://blue.site.com/produtos
```

**Página 3 - Contato**:
```
GREEN: https://green.site.com/contato
BLUE: https://blue.site.com/contato
```

Faça 3 comparações separadas e compile os resultados.

---

## Exemplo 5: Interpretação de Resultados

### Screenshot A: Percentual 0.23% 🟢

**Interpretação**: 
- Diferença mínima, provavelmente anti-aliasing ou compressão
- **Ação**: ✅ Aprovar para sync

### Screenshot B: Percentual 3.45% 🟡

**Interpretação**:
- Diferenças detectadas, revisar manualmente
- Possíveis causas:
  - Fonte renderizada diferente
  - Imagem carregou em tamanho diferente
  - Espaçamento CSS diferente
- **Ação**: ⚠️ Revisar heatmap e decidir

### Screenshot C: Percentual 18.92% 🔴

**Interpretação**:
- Mudanças significativas detectadas
- Possíveis causas:
  - Conteúdo faltando no BLUE
  - Layout quebrado
  - Imagens não carregadas
- **Ação**: ❌ NÃO fazer sync, investigar

---

## Exemplo 6: Máscaras para Liferay

### Elementos Comuns para Mascarar no Liferay

```css
/* Portlets dinâmicos */
.portlet-boundary[data-portlet-id]

/* Timestamps e datas */
.last-modified-date
.created-date
[data-timestamp]

/* Elementos de sessão */
.user-avatar
.signed-in-as
.session-id

/* Navegação personalizada */
.user-navigation
.personalized-content

/* Widgets externos */
.weather-widget
.stock-ticker
.live-chat

/* Carrosséis e sliders */
.carousel
.slider
.image-rotator

/* Banners rotativos */
.rotating-banner
.ad-banner
```

---

## Exemplo 7: Troubleshooting

### Problema: "Erro ao criar comparação"

**Causas possíveis**:
1. URL não acessível
2. Site bloqueia Playwright/bots
3. Timeout (site muito lento)

**Solução**:
- Teste a URL no navegador
- Verifique se há autenticação necessária
- Aumente timeout no código (future feature)

### Problema: Screenshots aparecem diferentes mas visualmente são iguais

**Causa**: Anti-aliasing, renderização de fonte, compressão de imagem

**Solução**: Aumente o threshold para 20-25%

### Problema: Processamento demora muito

**Causa**: 
- Site tem muitas imagens pesadas
- JavaScript complexo
- Página muito longa

**Solução**:
- Aguardar (pode levar 2-3 minutos)
- (Future) Implementar timeout configurável

---

## Exemplo 8: Workflow Completo de Validação

### Fase 1: Preparação (Dia -7 do Sync)

1. **Primeira comparação baseline**
   - Comparar todas páginas críticas
   - Documentar diferenças conhecidas
   - Criar lista de máscaras necessárias

### Fase 2: Replicação (Dia -6 até Dia -2)

2. **Comparações diárias**
   - Rodar comparação ao final do dia
   - Acompanhar progresso da replicação
   - Identificar novos problemas

### Fase 3: Pré-Sync (Dia -1)

3. **Validação final**
   - Comparar TODAS páginas
   - Exigir < 1% em todas
   - Documentar qualquer exceção

### Fase 4: Sync (Dia 0)

4. **Go/No-Go Decision**
   - Se todas comparações < 1%: ✅ GO
   - Se qualquer > 1%: ❌ NO-GO (investigar)

### Fase 5: Pós-Sync (Dia +1)

5. **Validação pós-sync**
   - Comparar produção atual com baseline
   - Garantir que sync foi bem-sucedido

---

## Exemplo 9: Integração com CI/CD (Future)

### GitHub Actions Workflow

```yaml
name: Environment Validation

on:
  schedule:
    - cron: '0 0 * * *'  # Diariamente

jobs:
  compare:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run EnvDiff
        run: |
          npm run envdiff -- \\
            --green https://green.site.com \\
            --blue https://blue.site.com \\
            --threshold 0.01 \\
            --output report.json
      
      - name: Check Results
        run: |
          if [ $(jq '.diffPercentage' report.json) -gt 1 ]; then
            echo "❌ Differences > 1% detected!"
            exit 1
          fi
```

---

## Exemplo 10: Boas Práticas

### ✅ DO

1. **Use máscaras generosamente**
   - Melhor mascarar demais que de menos
   - Foque nas diferenças que importam

2. **Documente seus thresholds**
   - Home page: 0.5%
   - Páginas de produto: 1%
   - Blog: 2%

3. **Faça comparações regulares**
   - Não espere o último dia
   - Detecte problemas cedo

4. **Salve seus resultados**
   - Screenshots são salvos em `public/screenshots/[id]`
   - Faça backup de comparações importantes

### ❌ DON'T

1. **Não confie 100% em automação**
   - Sempre revise manualmente casos críticos
   - Use EnvDiff como primeira linha de defesa

2. **Não ignore pequenas diferenças repetidas**
   - Se sempre aparece 2% de diff no mesmo lugar
   - Pode ser problema real, não ruído

3. **Não compare URLs completamente diferentes**
   - `/home` vs `/produtos` não faz sentido
   - Compare sempre mesma rota

---

## 📞 Suporte

Se você encontrar problemas ou tiver dúvidas:

1. Verifique os logs no terminal onde rodou `npm run dev`
2. Inspecione o banco de dados com `npx prisma studio`
3. Teste as URLs manualmente no navegador
4. Consulte o README.md para troubleshooting

---

**Feliz comparação! 🎉**
