# Documentação do CarreirasMatch

CarreirasMatch é uma plataforma brasileira de carreira: análise de currículo
por IA, organização de candidaturas, ferramentas gratuitas por segmento,
radares de concurso e vestibular, mentorias em vídeo, jogos de carreira,
marketplace freelancer e um programa de indicação ("Desafio do Match"). É um
produto **maduro**, não um MVP inicial — a maior parte das features óbvias já
existe e está em produção. Antes de assumir que algo falta, confira o código.

Este diretório é a fonte principal de documentação do sistema. Os documentos
descrevem o estado observado no código em **21 de julho de 2026**. Em caso de
divergência, o código e o `prisma/schema.prisma` representam o comportamento
executável; a divergência deve ser corrigida aqui.

## Por onde começar

| Necessidade | Documento |
| --- | --- |
| Entender o produto, públicos e modelo de negócio | [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md) |
| Conhecer todas as funcionalidades existentes | [FEATURES.md](FEATURES.md) |
| Entender as jornadas principais do usuário | [USER_FLOWS.md](USER_FLOWS.md) |
| Ver o que está planejado mas ainda não existe | [ROADMAP_FEATURES.md](ROADMAP_FEATURES.md) |
| Consultar páginas e controle de acesso por rota | [ROUTES.md](ROUTES.md) |
| Consultar endpoints da API | [API.md](API.md) |
| Entender componentes, stack e fluxos técnicos | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Consultar entidades e relacionamentos do banco | [DATABASE.md](DATABASE.md) |
| Entender login, papéis (`accountType`) e acesso pago | [AUTHORIZATION.md](AUTHORIZATION.md) |
| Configurar variáveis de ambiente | [ENV.md](ENV.md) |
| Entender serviços externos (Mercado Pago, Groq, Resend, fontes de vaga) | [INTEGRATIONS.md](INTEGRATIONS.md) |
| Fazer deploy, backup e manutenção | [OPERATIONS.md](OPERATIONS.md) |
| Executar e ampliar os testes | [TESTING.md](TESTING.md) |
| Revisar controles e riscos de segurança | [SECURITY.md](SECURITY.md) |
| Diagnosticar problemas comuns | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Checar prontidão de lançamento | [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) |
| Planejar evolução de infraestrutura | [SCALING_PLAN.md](SCALING_PLAN.md) |
| Validar pagamento real em produção (Mercado Pago) | [PAYMENT_PRODUCTION_VALIDATION.md](PAYMENT_PRODUCTION_VALIDATION.md) |
| Planejar marketing, aquisição e growth | [marketing/README.md](marketing/README.md) |

Os documentos marcados acima como arquitetura/dados/API/rotas/ambiente/
integrações/operação/segurança/autorização/testes/troubleshooting/checklist/
scaling/validação de pagamento são mantidos por outra frente de trabalho em
paralelo a esta atualização — este README aponta para eles, mas não descreve
o conteúdo interno de cada um.

## Rodando o projeto localmente

Scripts definidos em `package.json`:

```bash
npm install
cp .env.example .env      # preencha as chaves reais — ver docs/ENV.md
npx prisma migrate deploy # aplica as migrations no PostgreSQL
npm run dev                # inicia o servidor Next.js em modo dev (localhost:3000)
```

Outros scripts úteis:

| Script | Comando | Uso |
| --- | --- | --- |
| Build de produção | `npm run build` | valida o build do Next.js |
| Servir build de produção | `npm run start` | roda o build gerado |
| Lint | `npm run lint` | ESLint (`eslint-config-next`) |
| Testes | `npm test` | Vitest, execução única (`vitest run`) |
| Testes em watch | `npm run test:watch` | Vitest em modo observação |

O projeto usa **PostgreSQL** (via Prisma) — não roda contra um banco vazio
sem uma instância PostgreSQL real acessível (local ou remota) e as
migrations aplicadas. Ver [ENV.md](ENV.md) para as variáveis obrigatórias
(banco, Groq, Mercado Pago, Resend, NextAuth) e [DATABASE.md](DATABASE.md)
para o modelo de dados.

> Nota do `AGENTS.md`/`CLAUDE.md` do repositório: a versão do Next.js usada
> aqui pode divergir do que qualquer modelo de IA "sabe" por padrão — ao
> mexer em convenções do framework, consulte `node_modules/next/dist/docs/`
> antes de escrever código nesse ponto.

## Produto e planejamento

- [FEATURES.md](FEATURES.md): inventário funcional completo, feature por
  feature, com rota principal e público.
- [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md): proposta de valor, segmentos de
  carreira, o que é grátis vs. pago e os módulos do produto.
- [USER_FLOWS.md](USER_FLOWS.md): jornadas ponta a ponta (cadastro, análise,
  indicação, pagamento, tour guiado).
- [ROADMAP_FEATURES.md](ROADMAP_FEATURES.md): o que ainda não existe e está
  priorizado.
- [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md): prontidão de lançamento.
- [SCALING_PLAN.md](SCALING_PLAN.md): evolução de infraestrutura.
- [PAYMENT_PRODUCTION_VALIDATION.md](PAYMENT_PRODUCTION_VALIDATION.md):
  homologação real do Mercado Pago em produção.

## Infraestrutura relacionada

- [`../README.md`](../README.md): instalação e visão resumida do repositório.
- [`../observability/README.md`](../observability/README.md) (se presente):
  Prometheus, Loki, Promtail e Grafana.
- [`../prisma/schema.prisma`](../prisma/schema.prisma): fonte de verdade do
  modelo de dados.

## Regra de manutenção

Toda alteração que crie ou modifique uma funcionalidade deve revisar:

1. `FEATURES.md`, quando mudar comportamento de produto;
2. `ROUTES.md` e `API.md`, quando criar ou alterar rotas;
3. `DATABASE.md`, quando alterar o Prisma;
4. `ENV.md` e `INTEGRATIONS.md`, quando introduzir configuração externa;
5. `AUTHORIZATION.md` e `SECURITY.md`, quando mudar acesso ou dados sensíveis;
6. `OPERATIONS.md`, quando mudar deploy, jobs, backup ou observabilidade;
7. `ROADMAP_FEATURES.md`, movendo o item para "entregue" quando ele sair do
   roadmap e virar feature real em `FEATURES.md`.

O checklist mínimo de uma entrega é: documentação atualizada, migration
versionada quando aplicável, testes relevantes e validação com `npm run lint`,
`npm test` e `npm run build`.
