# Rotas de páginas

Inventário de `src/app/**/page.tsx` (App Router). Rotas de API
(`src/app/api/**`) estão em [API.md](API.md). Parâmetros dinâmicos aparecem
entre colchetes. O controle de acesso central de página vive em
`src/auth.config.ts` (`authorized` callback), aplicado pelo proxy
(`src/proxy.ts`) — ver [ARCHITECTURE.md](ARCHITECTURE.md).

## Públicas e institucionais

| Rotas | Finalidade |
| --- | --- |
| `/`, `/comece`, `/gratuito`, `/analise`, `/curriculo-gratis` | Aquisição e entrada no produto |
| `/curriculo-sem-experiencia`, `/como-fazer-curriculo` | Landings de conteúdo aberto |
| `/estagio`, `/jovem-aprendiz`, `/primeiro-emprego` | Landings de entrada no mercado |
| `/faculdade-ou-tecnico` | Landing de decisão acadêmica |
| `/recolocacao`, `/transicao` | Landings de carreira profissional |
| `/concurso`, `/oab` | Landings de preparação para provas |
| `/assinar` | Planos e checkout |
| `/sobre`, `/contato`, `/ajuda` | Institucional e atendimento |
| `/termos`, `/privacidade` | Documentos legais |
| `/login`, `/register` | Identidade do candidato |
| `/esqueci-senha`, `/redefinir-senha` | Recuperação de acesso |
| `/blog`, `/blog/[slug]` | Conteúdo editorial (posts gerados por IA) |
| `/mentorias` | Landing de mentorias |
| `/concursos`, `/vestibulares`, `/mercado-de-trabalho` | Radares/conteúdo por nicho (RSS + agregação) |
| `/cursos-gratuitos`, `/cursos-gratuitos/[state]/[city]` | Cursos gratuitos e páginas locais |
| `/vagas-de-hoje`, `/vagas-publicas`, `/vagas-publicas/[state]/[city]` | Descoberta pública de vagas/oportunidades |
| `/vagas/[slug]` | Detalhe público de vaga do feed |
| `/vagas/empresa/[id]` | Detalhe público de uma `CompanyVaga` publicada |
| `/report`, `/report/[id]`, `/report/[id]/map` | Relatório e mapa do diagnóstico de currículo |
| `/desafio` | Banner/landing do "Desafio do Match" (indicação/gamificação) |
| `/empresas`, `/empresas/[slug]` | Diretório e página pública de marca empregadora |
| `/parceiros`, `/parceiros/[id]` | Diretório e página pública de parceiro de curso |
| `/freelancers`, `/freelancers/[id]` | Vitrine pública de freelancers e perfil individual |
| `/projetos`, `/projetos/[id]`, `/projetos/novo` | Marketplace de projetos freelancer (listagem, detalhe, publicar) |
| `/jogos`, `/jogos/digitar`, `/jogos/forca`, `/jogos/memoria`, `/jogos/ordenar`, `/jogos/quiz`, `/jogos/termo`, `/jogos/vf` | Minijogos de carreira (rankings via `GameScore`) |

`PUBLIC_PATHS` em `src/auth.config.ts` é a lista autoritativa de prefixos
públicos; ferramentas marcadas `free` no catálogo (`tools-catalog.ts`) também
ficam abertas. Novas páginas não são públicas automaticamente.

## Candidato autenticado

| Rotas | Finalidade |
| --- | --- |
| `/dashboard` | Resumo da conta |
| `/profile`, `/settings` | Perfil e preferências |
| `/resume`, `/resume/[id]` | Currículos |
| `/history` | Histórico de análises |
| `/feed` | Feed de vagas e matching |
| `/applications` | Funil de candidaturas (kanban) |
| `/interviews`, `/interviews/[applicationId]` | Preparação de entrevista |
| `/action-plan` | Plano de ação pós-diagnóstico |
| `/suporte`, `/suporte/[id]` | Tickets de suporte do usuário |
| `/mensagens`, `/mensagens/[id]` | Caixa de mensagens do marketplace freelancer |
| `/influencer` | Painel do usuário dono de cupom de indicação |
| `/freelancer`, `/freelancer/perfil` | Ativar/editar o próprio `FreelancerProfile` |
| `/freelancer/propostas` | Propostas enviadas (como freelancer) |
| `/freelancer/meus-projetos` | Projetos publicados/contratados (como contratante) |

Algumas páginas autenticadas exigem também assinatura/entitlement checado no
próprio server component (`require-subscription-page.ts`,
`require-auth-page.ts`) — o proxy sozinho não representa todas as regras.

## Empresa

| Rota | Acesso | Finalidade |
| --- | --- | --- |
| `/empresa/login`, `/empresa/cadastro` | Público | Login e cadastro de empresa |
| `/empresa` (grupo `(painel)`) | Sessão de empresa | Painel/resumo |
| `/empresa/vagas`, `/empresa/vagas/nova`, `/empresa/vagas/[id]`, `/empresa/vagas/[id]/editar` | Sessão de empresa | CRUD de `CompanyVaga` |
| `/empresa/triagem/nova`, `/empresa/triagem/[id]` | Sessão de empresa | Nova triagem e detalhe (candidatos ranqueados) |
| `/empresa/talentos` | Sessão de empresa | Busca no banco de talentos |
| `/empresa/contatos` | Sessão de empresa | Pedidos de contato enviados a candidatos |
| `/empresa/equipe` | Sessão de empresa (owner) | Gestão de `CompanyMember` |
| `/empresa/perfil` | Sessão de empresa | Perfil e página pública |
| `/empresa/billing` | Sessão de empresa | Créditos de triagem e histórico |
| `/empresa/relatorios` | Sessão de empresa | Relatórios/indicadores |

Conta de empresa é isolada da conta de candidato e identificada na sessão por
`accountType: "company"` (ver [ARCHITECTURE.md](ARCHITECTURE.md)).

## Parceiro

| Rota | Acesso | Finalidade |
| --- | --- | --- |
| `/parceiro` | Público | Landing do programa de parceiros |
| `/parceiro/login`, `/parceiro/cadastro` | Público | Login e cadastro de parceiro |
| `/parceiro/dashboard` | Sessão de parceiro | Painel/resumo |
| `/parceiro/dashboard/cursos` | Sessão de parceiro | Cursos cadastrados |
| `/parceiro/dashboard/anunciar` | Sessão de parceiro | Comprar/usar créditos de destaque |
| `/parceiro/dashboard/leads` | Sessão de parceiro | Leads capturados nos cursos |
| `/parceiro/dashboard/faturamento` | Sessão de parceiro | Histórico de compra de créditos |
| `/parceiro/dashboard/perfil` | Sessão de parceiro | Perfil do parceiro |

Isolada de candidato e empresa; `accountType: "partner"`.

## Administração

| Rota | Finalidade |
| --- | --- |
| `/admin` | Operação geral (conceder assinatura/crédito, trocar modelo de IA) |
| `/admin/suporte` | Fila de tickets de suporte |
| `/admin/suporte/[id]` | Tratamento de um ticket |

Acesso validado por `requireAdminPage()` (`src/lib/admin.ts`), que checa a
sessão contra `ADMIN_EMAILS` (env var) e `hasFullAccessEmail`.

## Ferramentas (`/tools`)

O catálogo começa em `/tools` e contém:

- carreira: `career-guide`, `career-change-guide`, `career-growth-guide`,
  `first-job-guide`, `reemployment-guide`, `entrepreneurship-tips`;
- currículo e perfil: `resume-from-scratch`, `resume-templates`,
  `ats-checklist`, `linkedin-review`, `github-review`,
  `profile-from-scratch`, `project-to-experience`, `cover-letter`;
- entrevista: `interview-guide`, `interview-questions`,
  `interview-simulator`;
- estudos e vocação: `vocation-test` (`[area]`, `discover`, `college`,
  `exam-archive`, `[area]/cutoff-estimate`, `[area]/exam-map`,
  `[area]/study-calendar`), `essay-grader`, `essay-showcase`,
  `schedule-conflict-checker`, `internship-calculator`, `internship-guide`,
  `internship-checklist`;
- jovem aprendiz: `apprentice-guide`, `apprentice-areas`,
  `apprentice-companies`;
- concursos e OAB: `concurso` (`page`, `simulado`, `nota-de-corte`,
  `plano-de-estudo`), `oab`, `oab/segunda-fase`;
- utilidades: `salary-calculator`, `compare-jobs`, `behavioral-test`.

Ferramentas marcadas `free` no catálogo (`src/lib/tools-catalog.ts`) são
conteúdo aberto (guia com anúncio) acessível sem login; as demais exigem
`requireToolAccess()` no server component, que valida sessão e,
dependendo da ferramenta, assinatura ativa ou segmento de carreira.

## Rotas técnicas

`/robots.txt` (`robots.ts`), `/sitemap.xml` (`sitemap.ts`) e `/ads.txt`
(`ads.txt/route.ts`) são geradas dinamicamente e ficam fora do proxy.
`/manifest.ts`, `/icon.png`, `/apple-icon.png`, `/opengraph-image.tsx` são
metadados/PWA. Assets estáticos ficam fora do matcher do proxy. `/api/*` não
passa pelo proxy: cada endpoint é responsável pela própria autenticação (ver
[API.md](API.md)).
