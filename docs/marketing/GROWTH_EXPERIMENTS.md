# Backlog de experimentos de growth

Stack de referência: [[growth-stack-decisao]] (memória) — PostHog (funil/experimentos) + Formbricks (pesquisas) + Satori (cards) + Dub (atribuição) + React Email + Postiz, implementados por ciclo.

Formato de cada experimento:

```
Hipótese:
Página ou fluxo:
Variação A:
Variação B:
Métrica principal:
Métrica de proteção:
Resultado:
Decisão:
```

## Fila (ciclo 1 — PostHog + Formbricks)

1. **"Analisar meu currículo e a vaga" vs. "Calcular meu match grátis"**
   - Página: landing (CTA principal)
   - Métrica principal: `analysis_started` / `landing_viewed`
   - Métrica de proteção: `resume_uploaded` → `analysis_completed` (garantir que não vira clique vazio)
   - Status: não iniciado

2. **Mostrar resultado parcial antes do cadastro vs. cadastro obrigatório antes do resultado**
   - Página: fluxo de análise
   - Métrica principal: `signup_completed` / `analysis_started`
   - Métrica de proteção: `checkout_started` (não pode cair)
   - Status: não iniciado

3. **Preço mostrado antes da análise vs. depois do resultado**
   - Página: paywall / diagnóstico
   - Métrica principal: `checkout_started` → `payment_confirmed`
   - Métrica de proteção: `paywall_dwell_time`, `checkout_dismissed`
   - Status: não iniciado (relacionado a [[pricing-conversao-zero-vendas]] — não subir preço, só testar timing de exibição)

4. **Landing geral vs. landing segmentada para estágio**
   - Página: `/vagas` ou landing por segmento
   - Métrica principal: `analysis_started` por segmento
   - Status: não iniciado

5. **Card de match simples vs. detalhado (Satori)**
   - Página: resultado / compartilhamento
   - Métrica principal: `share_card_generated` → `card_shared` → `referral_link_opened`
   - Status: depende da rota `src/app/api/cards/match/[analysisId]/route.tsx` (feita) ganhar um botão de compartilhar no resultado

6. **Prova do produto (score real) vs. depoimento**
   - Página: landing
   - Métrica principal: `landing_cta_clicked`
   - Status: não iniciado

## Pesquisas Formbricks a configurar no painel (cloud)

- Depois do resultado: "Este diagnóstico deixou claro o que ajustar?"
- No abandono (trigger: tempo parado na tela de análise): "O que impediu você de terminar?"
- Na página de pagamento (trigger: `paywall_dwell_time` alto sem `checkout_started`): "O que está impedindo você de assinar?"
- 7 dias sem retorno (via e-mail/link, não in-app): "Você conseguiu se candidatar?"
- Pós-cancelamento: "O que faltou para continuar?"

Essas pesquisas são configuradas direto no painel Formbricks cloud (segmentação por página/evento), não em código — o único código necessário é o `initFormbricks()` já plugado em `src/instrumentation-client.ts`.

## Próximos ciclos (ainda não iniciados)

- **Ciclo 2:** cards Satori em mais formatos (progresso, ATS) + Dub em todos os links de campanha/indicação (`src/lib/dub.ts` já criado, falta plugar nos pontos de geração de link e criar a conta).
- **Ciclo 3:** React Email nas sequências de e-mail (hoje o envio via Resend usa HTML manual em `src/lib/resend.ts` — migrar templates aos poucos, não é bloqueante).
- **Ciclo 4:** Postiz (fábrica de conteúdo — decidir infra separada da VPS principal antes de instalar, ver [[vps-disk-docker-cache-leak]]) + `next-sitemap` + Lighthouse CI.
- **Depois:** Typebot em campanhas pontuais, testes A/B avançados via PostHog experiments.
