# Motor de conteúdo

Este documento descreve como o conteúdo de SEO é gerado hoje, com base direto
no código dos schedulers e nas rotas de blog/radar. Não é um plano editorial
manual — as três frentes abaixo (blog, radar de concursos, radar de
vestibulares) já rodam de forma automatizada em produção.

## Blog — gerado por IA, agendado, sem CMS

- Fonte: `src/lib/blog-scheduler.ts` + `src/lib/blog-generator.ts`.
- Não existe CMS nem arquivos MDX: os posts moram na tabela `Post` (Postgres,
  via Prisma) e são renderizados dinamicamente em `src/app/blog/page.tsx` e
  `src/app/blog/[slug]/page.tsx` (ambos com `export const dynamic =
  "force-dynamic"`, sem `generateStaticParams`).
- `generateNextPost()` percorre uma lista fixa de **32 áreas vocacionais**
  (`VOCATION_AREAS`, `src/lib/vocation-areas.ts`) por um cursor persistido em
  `AppSetting` (`blog:niche_cursor`), gerando um post por área por vez, em
  round-robin.
- O prompt de geração (`generateBlogPost` em `src/lib/blog-generator.ts`)
  passa a área, a descrição da área, as subáreas e os títulos dos 15 posts
  mais recentes daquela área ("TEMAS_JA_PUBLICADOS (não repetir nenhum
  destes)") para evitar repetição de pauta. A resposta esperada é um JSON com
  `title`, `excerpt`, `coverEmoji` e blocos de conteúdo.
- Meta diária de publicação: `BLOG_POSTS_PER_DAY` (env), com fallback para
  **5 posts/dia** (`postsPerDay()` em `blog-scheduler.ts`). `runDailyTick()`
  só gera um novo post se a contagem de posts publicados hoje (fuso
  America/Sao_Paulo) ainda não bateu essa meta.
- Página de listagem tem paginação de 9 posts por página e filtro por área
  (`areaSlug`).

Isso significa que o volume de conteúdo do blog é limitado pela meta diária
configurada, não por produção manual — o gargalo, quando existe, é a
qualidade/curadoria do que a IA gera em escala, não a capacidade de
escrever. Não há revisão humana automatizada visível no fluxo (o post vai
direto para `prisma.post.create`, sem um estado de rascunho/aprovação no
código do scheduler).

## Radares de concurso e vestibular — RSS, agendado 3x/dia

- Fonte: `src/lib/radar-sync.ts` (parser de RSS/Atom, puro e testável — ver
  `src/lib/radar-sync.test.ts`) e `src/lib/external-source-sync.ts`
  (orquestração, grava em `SourceSync`/oportunidades/boletins via Prisma).
- Agendamento confirmado em `src/lib/external-source-scheduler.ts`:
  - `DEFAULT_RUN_TIMES = ["08:00", "14:00", "20:00"]`, fuso
    `America/Sao_Paulo`, sobrescrevível pela env `EXTERNAL_SOURCES_RUN_TIMES`;
  - um "tick" roda a cada 15 minutos (`TICK_INTERVAL_MS`) e só executa a
    sincronização quando o horário agendado já passou e ainda não rodou
    naquele dia (ledger salvo em `AppSetting` sob a chave
    `external-sources:runs`);
  - a sincronização real (`syncAllExternalSources`) também dispara
    `syncRadars` (radar-sync.ts) além de cursos (Aprenda Mais/MEC) e
    oportunidades públicas.
- As páginas públicas que consomem esse dado são `/concursos` e
  `/vestibulares` (mencionadas no produto; alimentadas pelos radares) e
  `/concurso` (landing de segmento).

## Páginas de segmento/guia — estáticas, mantidas manualmente

Diferente do blog, as landings por segmento (`/estagio`, `/jovem-aprendiz`,
`/primeiro-emprego`, `/transicao`, `/recolocacao`, `/oab`, `/concurso`,
`/curriculo-sem-experiencia`, `/faculdade-ou-tecnico`,
`/como-fazer-curriculo`, etc.) são código React versionado no repositório
(`src/app/<segmento>/page.tsx`), não conteúdo gerado por IA. Mudar o texto
delas é uma mudança de código, não uma tarefa editorial recorrente.

## Ferramentas gratuitas como imã de SEO/lead

`/gratuito` (`src/app/gratuito/page.tsx`) organiza o catálogo de
`src/lib/tools-catalog.ts` em duas camadas:

- **sem cadastro:** criador de currículo grátis (`/curriculo-gratis`),
  análise simples de vaga (`/analise`), teste vocacional
  (`/tools/vocation-test`), vagas de hoje (`/vagas-de-hoje`);
- **com cadastro gratuito:** as demais ferramentas marcadas `free` ou
  `accountFree` no catálogo (`TOOLS_CATALOG.filter((tool) => tool.free ||
  tool.accountFree)`).

Essa separação é o funil de captura: ferramenta aberta para tráfego SEO,
cadastro grátis como primeiro compromisso, análise paga como conversão.

## O que não existe

Não há um "banco de pautas" editorial, calendário de mídia social, ou
integração com ferramenta de SEO (Ahrefs/Semrush) no código. Todo o
conteúdo do blog e dos radares roda por scheduler automático descrito acima —
não há indício de processo humano de revisão de pauta antes da publicação.
