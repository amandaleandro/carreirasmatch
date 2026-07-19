# MVP - Plataforma de Carreira e Recolocação

Aplicação web (pt-BR) que ajuda pessoas a analisar currículos com IA, simular
entrevistas, montar plano de ação de carreira, acompanhar candidaturas e
encontrar vagas - com um modelo de monetização via assinatura e pagamentos
avulsos pelo Mercado Pago.

> Índice completo: [`docs/README.md`](docs/README.md). Documentação relacionada:
> [`docs/FEATURES.md`](docs/FEATURES.md) ·
> [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
> [`docs/ENV.md`](docs/ENV.md) · [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md)

## Stack

- **Next.js 16** (App Router) + **React 19**
- **NextAuth v5** (beta) - login por credenciais (e-mail/senha com bcrypt);
  Google OAuth suportado mas desativado por padrão (sem client id/secret)
- **Prisma 7** + **PostgreSQL 17** - ver
  [`prisma/schema.prisma`](prisma/schema.prisma)
- **Groq SDK** - análises de currículo/vaga via LLM (`src/lib/groq.ts`)
- **Mercado Pago** (`mercadopago` + `@mercadopago/sdk-react`) - pagamento
  avulso (Payment Brick) e assinatura recorrente (Preapproval/Subscription
  Brick)
- **pdf-lib** / **pdf-parse** - geração e leitura de currículos em PDF
- **cheerio** + **playwright** - scraping de fontes de vagas (Adzuna, Jooble,
  Gupy, Sólides, Glassdoor)
- **Vitest** - testes unitários (`src/**/*.test.ts`)
- **Docker** - `Dockerfile` + `docker-compose.yml` para deploy

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha as chaves reais (ver docs/ENV.md)
npx prisma migrate deploy
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando            | O que faz                                   |
|--------------------|----------------------------------------------|
| `npm run dev`      | Servidor de desenvolvimento                   |
| `npm run build`    | Build de produção                             |
| `npm start`        | Roda o build de produção                      |
| `npm run lint`     | ESLint                                        |
| `npm test`         | Testes unitários (Vitest, single run)         |
| `npm run test:watch` | Testes em modo watch                        |

## Estrutura de alto nível

```
src/app/            Rotas (App Router) - páginas e API routes
src/app/api/        Endpoints REST internos (auth, billing, analyze, feed…)
src/app/tools/      Catálogo grande de ferramentas/guias gratuitos (SEO/lead gen)
src/components/     Componentes de UI compartilhados
src/lib/            Lógica de domínio (auth, billing, groq, entitlements, feed…)
prisma/             Schema + migrations (PostgreSQL)
scripts/            Scripts avulsos (ex.: grandfather-existing-analyses.sql)
```

Veja [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para o mapeamento
completo de rotas, modelo de dados e fluxos principais (análise de
currículo, pagamento, admin).

## Banco de dados

O projeto usa **PostgreSQL 17**. No Docker Compose, os dados são persistidos no
volume `postgres-data` e o serviço `postgres-backup` cria backups periódicos.
Scripts de SQLite preservados no repositório pertencem ao processo histórico de
migração. Veja [`docs/DATABASE.md`](docs/DATABASE.md) e
[`docs/OPERATIONS.md`](docs/OPERATIONS.md).

## Pagamentos (Mercado Pago)

O token configurado em `.env` (`MERCADOPAGO_ACCESS_TOKEN`) começa com
`APP_USR-`, ou seja, **é uma credencial de produção que gera cobranças
reais**. Antes de aceitar qualquer pagamento real, confirme que
`MERCADOPAGO_WEBHOOK_SECRET` está configurado com o valor real do painel do
Mercado Pago - veja o bloqueador correspondente em
[`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md).
