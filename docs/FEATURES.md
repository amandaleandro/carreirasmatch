# Inventário de funcionalidades

Catálogo funcional do CarreirasMatch: o que cada área faz, para quem e por
qual rota principal. Para segmentação de público e regras free/pago, ver
[PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md). Para jornadas ponta a ponta, ver
[USER_FLOWS.md](USER_FLOWS.md). Para arquitetura técnica e modelo de dados,
ver [ARCHITECTURE.md](ARCHITECTURE.md) e [DATABASE.md](DATABASE.md).

## 1. Dashboard

- **Rota**: `/dashboard` (exige login).
- **Para quem**: candidato autenticado.
- **O que faz**: tela inicial pós-login. Mostra a análise mais recente
  (score circular, `applicationStatus` recomendado), atalhos para as
  ferramentas do segmento de carreira do usuário (`toolsForSegment`),
  métricas de jornada de candidatura (`computeJourneyMetrics`), resultado do
  teste comportamental se houver, e o ranking mensal de jogos em destaque.
  É o ponto de partida do tour guiado.

## 2. Análise de vaga (núcleo do produto)

- **Rota**: `/analise` (`analyze-vaga.tsx`) → `POST /api/analyze`.
- **Para quem**: qualquer visitante, mesmo sem login (limitado por rate
  limit de IP), e candidatos autenticados.
- **O que faz**: usuário envia um PDF de currículo (ou reaproveita o já
  enviado) e descreve/cola a vaga. O backend extrai o texto do PDF
  (`pdf-parse`) e chama a Groq para (a) avaliar aderência currículo x vaga e
  (b) extrair o currículo em formato estruturado.
- **Resultado (`Analysis`)**: scores (geral, técnico, experiência,
  senioridade, ATS), pontos fortes/fracos, correções sugeridas, palavras-
  chave faltantes, checklist ATS, perguntas de entrevista prováveis, plano
  de estudo, mensagem sugerida ao recrutador, cargos alternativos, possíveis
  objeções, estratégia de aplicação e um `applicationStatus` recomendado
  (`apply_now` / `adjust_first` / `deprioritize`).
- **Trilha de transição de carreira**: quando aplicável, a análise também
  gera habilidades transferíveis, narrativa de transição, resposta padrão
  para "por que está mudando de carreira" e cargos-ponte (`bridgeRoles`).
- **Acesso**: o score simples é sempre gratuito. O diagnóstico completo é
  liberado automaticamente na primeira análise de qualquer usuário; depois
  disso, por assinatura ativa (dentro do limite mensal do segmento) ou
  pagamento avulso `diagnostic` vinculado à análise (ver
  [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md)).
- **Relatórios**: `/report` lista o histórico de análises; `/report/[id]`
  mostra o relatório completo ou o teaser + CTA de compra; `/history` é o
  histórico paginado com filtro por status.

## 3. Feed de vagas

- **Rota**: `/feed`.
- **Para quem**: candidato autenticado.
- **O que faz**: lista vagas agregadas de múltiplas fontes externas, cada
  uma pontuada por fit score de IA contra o currículo mais recente do
  usuário (`JobMatch`). Suporta filtro, paginação e busca manual de novas
  vagas (`POST /api/feed/fetch-jobs`). Usuário também pode adicionar uma
  vaga manualmente por URL, com scraping do texto (`src/lib/scrape-job.ts`,
  com checagem anti-SSRF).
- **Fontes**: Adzuna, Jooble, Gupy, Sólides, Himalayas, RemoteOK,
  RemoteJobs.org, TheMuse, LinkedIn, Indeed (scraping via Playwright);
  Glassdoor implementado mas não homologado. Cada fonte é opcional e
  configurada por env var própria.

## 4. Todas as vagas (sem curadoria)

- **Rota**: `/todas-as-vagas`.
- **Para quem**: candidato autenticado (e visitante, dependendo da liberação
  no middleware).
- **O que faz**: catálogo completo de vagas abertas na plataforma, sem o
  filtro de matching por currículo do feed — com filtro manual por área e
  nível. Complementa `/feed` para quem quer ver tudo, não só o recomendado.

## 5. Candidaturas (kanban)

- **Rota**: `/applications`.
- **Para quem**: candidato autenticado.
- **O que faz**: quadro kanban com status `saved → applied → interview →
  technical_test → offer / rejected / archived`. Cada mudança grava um
  registro em `ApplicationActivity` (histórico auditável). Suporta prazos
  (`deadline`), data de entrevista (`interviewAt`) e vínculo opcional com
  uma vaga do feed e/ou uma análise. Também acompanha **metas semanais**
  (`WeeklyGoal`): candidaturas, ajustes de currículo e entrevistas por
  semana, com progresso calculado.

## 6. Currículo (resume)

- **Rota**: `/resume` (redireciona para a análise mais recente),
  `/resume/[id]` (editor).
- **Para quem**: candidato autenticado.
- **O que faz**: permite editar resumo e experiências sugeridos pela IA,
  salvando um "override" (`Analysis.resumeOverride`). Gera PDF final
  (`pdf-lib` + template) a partir do currículo estruturado + edições.
- **`/curriculo-gratis`**: gerador de currículo do zero, fora do fluxo de
  análise paga, usado como isca de topo de funil (também sem login).

## 7. Ferramentas (`/tools/*`)

- **Rota**: `/tools` (hub) e mais de 25 sub-rotas.
- **Para quem**: varia por ferramenta — algumas são 100% públicas (`free`),
  outras liberadas para qualquer conta logada (`accountFree`), e as demais
  seguem a assinatura do segmento do usuário. Cada ferramenta lista os
  segmentos aos quais se aplica (`src/lib/tools-catalog.ts`).
- **O que faz**: catálogo de guias, testes, calculadoras e geradores por
  segmento — checklist ATS, calculadora de salário, teste comportamental,
  carta de apresentação, comparador de vagas, corretor/vitrine de redação,
  revisão de LinkedIn/GitHub, currículo/perfil do zero, projeto→experiência,
  teste vocacional, guias de carreira por segmento (aprendiz, primeiro
  emprego, estágio, transição, recolocação, entrevista), calculadora e
  checklist de estágio, verificador de conflito de horário, dicas de
  empreendedorismo, e preparação específica para concurso e OAB.
- Acesso controlado por `ToolAccessGate` (componente) e
  `requireToolAccess`/`hasToolAccess` (lib).

## 8. Mentorias

- **Rota**: `/mentorias`.
- **Para quem**: qualquer usuário (conteúdo aberto).
- **O que faz**: vídeos educativos, mentorias e cursos gratuitos de
  carreira, entrevista, currículo e outras habilidades, curados a partir do
  YouTube.

## 9. Radar de concursos

- **Rota**: `/concursos` (e `/concurso` para conteúdo relacionado).
- **Para quem**: qualquer usuário, com destaque para o segmento
  `concurseiro`.
- **O que faz**: agrega editais, inscrições e provas de concursos públicos
  via RSS, atualizados ao longo do dia (agendador roda às 08h, 14h e 20h,
  horário de São Paulo). Não há alerta por e-mail hoje — ver
  [ROADMAP_FEATURES.md](ROADMAP_FEATURES.md).

## 10. Radar de vestibulares

- **Rota**: `/vestibulares`.
- **Para quem**: qualquer usuário, com destaque para o segmento `student`.
- **O que faz**: reúne vestibulares, ENEM, Sisu, ProUni e bolsas mais
  recentes via RSS, no mesmo esquema de atualização do radar de concursos.
  Também sem alerta por e-mail hoje.

## 11. Marketplace freelancer

- **Rotas**: `/freelancer` (hub), `/freelancer/perfil`,
  `/freelancer/propostas`, `/freelancer/meus-projetos`, `/projetos`,
  `/projetos/novo`, `/projetos/[id]`, vitrine pública `/freelancers`,
  `/freelancers/[id]`.
- **Para quem**: qualquer `User` — sem papéis fixos de "cliente" vs.
  "freelancer"; a mesma pessoa pode publicar um perfil e/ou contratar.
- **O que faz**:
  - **Perfil** (`FreelancerProfile`): headline, bio, categoria, habilidades,
    valor/hora (ou "a combinar"), portfólio, toggle `available`/`published`
    que controla a visibilidade na vitrine pública. Reputação
    (`ratingSum`/`ratingCount`/`completedCount`) é desnormalizada a partir
    das avaliações.
  - **Projetos** (`FreelanceProject`): contratante publica escopo,
    categoria, habilidades desejadas, orçamento (fixo/hora), faixa de
    valor, modelo de trabalho e prazo. Ciclo: `open → in_progress →
    completed | cancelled`.
  - **Propostas** (`FreelanceProposal`): freelancer envia carta + valor +
    prazo por projeto; status `pending | accepted | rejected | withdrawn`.
  - **Contrato** (`FreelanceContract`): criado ao aceitar uma proposta;
    guarda valor combinado e ciclo `active → delivered → completed` /
    `cancelled`; habilita mensagens e avaliação mútua.
  - **Mensagens** (`FreelanceThread`/`FreelanceMessage`): conversa por
    projeto entre as partes, com indicador de leitura.
  - **Avaliações** (`FreelanceReview`): nota 1-5 + comentário ao concluir
    contrato, nas duas direções.
- Ainda sem escrow/pagamento integrado — o valor é combinado fora da
  plataforma.

## 12. Jogos de carreira

- **Rota**: `/jogos` (hub) e sub-rotas `digitar`, `forca`, `memoria`,
  `ordenar`, `quiz`, `termo`, `vf`. Rota pública, liberada no middleware.
- **Para quem**: qualquer usuário, logado ou não.
- **O que faz**: 7 minijogos educativos de carreira e mercado — Speed Typer
  (digitação), Show do Match (quiz por área), Termos Pareados (memória),
  Termo (Wordle de termos profissionais), Forca Profissional, Verdadeiro ou
  Falso e Ordene o Processo. Cada partida grava um `GameScore`
  (`POST /api/jogos/scores`) por jogo/área/usuário, usado para montar
  rankings diário, mensal e anual (Top 10) exibidos no hub. Usuários no Top
  10 mensal ganham destaque especial e aparecem no dashboard.

## 13. Desafio do Match (indicação)

- **Rota**: `/desafio`.
- **Para quem**: qualquer usuário, logado ou anônimo.
- **O que faz**: envia currículo + vaga e recebe o "Match %" e um card
  compartilhável para stories. Ao mesmo tempo, é o hub do programa de
  indicação: usuário compartilha um link com seu `userId` como `?ref=`; a
  cada novo usuário logado que abre `/desafio?ref=<id>`, a indicação é
  registrada (`registerUserReferral`, em `src/lib/referrals.ts`); a cada 3
  indicações confirmadas, o indicador ganha 1 crédito de diagnóstico
  completo (`unlockedFullDiagnosticCredits`). Detalhe completo do fluxo em
  [USER_FLOWS.md](USER_FLOWS.md).

## 14. Configurações (settings)

- **Rota**: `/settings`.
- **Para quem**: candidato autenticado.
- **O que faz**: edição de perfil, papéis de interesse, cursos concluídos,
  tema claro/escuro, e seção de cobrança (`billing-section.tsx`) com status
  da assinatura e opção de assinar ou cancelar.

## 15. Administração

- **Rota**: `/admin` (gated por `ADMIN_EMAILS` ou `hasFullAccessEmail`), com
  `/admin/suporte` para tickets.
- **Para quem**: administrador do sistema.
- **O que faz**: busca de usuário por e-mail e concessão manual de crédito
  de análise, desbloqueio de diagnóstico ou assinatura; troca do modelo Groq
  ativo em produção sem redeploy (`AppSetting`); CRUD de cupons de desconto;
  gestão de fontes externas de vaga; revisão de denúncias de oportunidades;
  atendimento de tickets de suporte.

## 16. Influenciador

- **Rota**: `/influencer`.
- **Para quem**: usuário marcado como dono de cupom (`isInfluencerUser`).
- **O que faz**: painel com link de indicação próprio, estatísticas de uso
  do cupom (cadastros e pagamentos atribuídos: primeira análise,
  diagnóstico, assinatura) e comissão calculada por venda. Influenciador tem
  acesso total ao produto sem pagar.

## 17. Empresa (B2B)

- **Rotas**: `/empresa/cadastro`, `/empresa/login` (conta separada,
  `accountType: "company"`), painel em `/empresa/(painel)/*`: visão geral,
  `vagas` (CRUD de vagas próprias + `vagas/nova`, `vagas/[id]`), `triagem`
  (envio de currículos em lote + `triagem/nova`, `triagem/[id]`),
  `talentos` (busca no banco de talentos), `contatos` (pedidos de contato
  com candidatos), `relatorios`, `equipe` (membros da conta), `perfil`,
  `billing`.
- **Para quem**: empresas que querem triar currículos e/ou publicar vagas.
- **O que faz**: a empresa cria uma triagem, envia currículos; o sistema
  extrai e classifica os candidatos, consumindo uma franquia gratuita e
  depois créditos comprados. A busca no banco de talentos só alcança
  candidatos com `discoverable` ativo; contato com um candidato exige um
  `TalentContactRequest` aceito por ele — dados de contato não são
  liberados sem esse aceite.
- **Vitrine pública**: `/empresas` (catálogo) e `/empresas/[slug]` (página
  da empresa).

## 18. Portal de parceiros

- **Rotas**: `/parceiro/cadastro`, `/parceiro/login` (conta separada,
  `accountType: "partner"`), painel `/parceiro/dashboard` com sub-rotas de
  cursos, leads, anunciar (compra de créditos) e perfil.
- **Para quem**: instituições de ensino/empresas que querem anunciar cursos
  gratuitos no catálogo público.
- **O que faz**: CRUD de `ExternalCourse` do próprio parceiro; pode marcar
  curso como `featured`, consumindo créditos (`Partner.credits`); créditos
  são comprados via Mercado Pago (`PartnerPayment`, `kind: "ad_pack"`) e
  concedidos após confirmação de pagamento; painel mostra cliques
  (`PartnerCourseClick`) e leads (`PartnerLead`) recebidos por curso.
- **Vitrine pública**: `/parceiros` (catálogo) e `/parceiros/[id]` (página
  do parceiro com seus cursos), além do catálogo geral em
  `/cursos-gratuitos`.

## 19. Landing pages e captação

- **Rotas**: `/`, `/comece`, e páginas segmentadas (`/jovem-aprendiz`,
  `/primeiro-emprego`, `/estagio`, `/faculdade-ou-tecnico`,
  `/transicao`, `/recolocacao`, `/oab`), além de `/curriculo-gratis`,
  `/curriculo-sem-experiencia`, `/como-fazer-curriculo`.
- **Para quem**: visitante não autenticado; usuário logado é redirecionado
  direto para `/analise`.
- **O que faz**: landing por nicho de carreira, cada uma com copy e CTA
  ajustados ao segmento. Captura de lead (`lead-gate.tsx` →
  `POST /api/leads`) antes de revelar resultado de teste vocacional ou
  análise simples a visitante sem conta.

## 20. Conteúdo institucional

- **Rotas**: `/blog`, `/blog/[slug]`, `/mercado-de-trabalho`, `/sobre`,
  `/contato`, `/suporte`, `/suporte/[id]`, `/ajuda`, `/termos`,
  `/privacidade`, `/vagas-de-hoje`, `/vagas/[slug]`, `/vagas-publicas`,
  `/vagas-publicas/[state]`, `/cursos-gratuitos`,
  `/cursos-gratuitos/[state]`.
- **O que faz**: blog, páginas SEO de mercado de trabalho, institucionais
  (termos, privacidade — LGPD), suporte ao usuário, e páginas indexáveis de
  vagas/cursos por estado/cidade alimentadas pelas fontes públicas
  oficiais.

## 21. Pagamentos (Mercado Pago)

- **Rotas de API**: `POST /api/billing/payment` (avulso — Payment Brick,
  aceita cartão e Pix), `POST /api/billing/subscription` (recorrente —
  Preapproval/Subscription Brick), `POST /api/billing/webhook` (eventos
  `payment` e `subscription_preapproval`, validados por HMAC).
- **O que faz**: pagamento avulso desbloqueia `first_analysis` ou
  `diagnostic` de uma análise específica, com suporte a cupom; funciona sem
  login — o visitante paga com e-mail e a conta é criada/recuperada por
  e-mail. Assinatura recorrente cria uma `Subscription` 1:1 com o usuário.
  Cupons (`Coupon`) atribuem cadastros/pagamentos a influenciadores.

## Requisitos não funcionais e limitações conhecidas

- **Idioma**: produto 100% em pt-BR, sem i18n.
- **Persistência**: PostgreSQL via Prisma, com volume e backup periódico.
- **Rate limiting**: em memória, não distribuído — aplicado a análise
  anônima, login, cadastro e outras ações sensíveis.
- **Scraping**: depende de Playwright/Chromium e checagem anti-SSRF ao
  buscar vaga por link.
- Ver [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) para o levantamento
  completo de débito técnico e bloqueadores de lançamento.

## Referências cruzadas

| Assunto | Documento |
| --- | --- |
| Segmentos, free vs. pago, módulos | [PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md) |
| Jornadas ponta a ponta | [USER_FLOWS.md](USER_FLOWS.md) |
| O que ainda não existe | [ROADMAP_FEATURES.md](ROADMAP_FEATURES.md) |
| Stack técnica, modelo de dados resumido | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Modelo de dados completo | [`prisma/schema.prisma`](../prisma/schema.prisma) |
| Todas as rotas de página | [ROUTES.md](ROUTES.md) |
| Todos os endpoints de API | [API.md](API.md) |
