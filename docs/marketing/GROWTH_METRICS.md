# Métricas de growth

## Eventos de produto já instrumentados

`src/lib/analytics.ts` define uma camada de analytics própria (não é um SDK
de terceiro): `track()` envia para o Plausible via `window.plausible`
(se `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` estiver configurado) **e** para
`/api/analytics/event` (via `sendBeacon`/`fetch`), guardando atribuição
(`cm_attribution` no `localStorage`: `sessionId`, `source`, `medium`,
`campaign`, `content`).

Eventos existentes (`ANALYTICS_EVENTS`):

- `analysis_started`, `analysis_completed`
- `diagnostic_teaser_viewed`, `unlock_clicked`
- `checkout_started`, `checkout_failed`
- `payment_confirmed`, `pix_generated`
- `subscription_started`, `subscription_confirmed`
- `signup_completed`, `lead_captured`, `tool_used`

Isso já cobre o funil principal: visitante → análise → teaser do
diagnóstico → checkout → pagamento → assinatura.

## Onde ver os dados hoje: dashboards Grafana em `observability/grafana/dashboards`

O repositório versiona 14 dashboards Grafana prontos, o que é a fonte real de
métricas hoje (não uma promessa de instrumentação futura):

| Dashboard | Cobre |
| --- | --- |
| `carreiras-business-executive.json` | Visão executiva de negócio |
| `carreiras-growth-funnel.json` | Funil de growth |
| `carreiras-payments-revenue.json` | Pagamentos e receita |
| `carreiras-access-analytics.json` | Analytics de acesso |
| `carreiras-farol-jornadas.json` | "Farol das Jornadas" — ver detalhe abaixo |
| `carreiras-deploys-incidentes.json` | Deploys e incidentes de engenharia |
| `carreiras-ai-costs.json` / `carreiras-ai-capacity.json` / `carreiras-ai-reliability.json` | Custo, capacidade e confiabilidade dos provedores de IA |
| `carreiras-operations-slo.json`, `carreiras-app-edge.json`, `carreiras-containers.json`, `carreiras-host.json`, `carreiras-overview.json`, `carreiras-logs.json` | Infraestrutura/operação |

### Farol das Jornadas — o que ele mostra de fato

`carreiras-farol-jornadas.json` ("Carreiras Match - Farol das Jornadas") é o
dashboard mais próximo de um painel de growth cross-produto. Painéis
confirmados no JSON:

- **Jornada do candidato:** análise de currículo (IA) — sucesso 1h;
  provedores de IA — sucesso 24h; candidaturas (24h); pagamento candidato —
  aprovação 24h; assinaturas ativas; novos usuários (24h).
- **Jornada da empresa:** pagamento empresa — aprovação 24h; empresas
  cadastradas (24h); vagas/triagens abertas (total); pedidos de contato com
  talentos (total); status das candidaturas.
- **Alertas, blog e radares:** alertas de vaga enviados (24h); posts de blog
  publicados (24h); radar concursos — tempo desde última coleta OK; radar
  vestibulares — tempo desde última coleta OK; radar com erro na última
  tentativa (sim/não); itens ativos nos radares (total).
- **Marketplace freelancer:** projetos publicados (24h); propostas enviadas
  (24h); contratos fechados (24h); total acumulado (projetos/propostas/
  contratos).

Esse dashboard foi instrumentado recentemente (commit `e43ac92`,
"instrumenta alertas de vaga, blog, radares e freelancer no farol").

## Métricas que fazem sentido acompanhar, mapeadas ao que já existe

| Métrica | Como medir hoje |
| --- | --- |
| Cadastro | `signup_completed` (evento) + "Novos usuários (24h)" (Farol) |
| Ativação (1ª análise) | `analysis_started` → `analysis_completed`; painel "Análise de currículo (IA) — sucesso" no Farol |
| Indicações do Desafio do Match | não há evento dedicado em `ANALYTICS_EVENTS` nem painel Grafana específico; a fonte de verdade hoje é a tabela de referrals via `src/lib/referrals.ts` (consulta direta ao banco) |
| Conversão free → pago | `diagnostic_teaser_viewed` → `checkout_started` → `payment_confirmed`; "Pagamento candidato — aprovação 24h" e "Assinaturas ativas" no Farol; `carreiras-payments-revenue.json` para receita |
| Saúde do conteúdo/SEO | "Posts de blog publicados (24h)" e os dois painéis de radar (concurso/vestibular) no Farol |
| Marketplace freelancer | painel dedicado no Farol (projetos/propostas/contratos) |
| B2B empresas | "Empresas cadastradas (24h)", "Vagas/triagens abertas", "Pedidos de contato com talentos" no Farol |

## Gap real: indicação do Desafio do Match não tem evento nem painel

Apesar de ser o único loop viral do produto (ver `GO_TO_MARKET.md`), não foi
encontrado um evento em `ANALYTICS_EVENTS` nem um painel no Farol que meça
indicações registradas, recompensas concedidas ou taxa de conversão de quem
chega por `?ref=`. Isso é um gap de instrumentação, não de funcionalidade —
o mecanismo (`registerUserReferral`, `getUserReferralStats`) já existe em
`src/lib/referrals.ts`, só falta expor no analytics/dashboard.

## O que não existe

Não há dashboard de LTV:CAC, coorte de retenção ou funil por
canal/campanha pago nos JSONs versionados em `observability/grafana/`. Não
há integração com ferramenta externa de BI (Amplitude, Mixpanel, Google
Analytics 4) no código — a camada de analytics é própria (Plausible +
endpoint interno), descrita acima.
