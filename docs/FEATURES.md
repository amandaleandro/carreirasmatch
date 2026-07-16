# Funcionalidades e Requisitos

Documentação funcional do produto **CarreirasMatch**: o que o sistema faz,
para quem, e sob quais regras de negócio. Para arquitetura técnica, modelo
de dados resumido e fluxos internos, ver [`ARCHITECTURE.md`](ARCHITECTURE.md).
Para variáveis de ambiente, [`ENV.md`](ENV.md). Para o estado atual de
prontidão para lançamento, [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md).

## 1. Visão de produto

Plataforma web em pt-BR que usa IA (Groq/LLM) para ajudar pessoas a:

1. entender o quão aderente seu currículo é a uma vaga específica;
2. corrigir e otimizar o currículo;
3. se preparar para entrevistas;
4. montar e acompanhar um plano de ação de carreira;
5. organizar candidaturas em um funil (kanban);
6. descobrir vagas relevantes automaticamente (feed com matching).

Monetização por **assinatura recorrente** (segmentada por perfil de
carreira) e **pagamentos avulsos** (diagnóstico completo de uma análise
específica), via Mercado Pago. Uma camada grande de conteúdo/ferramentas
gratuitas (`/tools/*`) funciona como porta de entrada de SEO/geração de
leads.

## 2. Segmentação de usuário (`careerSegment`)

Todo usuário (ou visitante) se encaixa em um segmento de carreira, que
governa preço, oferta, ferramentas visíveis e a trilha de análise padrão
(`src/lib/career-segments.ts`, `src/lib/career-offers.ts`):

| Segmento | Público-alvo |
|---|---|
| `apprentice` | Jovem aprendiz |
| `internship` | Estagiário/candidato a estágio |
| `first_job` | Primeiro emprego |
| `student` | Estudante (ensino médio/vestibular) |
| `career_change` | Transição/mudança de carreira |
| `career_pro` | Profissional buscando recolocação/crescimento |

O segmento define: preço da assinatura e do avulso, limite mensal de
análises com diagnóstico completo, e quais ferramentas de `/tools` estão
liberadas (`src/lib/tool-access.ts`, `src/lib/entitlements.ts`).

## 3. Features por área

### 3.1 Análise de currículo x vaga (núcleo do produto)

- **Onde**: `/analise` (`src/components/analyze-vaga.tsx`) → API
  `POST /api/analyze`.
- **O que faz**: usuário envia um PDF de currículo (ou reaproveita um já
  enviado) + descreve a vaga (texto livre ou colada). O backend extrai o
  texto do PDF (`pdf-parse`) e chama a Groq em paralelo para (a) analisar
  aderência currículo x vaga e (b) extrair o currículo em formato
  estruturado.
- **Resultado (`Analysis`)**: scores (geral, técnico, experiência,
  senioridade, ATS), pontos fortes/fracos, correções sugeridas, palavras-
  chave faltantes, checklist de compatibilidade com ATS, perguntas de
  entrevista prováveis, plano de estudo, mensagem sugerida para o
  recrutador, cargos alternativos, possíveis objeções do recrutador,
  estratégia de aplicação, e um `applicationStatus` recomendado
  (`apply_now` / `adjust_first` / `deprioritize`) com justificativa.
- **Trilha de mudança de carreira**: quando aplicável, a análise também
  gera habilidades transferíveis, narrativa de transição, resposta para
  "por que você está mudando de carreira" e cargos-ponte
  (`bridgeRoles`).
- **Acesso**: funciona até para **visitante anônimo** (sem login),
  limitado por rate limit de IP (10 análises/hora). O **score simples é
  sempre gratuito**; o **diagnóstico completo** (todo o restante) é
  liberado por assinatura ativa (dentro do limite mensal do segmento) ou
  por pagamento avulso (`diagnostic`) vinculado àquela análise específica
  (`src/lib/entitlements.ts`, `canViewFullDiagnostic`). Usuário sem
  desbloqueio vê um "teaser" (`src/lib/analysis-teaser.ts`) com botão de
  desbloqueio (`unlock-diagnostic-button.tsx`).

### 3.2 Relatórios e histórico

- **`/report`**: lista cronológica de todas as análises do usuário
  (evolução ao longo do tempo).
- **`/report/[id]`**: relatório detalhado de uma análise específica -
  completo se desbloqueado, teaser + CTA de compra se não.
- **`/report/[id]/map`**: visão adicional ("mapa de oportunidade") gated
  pela mesma regra de desbloqueio.
- **`/history`**: histórico paginado (12 por página), com filtro por
  `applicationStatus`.
- Análises podem ser excluídas (`delete-analysis-button.tsx` →
  `DELETE /api/analysis/[id]`).

### 3.3 Otimização de currículo

- **`/resume`** redireciona para a análise mais recente do usuário;
  **`/resume/[id]`** (`resume-optimizer.tsx`) permite editar resumo e
  experiências sugeridos pela IA, salvando um "override" em JSON
  (`Analysis.resumeOverride`, via `PATCH /api/resume/[id]`).
- **Geração de PDF**: `GET/POST /api/resume/[id]/pdf` monta um PDF final
  (`pdf-lib` + template em `src/lib/resume-template.ts`) a partir do
  currículo estruturado + edições do usuário.
- **`/curriculo-gratis`** (`free-resume-builder.tsx`): gerador de
  currículo do zero, fora do fluxo de análise paga - usado como isca de
  topo de funil.

### 3.4 Preparação de entrevistas

- **`/interviews`**: simulação/preparação baseada na análise mais
  recente (exige assinatura ativa).
- **`/interviews/[applicationId]`**: mesma funcionalidade vinculada a
  uma candidatura específica do kanban.
- Perguntas podem ser regeradas (`POST /api/interviews/[id]/regenerate`)
  e o progresso salvo (`PATCH /api/interviews/[id]`).

### 3.5 Plano de ação

- **`/action-plan`**: checklist derivado do `studyPlan` gerado na
  análise, organizado em fases (essencial / bom ter / depois). Progresso
  persistido via `PATCH /api/action-plan/[id]`.

### 3.6 Funil de candidaturas (kanban)

- **`/applications`**: quadro kanban com status
  `saved → applied → interview → technical_test → offer / rejected / archived`.
  Cada mudança de status grava um registro em `ApplicationActivity`
  (histórico auditável do funil).
- Suporta prazos (`deadline`), data de entrevista (`interviewAt`), e
  vínculo opcional com uma `Job` (do feed) e/ou uma `Analysis`.
- **Metas semanais** (`WeeklyGoal`): metas de candidaturas, ajustes de
  currículo e entrevistas por semana, com métricas de progresso
  (`src/lib/applications.ts`, `computeJourneyMetrics`).

### 3.7 Feed de vagas

- **`/feed`**: lista vagas agregadas de múltiplas fontes externas, cada
  uma pontuada por fit score (IA) contra o currículo mais recente do
  usuário (`JobMatch`). Suporta filtros, paginação e busca manual de
  novas vagas (`POST /api/feed/fetch-jobs`).
- **Fontes de vaga** (`src/lib/job-sources/`), cada uma opcional e
  configurada por env var própria: Adzuna, Jooble, Gupy, Sólides,
  Himalayas, RemoteOK, RemoteJobs.org, TheMuse, LinkedIn, Indeed (via
  scraping com Playwright). Glassdoor está implementado mas **não
  homologado**.
- Usuário também pode adicionar uma vaga manualmente por URL
  (`POST /api/feed/add-job`), com scraping do texto da vaga
  (`src/lib/scrape-job.ts`, com checagem de segurança de URL em
  `url-safety.ts` contra SSRF).
- Vagas ganham tags/tiers de relevância (`src/lib/feed-tags.ts`).

### 3.8 Sugestões de perfil

- **`/profile`** (gated por assinatura): sugestões geradas por IA de
  cursos, certificações e livros, cada uma com um `impactScore` (0-100)
  estimando o ganho de empregabilidade (`profile-suggestions.tsx`,
  `POST/GET /api/profile-suggestions`).

### 3.9 Catálogo de ferramentas gratuitas (`/tools/*`)

Mais de 25 sub-rotas de conteúdo/IA, usadas tanto como benefício do plano
profissional quanto como geração de leads/SEO. Cada uma tem endpoint de IA
correspondente em `/api/tools/*` quando é interativa:

| Ferramenta | Rota | Descrição |
|---|---|---|
| Teste comportamental | `behavioral-test` | Perfil de soft skills |
| Carta de apresentação | `cover-letter` | Geração de cover letter via IA |
| Comparador de vagas | `compare-jobs` | Compara currículo contra múltiplas vagas |
| Corretor de redação | `essay-grader` / `essay-showcase` | Correção e vitrine de redações (ENEM/vestibular) |
| Revisão de perfil | `github-review`, `linkedin-review` | Auditoria de perfil via IA |
| Currículo/perfil do zero | `resume-from-scratch`, `profile-from-scratch` | Construção guiada por IA |
| Projeto → experiência | `project-to-experience` | Converte projeto pessoal em item de currículo |
| Teste vocacional | `vocation-test/*` | Descoberta de área, nota de corte estimada, cronograma de estudo, banco de provas, escolha de faculdade |
| Guias de carreira | `apprentice-guide`, `career-change-guide`, `career-growth-guide`, `career-guide`, `first-job-guide`, `interview-guide`, `reemployment-guide` | Conteúdo estático segmentado |
| Estágio/aprendiz | `apprentice-areas`, `apprentice-companies`, `internship-calculator`, `internship-checklist`, `internship-guide` | Conteúdo + calculadoras + checklists |
| Verificador de conflito de horário | `schedule-conflict-checker` | Cruza grade de aulas com horário de trabalho/estágio |
| Empreendedorismo | `entrepreneurship-tips` | Conteúdo estático |

Acesso a cada ferramenta é controlado por segmento/assinatura via
`ToolAccessGate` (componente) e `requireToolAccess`/`hasToolAccess` (lib).

### 3.10 Landing pages e captação

- **`/`** e **`/comece`**: landing pública segmentada por nicho de
  carreira (`niche-landing.tsx`), redireciona usuário logado direto para
  `/analise`.
- **`/curriculo-gratis`**: isca de geração de currículo grátis.
- **Captura de lead** (`lead-gate.tsx` → `POST /api/leads/route`): antes
  de revelar o resultado de um teste vocacional ou de uma análise simples
  a um visitante sem conta, o sistema pede nome/e-mail/telefone.

### 3.11 Conta e configurações

- **`/login`, `/register`**: autenticação por e-mail/senha (bcrypt) ou
  Google OAuth (se configurado). Cadastro coleta segmento de carreira e
  área profissional para já personalizar a experiência.
- **`/settings`**: edição de perfil, papéis de interesse
  (`interested-roles-form.tsx`), cursos concluídos
  (`course-list-form.tsx`), tema claro/escuro, e seção de cobrança
  (`billing-section.tsx`) com status da assinatura e opção de assinar/
  cancelar.

### 3.12 Pagamentos (Mercado Pago)

- **Pagamento avulso** (`POST /api/billing/payment`, Payment Brick):
  para `first_analysis` (desbloqueio da primeira análise) ou
  `diagnostic` (desbloqueio de diagnóstico de uma análise específica),
  com suporte a cupom de desconto. **Funciona sem login** (mesmo padrão da
  assinatura): o visitante paga com e-mail, a conta é criada/recuperada por
  e-mail e ele é levado a `/register?email=…` para definir a senha. No
  diagnóstico anônimo, a análise só pode ser desbloqueada se estiver **sem
  dono** (`resume.userId == null`) - e nesse caso é reivindicada para o
  usuário ao confirmar o pagamento (síncrono no cartão, via webhook no PIX);
  análise já pertencente a uma conta exige login. Preço do avulso é uniforme
  entre segmentos, então o segmento default do fluxo anônimo não altera o
  valor cobrado.
- **Assinatura recorrente** (`POST /api/billing/subscription`,
  Preapproval/Subscription Brick): cria `Subscription` vinculada ao
  usuário (1:1), com `currentPeriodEnd` e status.
- **Webhook** (`POST /api/billing/webhook`): recebe eventos `payment` e
  `subscription_preapproval` do Mercado Pago, valida assinatura HMAC
  (`x-signature`) e atualiza `Payment`/`Subscription`. Sem o segredo
  correto (`MERCADOPAGO_WEBHOOK_SECRET`), pagamentos reais nunca são
  confirmados automaticamente (ver [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md)).
- **Cupons** (`Coupon`): código único por influenciador, com desconto
  diferente para compra avulsa e assinatura, contagem de uso.

### 3.13 Administração

- **`/admin`** (gated por `ADMIN_EMAILS` ou `hasFullAccessEmail`):
  - busca de usuário por e-mail e concessão manual de crédito de
    análise, desbloqueio de diagnóstico ou assinatura
    (`grant-analysis-credit`, `grant-diagnostic`, `grant-subscription`);
  - troca do modelo Groq ativo em produção sem redeploy
    (`admin-groq-model.tsx` → `GET/POST /api/admin/groq-model`,
    persistido em `AppSetting`);
  - CRUD de cupons de desconto (`admin-coupon-manager.tsx`).

### 3.14 Institucional

- **`/termos`**, **`/privacidade`**: Termos de Uso e Política de
  Privacidade (LGPD), cobrindo uso de IA, coleta de dados e pagamentos.
  Linkados no cadastro.

## 4. Requisitos funcionais (resumo por prioridade)

**Essenciais (core do produto)**
- Upload de currículo em PDF e extração de texto confiável.
- Geração de análise de aderência currículo x vaga via IA, com score e
  diagnóstico estruturado.
- Controle de acesso ao diagnóstico completo por assinatura ou pagamento
  avulso, por análise.
- Persistência de histórico de análises por usuário (e por visitante
  anônimo, associável a lead).
- Autenticação por e-mail/senha com rate limiting.
- Processamento de pagamento e confirmação via webhook assinado.

**Importantes (retenção e valor percebido)**
- Otimização e exportação de currículo em PDF.
- Kanban de candidaturas com histórico de mudança de status.
- Feed de vagas com matching automático por fit score.
- Preparação de entrevista personalizada por análise/candidatura.
- Painel admin para suporte a usuários (concessão manual de acesso).

**Complementares (aquisição/SEO)**
- Catálogo de ferramentas e guias gratuitos por segmento.
- Captura de lead antes de revelar resultado a visitante anônimo.
- Landing pages segmentadas por nicho.

## 5. Requisitos não funcionais e limitações conhecidas

- **Idioma**: produto 100% em pt-BR, sem i18n.
- **Persistência**: SQLite em arquivo - adequado para baixo tráfego
  inicial, **não escala para escrita concorrente**; sem backup
  automático hoje.
- **Rate limiting**: em memória (não distribuído) - não sobrevive a
  múltiplas instâncias/reinícios; aplicado a análise anônima, login,
  cadastro e ações autenticadas.
- **Confiabilidade da IA**: sem retry/backoff nem validação de schema
  (zod) sobre a resposta da Groq - resposta truncada é só logada, não
  reprocessada.
- **Segurança de webhook**: validação HMAC falha fechado (rejeita se mal
  configurado), o que é seguro mas exige configuração correta antes de
  aceitar pagamentos reais.
- **Scraping**: depende de Playwright/Chromium (imagem Docker específica)
  e checagem de segurança de URL (`url-safety.ts`) para evitar SSRF ao
  buscar vaga por link.
- Ver [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md) para o levantamento
  completo de débito técnico e bloqueadores de lançamento.

## 6. Referências cruzadas

| Assunto | Documento |
|---|---|
| Stack técnica, autenticação, modelo de dados resumido, fluxos internos | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Variáveis de ambiente | [`ENV.md`](ENV.md) |
| Estado de prontidão para lançamento / débito técnico | [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md) |
| Modelo de dados completo (models, campos, relações) | [`prisma/schema.prisma`](../prisma/schema.prisma) |
