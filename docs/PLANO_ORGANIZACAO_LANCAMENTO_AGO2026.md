# Plano de organização e lançamento — agosto 2026

Este documento parte do diagnóstico feito a partir de
[FUNCOES_DO_SISTEMA.md](FUNCOES_DO_SISTEMA.md): o CarreirasMatch já implementa
praticamente todo o ecossistema listado ali (análise de Match, kit de
candidatura, comparador de vagas, Kanban, entrevistas, LinkedIn/GitHub, piloto
automático, empresas, parceiros, freelancer, educação). O problema não é falta
de funcionalidade — é que o produto não comunica, integra e prova o que já
existe. Este plano organiza o que fazer a respeito, sem propor novas
funcionalidades.

Antes de anunciar qualquer item abaixo como pronto, valide no código: este
plano assume que o inventário de 05/08/2026 está correto, mas
`src/` continua sendo a fonte de verdade.

## Objetivo do ciclo

Parar de vender "uma coleção de ferramentas" e passar a vender uma jornada
única: **vaga → Match → kit de candidatura → acompanhamento → entrevista**.
Não abrir nenhuma funcionalidade nova neste ciclo — reorganizar, validar e
expor o que já existe.

## Prioridade 1 — Landing e posicionamento

- Mensagem única na home: "Compare seu currículo com a vaga, prepare toda a
  candidatura e acompanhe cada oportunidade até a entrevista."
- Um CTA principal: "Analisar currículo e vaga grátis".
- Remover ou reduzir destaque de módulos secundários (jogos, ensino médio,
  concursos) na primeira dobra; eles continuam existindo, mas não competem
  com a mensagem principal.
- Arquivos prováveis: `src/components/marketing-home.tsx`,
  `src/components/hero-instant-scanner.tsx`, `src/app/descobrir/page.tsx`.

## Prioridade 2 — Jornada única visível no produto

- Unificar os endpoints hoje separados (`/api/tools/prepare-application`,
  `/api/tools/application-kit`, `/api/tools/cover-letter`,
  `/api/tools/application-answer`, `/api/tools/interview-simulator`, etc.) em
  um fluxo de UI só: "Preparar esta candidatura", com passos sequenciais em
  vez de ferramentas soltas.
- Cada etapa deve indicar a próxima ação (currículo adaptado → carta →
  respostas → mensagem ao recrutador → perguntas de entrevista → salvar no
  Kanban).
- Validar que o resultado de uma etapa (ex.: Match e lacunas) realmente
  alimenta a etapa seguinte (ex.: currículo adaptado, plano de estudo) — ver
  Prioridade 5 (integração).

## Prioridade 3 — Demonstração e prova social

- Criar uma seção/página pública com um exemplo real (anonimizado) mostrando
  Match antes e depois dos ajustes, com números concretos.
- Reunir depoimentos e métricas de uso reais (candidaturas preparadas,
  entrevistas conquistadas) apenas onde houver dado comprovável — não
  inventar números.

## Prioridade 4 — Onboarding por objetivo

- Ao entrar, perguntar objetivo único: preparar candidatura, encontrar vagas,
  melhorar currículo, treinar entrevista, melhorar LinkedIn.
- Conduzir para uma única ação inicial em vez de expor o menu completo.
- Verificar reaproveitamento do onboarding existente em `src/app/onboarding`
  e `src/lib/onboarding-objectives.ts` antes de criar fluxo novo.

## Prioridade 5 — Integração real entre módulos (auditoria técnica)

Auditoria feita em 05-06/08/2026 lendo o código. Um primeiro levantamento
(por busca automatizada, olhando rota por rota isoladamente) apontou vários
"não integrados" que, ao reler o fluxo completo com o componente de tela que
chama cada rota, se mostraram falsos positivos: a integração existia, só não
estava na rota que foi olhada primeiro. Isso é registrado abaixo porque é uma
lição de método, não só de resultado: para afirmar "não integrado", é preciso
ler onde a rota é chamada, não só a rota em si.

### Integrado (confirmado no código, sem ação pendente)

- Candidatura → entrevista: perguntas vêm da análise vinculada
  (`src/app/interviews/[applicationId]/page.tsx:17-19,90`).
- Piloto automático → Kanban: cria `Application` real com
  `status: "applied"` na mesma transação da fila
  (`src/lib/auto-apply.ts:202-221,278-298`).
- Indicação → crédito de diagnóstico: desbloqueia sozinho ao 3º indicado
  confirmado, sem fila de aprovação (`src/lib/referrals.ts:45-74`).
- Freelancer: proposta aceita → contrato criado na mesma transação, vinculado
  por `proposalId` (`src/app/api/freelance/proposals/[id]/route.ts:67-105`).
- Análise → registro de candidatura: `saveAnalysisAsApplication` grava
  `analysisId` já na criação (`src/app/applications/actions.ts:273-334`),
  chamada pelo botão "salvar candidatura" da tela de resultado
  (`src/components/analysis-display.tsx:1288`). O `quick-save`
  (`src/app/api/applications/quick-save/route.ts`) que parecia ser esse elo
  quebrado é código morto — nenhum componente do frontend o chama.
- Comparador de vagas → candidatura: o botão "Preparar candidatura" de cada
  card já chama `/api/tools/prepare-application`, que cria/atualiza um
  `Application` real com `fitScore`, `jobId` e notas da comparação
  (`src/app/tools/comparador-vagas/ComparadorVagasClient.tsx:148-178`,
  `src/app/api/tools/prepare-application/route.ts:57-78`).
- `/insights` e `/evolucao` não são "dashboards pessoais incompletos": por
  design, `/insights` é conteúdo público agregado/anônimo para SEO
  ("Termômetro do Currículo", `src/app/insights/page.tsx:9-19`) e `/evolucao`
  é a tela do plano de evolução de cargo, não um agregador de entrevistas
  (`src/app/evolucao/page.tsx:7-10`). Não há gap de continuidade aqui — o
  levantamento inicial partiu de uma suposição errada sobre o propósito
  dessas páginas.

### Corrigido nesta sessão

- LinkedIn optimizer / GitHub review agora persistem o resultado (antes só
  devolviam pro cliente e somiam): novo model `ToolReviewResult`
  (`prisma/schema.prisma`, migration `20260805130000_add_tool_review_result`),
  upsert em `POST /api/tools/linkedin-optimizer` e `POST
  /api/tools/github-review`, `GET` nas mesmas rotas pra recuperar sem gastar
  cota de IA de novo, e as telas carregam o último resultado ao abrir.
- `cover-letter` e `application-answer` agora pré-preenchem currículo/vaga
  quando abertos a partir de uma candidatura ou de uma análise, em vez de
  pedir pra colar tudo nova: novo endpoint `GET /api/tools/prepare-context`
  (aceita `applicationId` ou `analysisId`), lido pelos dois formulários
  (`CoverLetterForm.tsx`, `ApplicationAnswerForm.tsx`); os links de
  `applications/[id]/page.tsx` e `report/[id]/page.tsx` passam o id.
- `resume-from-scratch` e `profile-from-scratch` agora pré-preenchem
  "projetos/experiências" com as `ProfessionalEvidence` já cadastradas do
  usuário, além dos cursos que `resume-from-scratch` já usava
  (`src/app/tools/resume-from-scratch/page.tsx`,
  `src/app/tools/profile-from-scratch/page.tsx`).
- Corrigido de passagem um bug pré-existente que quebrava o build inteiro:
  `src/lib/feature-access.ts` importava `Prisma` de `@prisma/client`, mas o
  client é gerado em `@/generated/prisma/client` (output customizado no
  schema). Não era item do plano, mas travava qualquer verificação.

### Corrigido em sessão posterior (06/08/2026)

- Lacunas da análise → `/api/career-growth/plan`: agora busca a análise mais
  recente do usuário (`strengths`/`weaknesses`/`fixes`) e passa como contexto
  pro prompt de `generateCareerGrowthPlan`
  (`src/app/api/career-growth/plan/route.ts`, `src/lib/career-growth.ts`). O
  prompt instrui a IA a usar isso como base real, sem repetir os itens
  literalmente — mitigação deliberada ao risco registrado abaixo de misturar
  lacunas de vaga externa com lacunas de promoção interna sem critério.
  Decisão de manter foi confirmada com o produto em 06/08/2026.

- Empresa: candidatura recebida pelo feed (`.../vagas/[id]/candidatar`) agora
  recalcula Match via IA na primeira candidatura, gravando `fitScore` e
  `fitReason` em `CompanyJobApplication` (campos novos, migration
  `20260806090000_add_company_job_application_fit_score`; ver
  `src/app/api/empresa/vagas/[id]/candidatar/route.ts:47-72`). Continua sendo
  outro fluxo do que `.../vagas/[id]/rematch` (banco de talentos) — não foi
  unificado, só passou a calcular também no fluxo do feed.

### Ainda não integrado (real, não corrigido)

- Lacunas da análise → `action-plan`: só faz toggle de itens já existentes
  (`src/app/api/action-plan/[id]/route.ts:16-31`), não gera nada novo. Baixo
  risco, não priorizado.

## Prioridade 6 — Qualidade de experiência e de resultado

- Revisar estados vazios, tempo de resposta de IA, recuperação de erro e uso
  em celular nas telas centrais da jornada (análise, kit, Kanban, entrevista).
- Testar consistência dos scores e da geração de currículo/DOCX entre
  execuções e entre modelos de IA configurados.

## Prioridade 7 — Funil de analytics

Confirmar que o funil abaixo está instrumentado ponta a ponta (eventos já
existem em `src/lib` conforme `FUNCOES_DO_SISTEMA.md` seção 22/26, mas o funil
completo precisa ser conferido, não assumido):

visita → análise iniciada → currículo enviado → vaga inserida → análise
concluída → cadastro → diagnóstico visualizado → oferta vista → checkout
iniciado → pagamento aprovado → primeira candidatura preparada → retorno D7 →
cancelamento.

**Confirmado em 06/08/2026**: os eventos de `src/lib/analytics.ts`
(`LANDING_VIEWED`, `ANALYSIS_STARTED`, `RESUME_UPLOADED`,
`JOB_DESCRIPTION_ADDED`, `ANALYSIS_COMPLETED`, `SIGNUP_COMPLETED`,
`DIAGNOSTIC_TEASER_VIEWED`, `CHECKOUT_STARTED`, `PAYMENT_CONFIRMED`,
`APPLICATION_CREATED`) cobrem cada etapa e têm chamada real em componente
(não só declarados), verificado por grep em `src/components` e `src/app`.
"Retorno D7" e "cancelamento" não têm evento de front-end dedicado — são
derivados do banco (status de assinatura, timestamps de sessão), o que é
arquitetura esperada para esses dois pontos, não lacuna.

## Fora de escopo deste ciclo

- Qualquer funcionalidade nova (o inventário já é grande — ver
  `FUNCOES_DO_SISTEMA.md`).
- Novos módulos de produto (ex.: expansão do marketplace freelancer).
- Repriificação ([[pricing-conversao-zero-vendas]] já orienta não subir preço
  sem dado).

## Critério de conclusão do ciclo

Um item deste plano só é considerado concluído quando:

1. está implementado e validado em `src/`;
2. está visível na jornada principal do produto (não apenas em uma rota
   isolada);
3. está refletido em `FUNCOES_DO_SISTEMA.md` ou no documento de produto
   correspondente, se mudar comportamento existente.
