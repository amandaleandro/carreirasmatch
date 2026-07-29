# Taxonomia de eventos

Fonte da verdade: `ANALYTICS_EVENTS` em [`src/lib/analytics.ts`](../../src/lib/analytics.ts). Todo evento chamado via `track()` vai em paralelo para Plausible, Meta Pixel, LinkedIn Insight, GA4, PostHog e para `FunnelEvent` (Postgres, via `/api/analytics/event`). Não crie eventos fora dessa lista — adicione aqui e no enum juntos.

| Evento | Origem (anônimo/identificado) | Propriedades | Métrica relacionada |
|---|---|---|---|
| `landing_viewed` | anônimo | — | topo de funil |
| `landing_cta_clicked` | anônimo | — | intenção |
| `resume_uploaded` | anônimo ou identificado | — | ativação |
| `job_description_added` | anônimo ou identificado | — | ativação |
| `analysis_started` | anônimo ou identificado | — | ativação |
| `analysis_completed` | identificado (na prática) | `analysisId` | ativação completa |
| `analysis_failed` | identificado | motivo | qualidade/erro |
| `analysis_reanalyzed` | identificado | `analysisId` | engajamento |
| `second_analysis_started` | identificado | `analysisId` anterior | retenção |
| `score_viewed` | identificado | `overallScore` | ativação completa |
| `diagnostic_teaser_viewed` | identificado | — | intenção de compra |
| `recommendation_clicked` | identificado | tipo de recomendação | engajamento |
| `paywall_dwell_time` | identificado | `seconds` | intenção de compra |
| `paywall_preview_clicked` | identificado | — | intenção de compra |
| `unlock_clicked` | identificado | — | intenção de compra |
| `checkout_started` | identificado | `value` | conversão |
| `checkout_dismissed` | identificado | — | funil de pagamento |
| `payment_method_selected` | identificado | método | funil de pagamento |
| `checkout_failed` | identificado | motivo | funil de pagamento |
| `pix_generated` | identificado | — | funil de pagamento |
| `payment_confirmed` | identificado | `value` | receita |
| `subscription_started` / `subscription_confirmed` | identificado | `value` | receita recorrente |
| `signup_completed` | identificado | — | topo de funil de conta |
| `lead_captured` | anônimo | — | topo de funil |
| `result_viewed` | identificado | `analysisId` | engajamento |
| `share_card_generated` | identificado | `analysisId` | distribuição |
| `card_shared` | identificado | `method`, `analysisId` | distribuição |
| `referral_link_opened` | anônimo | `ref` | distribuição/indicação |
| `survey_responded` | identificado | Formbricks survey id | qualidade/insight |
| `tool_used` | anônimo ou identificado | ferramenta | ativação de ferramentas gratuitas |
| `interview_simulator_started` / `interview_practiced` | identificado | — | retenção |
| `behavioral_test_completed` | identificado | — | retenção |
| `resume_saved` | identificado | — | retenção |
| `application_created` | identificado | — | ação real pós-análise (métrica-chave do produto) |
| `job_alert_created` / `job_alert_deleted` | identificado | — | retenção |
| `partner_submission_sent` | identificado | — | marketplace |
| `company_job_created` | identificado | — | marketplace/empresas |
| `freelance_proposal_submitted` | identificado | — | marketplace freelancer |

## Convenções

- Nome do evento em `snake_case`, verbo no particípio/passado (`_completed`, `_started`, `_clicked`) — nunca crie sinônimo de um evento existente.
- Propriedades só com dados não sensíveis (nunca texto de currículo/vaga inteiro).
- Toda rota de card/imagem pública (ex: `src/app/api/cards/match/[analysisId]/route.tsx`) deve selecionar explicitamente os campos do Prisma, nunca `select: *`.
