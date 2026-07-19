# Documentação do CarreirasMatch

Este diretório é a fonte principal de documentação do sistema. Os documentos
descrevem o estado observado no código em **19 de julho de 2026**. Em caso de
divergência, o código e o schema do Prisma representam o comportamento
executável; a divergência deve ser corrigida neste diretório.

## Por onde começar

| Necessidade | Documento |
| --- | --- |
| Entender o produto e seus públicos | [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md) |
| Conhecer todas as funcionalidades | [FEATURES.md](FEATURES.md) |
| Entender as jornadas principais | [USER_FLOWS.md](USER_FLOWS.md) |
| Consultar páginas e permissões | [ROUTES.md](ROUTES.md) |
| Consultar endpoints da API | [API.md](API.md) |
| Entender componentes e fluxos técnicos | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Consultar entidades e relacionamentos | [DATABASE.md](DATABASE.md) |
| Entender login, papéis e acesso pago | [AUTHORIZATION.md](AUTHORIZATION.md) |
| Configurar variáveis de ambiente | [ENV.md](ENV.md) |
| Entender serviços externos | [INTEGRATIONS.md](INTEGRATIONS.md) |
| Fazer deploy, backup e manutenção | [OPERATIONS.md](OPERATIONS.md) |
| Executar e ampliar os testes | [TESTING.md](TESTING.md) |
| Revisar controles e riscos de segurança | [SECURITY.md](SECURITY.md) |
| Diagnosticar problemas comuns | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Planejar marketing, aquisição e escala | [marketing/README.md](marketing/README.md) |

## Produto e planejamento

- [FEATURES.md](FEATURES.md): catálogo funcional e regras de negócio.
- [ROADMAP_FEATURES.md](ROADMAP_FEATURES.md): próximos incrementos do produto.
- [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md): prontidão de lançamento.
- [SCALING_PLAN.md](SCALING_PLAN.md): evolução de infraestrutura.
- [PAYMENT_PRODUCTION_VALIDATION.md](PAYMENT_PRODUCTION_VALIDATION.md):
  homologação real do Mercado Pago.

## Infraestrutura relacionada

- [`../README.md`](../README.md): instalação e visão resumida do repositório.
- [`../observability/README.md`](../observability/README.md): Prometheus, Loki,
  Promtail e Grafana.
- [`../prisma/schema.prisma`](../prisma/schema.prisma): fonte de verdade do
  modelo de dados.

## Regra de manutenção

Toda alteração que crie ou modifique uma funcionalidade deve revisar:

1. `FEATURES.md`, quando mudar comportamento de produto;
2. `ROUTES.md` e `API.md`, quando criar ou alterar rotas;
3. `DATABASE.md`, quando alterar o Prisma;
4. `ENV.md` e `INTEGRATIONS.md`, quando introduzir configuração externa;
5. `AUTHORIZATION.md` e `SECURITY.md`, quando mudar acesso ou dados sensíveis;
6. `OPERATIONS.md`, quando mudar deploy, jobs, backup ou observabilidade.

O checklist mínimo de uma entrega é: documentação atualizada, migration
versionada quando aplicável, testes relevantes e validação com `npm run lint`,
`npm test` e `npm run build`.
