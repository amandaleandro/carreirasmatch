# Banco de dados

## Por que Postgres, e não SQLite

`prisma/schema.prisma` declara `datasource db { provider = "postgresql" }`.
O projeto rodou em SQLite no início; migrou para **PostgreSQL 17** porque
SQLite trava escrita sob concorrência (erro `SQLITE_FULL`/lock em produção
com múltiplos requests simultâneos) e não escala para o volume atual de
vagas/análises/eventos de funil. O client é gerado por
`generator client { provider = "prisma-client", output = "../src/generated/prisma" }`
(Prisma 7) — não roda localmente sem um Postgres real apontado em
`DATABASE_URL`; não há mais fallback SQLite no runtime, apesar de
`@prisma/adapter-better-sqlite3` ainda aparecer nas dependências (resquício
histórico).

## Modelos por área

### Identidade e conta

- **`User`** — candidato. Perfil (segmento de carreira, área, cidade/estado,
  tema, checklist de estágio), flags de indicação/cupom
  (`signupCouponId`, `referredById`, `unlockedFullDiagnosticCredits`) e a
  raiz de quase todas as relações do produto (currículos, aplicações, metas,
  testes, tickets, alertas, push, freelancer/contratante).
- **`Account`, `Session`, `VerificationToken`** — tabelas padrão do Auth.js/
  NextAuth (adapter Prisma).
- **`PasswordResetToken`** — recuperação de senha por token com expiração.
- **`Company`** — conta de empresa (empregador), autenticação própria e
  separada da de candidato. Tem `slug`/`publicProfile` para página pública de
  marca empregadora (`/empresas/[slug]`).
- **`CompanyMember`** — quem efetivamente loga por uma `Company` (`owner` ou
  `member`); `Company.email`/`passwordHash` ficam como legado do cadastro
  original, espelhado pelo membro `owner`.
- **`Partner`** — conta de parceiro (instituição que anuncia cursos), login
  próprio (`partner-credentials`).

### Currículo, análise e carreira

- **`Resume`** — texto extraído + PDF opcional do currículo. Pode não ter
  `userId` (fluxo anônimo antes de virar conta).
- **`Analysis`** — diagnóstico de currículo x vaga gerado por IA: scores
  (geral, técnico, experiência, senioridade, ATS), pontos fortes/fracos,
  plano de estudo, perguntas de entrevista, estratégia de candidatura, etc.
  Muitos campos complexos são JSON serializado em `String`. Pode estar ligado
  a um `Lead` (visitante sem conta) em vez de a um `User`.
- **`ProfileSuggestion`** — cursos/certificações/livros sugeridos por IA,
  com score de impacto e lacuna endereçada.
- **`VocationTestResult`**, **`SoftSkillTestResult`** — resultado de testes.
- **`WeeklyGoal`**, **`StudyScheduleItem`**, **`ClassScheduleItem`**,
  **`UserCourse`** — planejamento pessoal (metas semanais, cronograma de
  estudo/aula, cursos concluídos pelo usuário).
- **`FreeToolUsage`** — controla quantas vezes um usuário usou uma
  ferramenta gratuita com limite.

### Vagas, candidaturas e alertas

- **`Job`** — vaga agregada de scraping/APIs externas, com tags normalizadas
  (área, senioridade, modelo de trabalho, tipo de contrato, nível de entrada).
- **`JobMatch`** — score de match entre um `Resume` e um `Job`.
- **`Application`** / **`ApplicationActivity`** — funil (kanban) de
  candidaturas do candidato, com histórico de mudança de status.
- **`JobAlert`** — alerta salvo (query, cidade/estado, frequência).
- **`PushSubscription`** — inscrição de Web Push (VAPID) por
  dispositivo/navegador do usuário.

### Vaga publicada por empresa e triagem

- **`CompanyVaga`** — vaga cadastrada pela empresa para puxar candidatos do
  banco de talentos automaticamente por aderência; pode ser espelhada no feed
  público (`publishedToFeed`, `feedJobId` aponta pro `Job` espelho).
- **`CompanyJobApplication`** — candidatura de um `User` a uma `CompanyVaga`
  publicada no feed.
- **`CompanyJob`** / **`CompanyCandidate`** — triagem manual: a empresa
  descreve uma vaga e envia PDFs de currículo para ranquear (diferente de
  `CompanyVaga`, que puxa do banco de talentos).
- **`TalentContactRequest`** — pedido de contato de uma empresa a um
  candidato do banco de talentos (`User.discoverable`); o contato só é
  liberado quando o candidato aceita (dupla proteção: opt-in + aceite).
- **`CompanyPayment`** — compra de pacote de créditos de triagem (paralelo ao
  `Payment` do candidato, mas concede créditos em vez de assinatura).

### Marketplace freelancer

Paralelo ao fluxo de emprego, mas 100% entre `User`s comuns: qualquer usuário
pode virar freelancer e/ou contratante. Hoje é grátis (sem escrow/dinheiro
movimentado pela plataforma).

- **`FreelancerProfile`** — vitrine opt-in de um `User` como freelancer
  (headline, bio, categoria, skills, valor/hora, portfólio, reputação
  desnormalizada `ratingSum`/`ratingCount`/`completedCount`).
- **`FreelanceProject`** — projeto publicado por um contratante. Ciclo:
  `open` → (proposta aceita) `in_progress` → `completed`/`cancelled`.
- **`FreelanceProposal`** — proposta de um freelancer a um projeto (um
  freelancer só propõe uma vez por projeto).
- **`FreelanceContract`** — acordo criado quando uma proposta é aceita (um
  por projeto); habilita entrega e avaliação mútua.
- **`FreelanceReview`** — avaliação mútua pós-contrato (`client_to_freelancer`
  ou `freelancer_to_client`), uma por parte.
- **`FreelanceThread`** / **`FreelanceMessage`** — mensageria entre
  contratante e freelancer no contexto de um projeto.

### Parceiros de curso

- **`ExternalCourse`** — curso agregado (fonte externa ou parceiro),
  opcionalmente destacado (`featured`) com cupom próprio.
- **`Partner`**, **`PartnerPayment`** (compra de créditos de destaque),
  **`PartnerCourseClick`**, **`PartnerLead`** (contato capturado num curso
  do parceiro).
- **`PartnerSubmission`** — envio de conteúdo/parceria por formulário público.

### Oportunidades públicas, radares e conteúdo

- **`OpportunitySource`** / **`SourceSync`** / **`PublicOpportunity`** —
  fontes cadastradas de oportunidade pública (ex.: editais, boletins),
  execuções de sincronização e as oportunidades agregadas com score de risco
  (`riskScore`, `riskReasons`) e status do link (`linkStatus`).
- **`OpportunityClick`** / **`OpportunityReport`** — clique e denúncia de
  oportunidade.
- **`PublicJobBulletin`** — boletim de vaga pública (concurso/setor público).
- **`RadarItem`** — item de radar de concurso/vestibular vindo de RSS
  (`kind`: `concurso` | `vestibular`).
- **`CareerVideo`** — vídeo do YouTube sincronizado por área.
- **`Post`** — post de blog gerado automaticamente por IA (um por nicho em
  rodízio).

### Receita e aquisição

- **`Payment`** — pagamento avulso (`first_analysis`, `diagnostic`) ou
  assinatura, ligado ao Mercado Pago via `mpPaymentId` único; guarda também
  atribuição de campanha (`source`/`medium`/`campaign`/`content`/`sessionId`).
- **`Subscription`** — estado atual da assinatura (`userId` único: uma por
  usuário).
- **`Coupon`** — cupom de desconto de influenciador; um cupom pode ter dono
  (`ownerUserId`, acesso ao painel `/influencer`) e rastreia cadastros
  (`signups`) e resgates pagos (`usageCount`).
- **`Lead`** — contato (nome/e-mail/telefone) capturado de visitante sem
  conta antes de revelar resultado de teste vocacional ou análise simples.
- **`FunnelEvent`** — evento interno do funil, explicitamente **sem** dado
  pessoal (currículo, vaga, e-mail, telefone, IP).
- **`PageView`** — analytics próprio de visualização de página, anônimo por
  `sessionId`.

### Suporte e operação

- **`SupportTicket`** / **`SupportMessage`** / **`SupportAttachment`** —
  atendimento dentro do produto; anexos ficam como `Bytes` no banco,
  entregues só por rota autenticada (nunca pasta pública).
- **`EmailLog`** — idempotência de e-mail transacional/ciclo de vida
  (`@@unique([type, dedupeKey])`).
- **`AppSetting`** — configuração operacional editável pela tela de admin
  (ex.: qual modelo de IA usar).
- **`GameScore`** — pontuação dos minijogos (`typer`, `quiz`, `memory`, etc.)
  por usuário/área.

## Relações centrais

```text
User
├── Resume ── Analysis ── Payment
├── Application ── ApplicationActivity
├── Subscription
├── JobAlert, PushSubscription
├── SupportTicket ── SupportMessage ── SupportAttachment
├── TalentContactRequest ── Company
├── FreelancerProfile
├── FreelanceProject (como cliente) ── FreelanceProposal ── FreelanceContract ── FreelanceReview
├── FreelanceThread ── FreelanceMessage
├── GameScore
├── ownedCoupon (Coupon) / signupCouponId (Coupon)
└── referredBy / referrals (User, auto-relação)

Job ── JobMatch ── Resume
Job ── Application

Company ── CompanyMember
Company ── CompanyVaga ── CompanyJobApplication ── User
Company ── CompanyJob ── CompanyCandidate
Company ── CompanyPayment
Company ── TalentContactRequest

Partner ── ExternalCourse
Partner ── PartnerPayment, PartnerCourseClick, PartnerLead

OpportunitySource ── PublicOpportunity ── OpportunityClick, OpportunityReport
```

## Regras importantes

- Exclusão em cascata (`onDelete: Cascade`) para dados que pertencem
  estritamente ao pai (ex.: `Analysis` de um `Resume`, mensagens de um
  `SupportTicket`); `SetNull` quando o histórico deve sobreviver ao pai (ex.:
  `Application.jobId`, `User.referredById`).
- `Payment.mpPaymentId` e `CompanyPayment.mpPaymentId`/`PartnerPayment.mpPaymentId`
  são únicos — chave de idempotência do webhook do Mercado Pago.
- `Subscription.userId` é único (um estado de assinatura por usuário).
- `Job.url` é único; `JobMatch` é único por par `(resumeId, jobId)`.
- `TalentContactRequest` é único por `(companyId, userId)`.
- `FreelanceProposal` é único por `(projectId, freelancerUserId)`;
  `FreelanceContract` é único por `projectId` e por `proposalId`;
  `FreelanceReview` é único por `(contractId, authorUserId)`.
- Valores monetários são sempre inteiros em **centavos**.
- Campos que guardam JSON como `String` (a maioria dos campos complexos de
  `Analysis`, `skills`/`portfolio` do freelancer, `matchesJson` da
  `CompanyVaga` etc.) devem ser parseados com fallback seguro — não há
  validação de schema no banco.

## Migrations

Fluxo normal (dev):

```bash
npx prisma migrate dev --name descricao_da_mudanca
npx prisma generate
```

Produção (roda automaticamente no `docker-entrypoint.sh`):

```bash
npx prisma migrate deploy
```

Nunca edite uma migration já aplicada em produção. Faça backup antes de
migrations destrutivas e valide contagens das entidades críticas: `User`,
`Resume`, `Analysis`, `Payment`, `Subscription`, `Application`, `Company`,
`CompanyVaga`, `FreelanceContract` e `PublicOpportunity`.

## Backup e restauração

O serviço `postgres-backup` do Compose executa `scripts/backup-postgres.sh`
em intervalo configurável (`BACKUP_INTERVAL_SECONDS`, default diário) com
retenção local (`BACKUP_RETENTION_DAYS`, default 14 dias). Um backup só é
confiável depois de testado em restauração isolada; sincronize o diretório de
backup com armazenamento externo, já que um backup no mesmo servidor não
protege contra perda total da VPS.
