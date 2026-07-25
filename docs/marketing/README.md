# Marketing — CarreirasMatch

Documentação de marketing baseada no estado real do código em `src/`, não em
planejamento. Cada afirmação aqui foi checada numa rota, componente ou lib —
quando algo não existe (uma integração, uma métrica, um canal pago), o
documento diz isso explicitamente em vez de descrever como "futuro".

## North star

**Nome do produto:** CarreirasMatch (`src/lib/seo.ts`).

**Descrição oficial (JSON-LD, `organizationJsonLd()`):** "Copiloto de carreira
que compara currículo e vaga, mostra as lacunas que mais importam e transforma
o diagnóstico em ações."

**Headline da home (`src/components/marketing-home.tsx`):** "Pare de se
candidatar no escuro." com CTA primário "Analisar currículo e vaga" → `/analise`.

Para a síntese executiva de posicionamento, casa de mensagem, funil e copy
recomendada, consulte [../PRODUCT_AND_MARKETING_BRIEF.md](../PRODUCT_AND_MARKETING_BRIEF.md).

## Documentos

| Documento | Cobre |
| --- | --- |
| [POSITIONING.md](POSITIONING.md) | Para quem é o produto, diferenciais e mensagem, com base em `/sobre`, `/mercado-de-trabalho` e páginas de segmento |
| [CONTENT_ENGINE.md](CONTENT_ENGINE.md) | Como blog, radares de concurso/vestibular e páginas de segmento são gerados e mantidos hoje |
| [COPY_LIBRARY.md](COPY_LIBRARY.md) | Títulos, CTAs e textos reais das páginas-chave e dos e-mails de `src/lib/resend.ts` |
| [GO_TO_MARKET.md](GO_TO_MARKET.md) | Canais que já existem no produto: SEO, Desafio do Match, marketplace freelancer, B2B |
| [GROWTH_METRICS.md](GROWTH_METRICS.md) | Métricas relevantes e onde encontrar dado hoje (dashboards Grafana existentes) |
| [PAID_MEDIA.md](PAID_MEDIA.md) | Estado real de mídia paga: o que está configurado e o que não existe |
| [PARTNERSHIPS_AND_B2B.md](PARTNERSHIPS_AND_B2B.md) | Rotas e fluxos reais de empresa, parceiro, influencer e freelancer |

## Como este pacote foi escrito

Reescrito em 2026-07-21 a partir de leitura direta do código (rotas em
`src/app`, `src/lib/resend.ts`, `src/lib/adsense.ts`,
`src/lib/external-source-scheduler.ts`, `src/lib/blog-scheduler.ts`,
`observability/grafana/dashboards/`). Não contém métrica, integração ou
parceria inventada — o que não foi confirmado no código não está aqui.
