# Planos, permissões e analytics — especificação paralela

## Matriz comercial inicial

| Plano | Papel | Limite inicial |
| --- | --- | --- |
| Gratuito | ativar e entregar primeiro valor | prévias e poucas ações de IA |
| Essencial | orientação e preparação básica | uso mensal moderado |
| Pro | candidatura ativa e personalização | maior volume de Match, entrevista e plano |
| Completo | jornada integrada | carreira, estudos e freelancer |
| Sprint | resolver uma necessidade urgente | janela de 7 dias, sem renovação |

Os valores do Plano Mestre são hipóteses de lançamento. Não devem ser codificados como regra espalhada pelo frontend.

## Regras obrigatórias

- frontend envia apenas `productCode` e cupom;
- backend resolve preço, moeda, provedor e entitlement;
- limite mensal pertence ao ciclo da assinatura;
- crédito comprado tem validade própria;
- erro de IA reverte reserva;
- webhook repetido não concede benefício duas vezes;
- downgrade não apaga dados;
- cancelamento mantém acesso até o fim do período pago;
- operações pesadas nunca são anunciadas como ilimitadas.

## Estado da implementação

O catálogo tipado está em `src/lib/commercial-plan-catalog.ts`. Ele ainda não substitui o fluxo legado de `CAREER_OFFERS`/`hasActiveSubscriptionAccess`; a migração precisa ser feita em uma etapa própria, com preservação dos Planos Fundador e compatibilidade com os webhooks existentes.

## Eventos de funil

| Etapa | Eventos |
| --- | --- |
| Aquisição | `landing_viewed`, `journey_selected`, `signup_started`, `signup_completed` |
| Ativação | `onboarding_completed`, `diagnostic_completed`, `first_action_completed` |
| Valor | `resume_created`, `job_analyzed`, `interview_completed`, `study_activity_completed` |
| Conversão | `offer_viewed`, `checkout_started`, `payment_approved`, `subscription_activated` |
| Retenção | `weekly_plan_viewed`, `return_session`, `goal_progressed` |
| Impacto | `interview_reported`, `internship_reported`, `job_reported`, `promotion_reported` |

## Painel mínimo

- ativação por objetivo;
- conversão por jornada;
- custo de IA por feature e por plano;
- margem após custo variável;
- retenção D1, D7 e D30;
- churn por motivo;
- utilização dos limites;
- impacto profissional declarado;
- funil específico de universidade.

## Critérios para mudar preço ou limite

Revisar após 30, 60 e 90 dias, observando conjuntamente conversão, custo médio de IA, margem, retenção e motivo de cancelamento. Nenhum indicador isolado deve determinar aumento de preço.
