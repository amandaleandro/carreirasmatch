# Rotas de páginas

Inventário das páginas do App Router. Rotas em `src/app/api` estão em
[API.md](API.md). Parâmetros dinâmicos aparecem entre colchetes.

## Públicas e institucionais

| Rotas | Finalidade |
| --- | --- |
| `/`, `/comece`, `/gratuito`, `/analise`, `/curriculo-gratis` | Aquisição e entrada no produto |
| `/estagio`, `/jovem-aprendiz`, `/primeiro-emprego` | Landings de entrada no mercado |
| `/faculdade-ou-tecnico` | Landing de decisão acadêmica |
| `/recolocacao`, `/transicao` | Landings de carreira profissional |
| `/concurso`, `/oab` | Landings de preparação para provas |
| `/assinar` | Planos e checkout |
| `/sobre`, `/contato`, `/ajuda` | Institucional e atendimento |
| `/termos`, `/privacidade` | Documentos legais |
| `/login`, `/register` | Identidade do candidato |
| `/esqueci-senha`, `/redefinir-senha` | Recuperação de acesso |
| `/blog`, `/blog/[slug]` | Conteúdo editorial |
| `/parceiros`, `/mentorias` | Parcerias e serviços |
| `/concursos`, `/vestibulares`, `/mercado-de-trabalho` | Conteúdo por nicho |
| `/cursos-gratuitos`, `/cursos-gratuitos/[state]/[city]` | Cursos e páginas locais |
| `/vagas-de-hoje`, `/vagas-publicas`, `/vagas-publicas/[state]/[city]` | Descoberta pública |
| `/vagas/[slug]` | Detalhe público de vaga |
| `/report`, `/report/[id]`, `/report/[id]/map` | Relatório e mapa do diagnóstico |

As rotas públicas são definidas em `src/auth.config.ts`. Novas páginas não são
públicas automaticamente.

## Candidato autenticado

| Rotas | Finalidade |
| --- | --- |
| `/dashboard` | Resumo da conta |
| `/profile`, `/settings` | Perfil e preferências |
| `/resume`, `/resume/[id]` | Currículos |
| `/history` | Histórico de análises |
| `/feed` | Feed de vagas e matching |
| `/applications` | Funil de candidaturas |
| `/interviews`, `/interviews/[applicationId]` | Preparação de entrevista |
| `/action-plan` | Plano de ação |
| `/suporte`, `/suporte/[id]` | Tickets do usuário |
| `/influencer` | Painel do dono de cupom |

Algumas páginas autenticadas também exigem assinatura ou entitlement no próprio
server component. O proxy sozinho não representa todas as regras de acesso.

## Empresa

| Rota | Acesso |
| --- | --- |
| `/empresa/login`, `/empresa/cadastro` | Público |
| `/empresa` | Sessão de empresa |
| `/empresa/triagem/nova` | Sessão de empresa |
| `/empresa/triagem/[id]` | Empresa proprietária |
| `/empresa/talentos` | Sessão de empresa |
| `/empresa/billing` | Sessão de empresa |

Conta de empresa é isolada da conta de candidato e identificada na sessão por
`accountType = company`.

## Administração

| Rota | Finalidade |
| --- | --- |
| `/admin` | Operação geral |
| `/admin/suporte` | Fila de suporte |
| `/admin/suporte/[id]` | Tratamento de ticket |

O acesso é validado por `requireAdminPage()` usando `ADMIN_EMAILS` e a regra de
acesso total configurada no código.

## Ferramentas

O catálogo começa em `/tools` e contém:

- carreira: `career-guide`, `career-change-guide`, `career-growth-guide`,
  `first-job-guide`, `reemployment-guide`;
- currículo e perfil: `resume-from-scratch`, `resume-templates`,
  `ats-checklist`, `linkedin-review`, `github-review`,
  `profile-from-scratch`, `project-to-experience`, `cover-letter`;
- entrevista: `interview-guide`, `interview-questions`,
  `interview-simulator`;
- estudos: `vocation-test` e subrotas por área, `essay-grader`,
  `essay-showcase`, `schedule-conflict-checker`, `internship-calculator`,
  `internship-guide`, `internship-checklist`;
- jovem aprendiz: `apprentice-guide`, `apprentice-areas`,
  `apprentice-companies`;
- concursos e OAB: `concurso`, `concurso/simulado`,
  `concurso/nota-de-corte`, `concurso/plano-de-estudo`, `oab`,
  `oab/segunda-fase`;
- utilidades: `salary-calculator`, `compare-jobs`,
  `behavioral-test`, `entrepreneurship-tips`.

## Rotas técnicas

`/robots.txt`, `/sitemap.xml` e `/ads.txt` são públicas e ficam fora do proxy.
Assets estáticos e imagens também ficam fora do matcher. `/api/*` não passa pelo
proxy: cada endpoint é responsável por sua autenticação.
