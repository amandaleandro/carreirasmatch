# Banco de dados

## Estado atual

O schema em `prisma/schema.prisma` usa **PostgreSQL** com Prisma 7. A URL é
fornecida por `DATABASE_URL` em `prisma.config.ts`. O Docker Compose inicia
PostgreSQL 17 e persiste dados no volume `postgres-data`.

O repositório preserva scripts referentes à migração anterior de SQLite. Eles
são históricos/operacionais e não significam que o runtime atual use SQLite.

## Mapa de entidades

### Identidade

- `User`: candidato, perfil, preferências e relações do produto.
- `Account`, `Session`, `VerificationToken`: estruturas do Auth.js.
- `PasswordResetToken`: recuperação de senha.
- `Company`: identidade separada de empresa.

### Currículo e carreira

- `Resume`: texto e PDF do currículo.
- `Analysis`: diagnóstico de currículo contra vaga; vários campos complexos
  são JSON serializado em `String`.
- `ProfileSuggestion`: cursos, certificações e livros sugeridos.
- `WeeklyGoal`, `UserCourse`: metas e cursos do usuário.
- `VocationTestResult`, `SoftSkillTestResult`: avaliações.
- `StudyScheduleItem`, `ClassScheduleItem`: planejamento de estudos.

### Vagas e candidaturas

- `Job`: vaga do feed e metadados normalizados.
- `JobMatch`: score entre currículo e vaga.
- `Application`: candidatura do usuário.
- `ApplicationActivity`: histórico de mudança de status.
- `JobAlert`: alerta salvo.

### Oportunidades públicas e conteúdo

- `OpportunitySource`, `SourceSync`, `PublicOpportunity`: fontes, execuções e
  oportunidades agregadas.
- `OpportunityClick`, `OpportunityReport`: métricas e denúncias.
- `PublicJobBulletin`, `ExternalCourse`, `CareerVideo`, `RadarItem`: conteúdo
  público sincronizado.
- `Post`: blog.
- `PartnerSubmission`: conteúdo enviado por parceiro.

### Receita e aquisição

- `Payment`: pagamento do candidato.
- `Subscription`: estado atual da assinatura.
- `Coupon`: desconto, atribuição e comissão.
- `Lead`: contato capturado antes do cadastro.
- `FreeToolUsage`: controle de ferramenta gratuita.
- `PageView`: analytics próprio.

### Empresa

- `CompanyPayment`: pacote de créditos.
- `CompanyJob`: triagem/vaga interna.
- `CompanyCandidate`: currículo classificado.
- `TalentContactRequest`: consentimento de contato empresa-candidato.

### Operação

- `SupportTicket`, `SupportMessage`: atendimento.
- `EmailLog`: idempotência de e-mails.
- `AppSetting`: configuração alterável em runtime.

## Relações centrais

```text
User
├── Resume ── Analysis ── Payment
├── Application ── ApplicationActivity
├── Subscription
├── JobAlert
├── SupportTicket ── SupportMessage
└── TalentContactRequest ── Company

Job ── JobMatch ── Resume
Job ── Application

OpportunitySource ── PublicOpportunity
PublicOpportunity ── OpportunityClick
PublicOpportunity ── OpportunityReport

Company ── CompanyJob ── CompanyCandidate
Company ── CompanyPayment
```

## Regras importantes

- Exclusões usam `Cascade` para dados estritamente pertencentes ao pai e
  `SetNull` quando o histórico deve sobreviver.
- `Payment.mpPaymentId` e `CompanyPayment.mpPaymentId` são únicos.
- `Subscription.userId` é único: há um estado de assinatura por usuário.
- `Job.url` é único e `JobMatch` é único por currículo/vaga.
- `TalentContactRequest` é único por empresa/usuário.
- Valores monetários são inteiros em centavos.
- Strings que guardam JSON devem ser parseadas com fallback seguro e validadas
  na fronteira.

## Migrations

Fluxo normal:

```bash
npx prisma migrate dev --name descricao_da_mudanca
npx prisma generate
```

Produção:

```bash
npx prisma migrate deploy
```

Nunca edite uma migration que já foi aplicada em produção. Faça backup antes de
migrations destrutivas e valide contagens das entidades críticas: `User`,
`Resume`, `Analysis`, `Payment`, `Subscription`, `Application`, `Company` e
`PublicOpportunity`.

## Backup e restauração

O serviço `postgres-backup` executa `scripts/backup-postgres.sh`, com intervalo e
retenção configuráveis. Um backup só é confiável depois de um teste de
restauração em banco isolado. Veja [OPERATIONS.md](OPERATIONS.md).
