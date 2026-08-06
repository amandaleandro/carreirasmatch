# Funções do sistema

Documento funcional do CarreirasMatch, baseado nas páginas em `src/app`, APIs em
`src/app/api`, componentes, regras em `src/lib` e modelo de dados Prisma.

## 1. Objetivo e jornada principal

O sistema é uma plataforma de carreira, educação e oportunidades. A jornada
principal do candidato é:

**currículo + vaga → análise de Match → diagnóstico → preparação → candidatura → acompanhamento**

Também existem portais específicos para empresas, parceiros educacionais,
freelancers e administradores.

## 2. Acesso, contas e onboarding

- Cadastro de candidato por e-mail e senha.
- Login por credenciais e Google OAuth quando configurado.
- Recuperação e redefinição de senha.
- Cadastro e login de empresa e parceiro educacional.
- Definição do segmento de carreira e área profissional.
- Onboarding inicial e salvamento das preferências.
- Tour guiado do produto adaptado ao segmento.
- Modal de novidades e funcionalidades disponíveis.
- Controle de sessão e proteção de rotas por tipo de conta.
- Alteração de senha, preferências, tema claro/escuro e configurações de conta.
- Exportação dos dados pessoais.
- Exclusão da conta.

Rotas: `/login`, `/register`, `/empresa/login`, `/empresa/cadastro`,
`/parceiro/login`, `/parceiro/cadastro`, `/onboarding`, `/settings`.

## 3. Análise de currículo e vaga com IA

- Envio de currículo em PDF.
- Entrada da descrição da vaga ou importação da vaga por URL.
- Análise anônima inicial com limite por IP.
- Extração do texto do currículo.
- Cálculo do Match geral.
- Scores de aspectos técnicos, experiência, senioridade e ATS.
- Identificação de pontos fortes, pontos fracos e lacunas.
- Comparação de requisitos encontrados, ausentes e parcialmente atendidos.
- Identificação de palavras-chave relevantes e faltantes.
- Recomendações para corrigir e adaptar o currículo.
- Checklist de compatibilidade com ATS.
- Recomendação entre candidatar-se, ajustar o currículo ou estudar antes.
- Perguntas prováveis de entrevista.
- Mensagem sugerida para recrutador.
- Plano de estudo e próximos passos.
- Sugestão de cargos alternativos e cargos-ponte.
- Identificação de habilidades transferíveis e narrativa de transição de carreira.
- Reanálise e refinamento de um diagnóstico.
- Histórico e exclusão de análises.
- Mapa visual do diagnóstico.
- Geração e compartilhamento de card do Match.

Rotas: `/analise`, `/analise/[area]`, `/report/[id]`, `/report/[id]/map`,
`/history`, `/desafio`.

## 4. Currículos e apresentação profissional

- Cadastro, edição e gerenciamento de currículos.
- Upload de currículo existente.
- Criação de currículo do zero.
- Criação de currículo para pessoas sem experiência.
- Otimização de currículo existente.
- Transformação de projetos em experiências profissionais.
- Sugestões de melhoria de perfil.
- Extração de soft skills.
- Matriz de competências.
- Geração de carta de apresentação.
- Geração de respostas para candidatura.
- Nota de qualidade do currículo.
- Verificação de leitura por ATS.
- Selo de currículo verificável.
- Visualização e compartilhamento do currículo.
- Exportação em PDF e DOCX.

Rotas: `/resume`, `/resume/[id]`, `/curriculo-gratis`,
`/curriculo-sem-experiencia`, `/nota-do-curriculo`, `/verificador-ats`,
`/teste-curriculo-ats`, `/selo/[id]`.

## 5. Vagas e oportunidades

- Feed personalizado de vagas ordenado por aderência.
- Listagem geral de vagas sem curadoria de Match.
- Vagas do dia.
- Consulta de vaga individual e de empresa.
- Importação de vaga por URL.
- Vagas públicas e oportunidades oficiais por cargo, estado e cidade.
- Radar de concursos, vestibulares e outras oportunidades públicas.
- Busca, filtros e paginação.
- Salvamento de vagas e oportunidades.
- Registro de cliques.
- Denúncia de oportunidade inadequada.
- Alertas de novas vagas e oportunidades.
- Notificações push quando habilitadas.
- Sincronização periódica com fontes externas.
- Inclusão manual de vaga no feed quando permitido.

Rotas: `/feed`, `/todas-as-vagas`, `/vagas`, `/vagas/[slug]`,
`/vagas-de-hoje`, `/vagas-publicas`, `/vagas-publicas/[state]/[city]`,
`/radar`, `/concursos`, `/vestibulares`.

## 6. Candidaturas, plano de ação e evolução

- Salvamento rápido de uma vaga como candidatura.
- Kanban de candidaturas.
- Estados do funil de candidatura.
- Histórico de transições de status.
- Registro de datas, prazos, entrevistas e próximos passos.
- Versionamento e evolução dos dados da candidatura.
- Plano de ação associado à análise ou candidatura.
- Metas e indicadores de progresso.
- Insights sobre evolução dos scores e candidaturas.
- Checklist de estágio e acompanhamento de atividades.

Rotas: `/applications`, `/applications/[id]`, `/applications/insights`,
`/action-plan`, `/insights`, `/evolucao`, `/evidencias`.

## 7. Entrevistas e preparação

- Preparação de entrevista por candidatura.
- Roteiro personalizado de perguntas.
- Simulador de entrevista com IA.
- Rascunho de respostas para perguntas comuns.
- Feedback e avaliação de respostas.
- Feedback estruturado no formato STAR.
- Regeneração do roteiro.
- Agendamento e acompanhamento de entrevistas.
- Lembretes automáticos de entrevistas próximas.

Rotas: `/interviews`, `/interviews/[applicationId]`,
`/tools/interview-simulator`.

## 8. Perfil, networking e mensagens

- Perfil profissional editável.
- Áreas e cargos de interesse.
- Cadastro de experiências, cursos e competências.
- Perfil descobrível por empresas mediante ativação do candidato.
- Preferências de contato e privacidade.
- Solicitações de contato de empresas.
- Aceite ou recusa de solicitações.
- Exibição de contato empresarial somente após aceite.
- Mensagens e conversas na plataforma quando habilitadas.
- Programa de indicações e recompensas.

Rotas: `/profile`, `/mensagens`, `/mensagens/[id]`, `/desafio`.

## 9. Ferramentas de carreira

- Teste comportamental.
- Teste vocacional e descoberta de áreas.
- Comparador de vagas.
- Otimizador e revisor de LinkedIn.
- Revisor de GitHub.
- Gerador de currículo e perfil profissional.
- Gerador de carta de apresentação.
- Gerador de flashcards.
- Calendário de estudos.
- Mapa de competências.
- Preparação de candidatura.
- Extrator de soft skills.
- Verificador de conflitos de agenda.
- Calculadora de salário.
- Guias de primeiro emprego, estágio, jovem aprendiz, recolocação,
  transição de carreira e empreendedorismo.

Rotas: `/tools/*`.

## 10. Concursos, OAB e vestibulares

- Leitura e interpretação de edital.
- Simulado de concurso e mock exam.
- Mapa de prova por área.
- Estimativa de nota de corte.
- Plano de estudos para concurso.
- Segunda fase da OAB.
- Trilhas de vestibular e escolha profissional.
- Catálogo de universidades e cursos.
- Consulta de disciplinas, semestres e exercícios.
- Insights sobre disciplinas e currículo.
- Matrícula/registro de vínculo acadêmico quando disponível.

Rotas: `/concursos`, `/tools/concurso`, `/tools/oab`,
`/tools/vocation-test`, `/universidade`, `/estagio/trilhas`.

## 11. Ensino médio

- Hub por ano escolar e matéria.
- Questão do dia.
- Exercícios.
- Flashcards.
- Simulados.
- Tutor de estudos por chat.
- Correção e orientação de redação.
- Exemplos de redação nota 1000.
- Cronograma de estudos.
- Mapa mental.
- Calculadora ENEM.
- Comparador de faculdade e curso técnico.
- Modo foco.
- Acompanhamento de progresso e gamificação.

Rotas: `/ensino-medio`, `/ensino-medio/[materia]`,
`/ensino-medio/calculadora-enem`, `/ensino-medio/comparador`,
`/ensino-medio/cronograma`, `/ensino-medio/exercicios`,
`/ensino-medio/flashcards`, `/ensino-medio/foco`,
`/ensino-medio/mapa-mental`, `/ensino-medio/questao-do-dia`,
`/ensino-medio/redacao`, `/ensino-medio/redacao-nota-1000`,
`/ensino-medio/simulado`, `/ensino-medio/tutor`.

## 12. Jogos e gamificação

- Catálogo de jogos de carreira.
- Jogos de currículo, digitação, palavras, forca, dilemas, inbox e duelo.
- Jogos de memória, quiz, termo, verdadeiro/falso e ordenar.
- Jogos personalizados.
- Pontuação e histórico de scores.
- Desafios diários e sequência de atividades.
- Progresso, recompensas e cards compartilháveis.

Rotas: `/jogos`, `/jogos/cacapalavras`, `/jogos/curriculo`,
`/jogos/digitar`, `/jogos/dilemas`, `/jogos/duelo`, `/jogos/forca`,
`/jogos/inbox`, `/jogos/memoria`, `/jogos/quiz`, `/jogos/termo`,
`/jogos/vf`, `/jogos/ordenar`.

## 13. Desafio do Match e indicações

- Análise de Match em formato compartilhável.
- Uso com ou sem login.
- Link pessoal de indicação.
- Registro de indicação na primeira visita pelo link.
- Crédito de diagnóstico completo a cada três indicações confirmadas.
- Exibição do total indicado, progresso e créditos disponíveis.
- Consumo do crédito ao liberar diagnóstico elegível.

## 14. Piloto automático de candidaturas

- Configuração de Match mínimo.
- Limite diário de candidaturas.
- Escolha do perfil usado no envio.
- Fila de candidaturas.
- Execução autorizada do piloto.
- Acompanhamento da execução.
- Aplicação em vagas internas elegíveis.

O piloto não garante candidatura em sites externos. Fontes que exigem login,
senha ou CAPTCHA podem ser bloqueadas.

APIs: `/api/auto-apply/settings`, `/api/auto-apply/queue`,
`/api/auto-apply/run`.

## 15. Portal de empresas

- Perfil da empresa e perfil público.
- Gestão de conta, senha, equipe e usuários.
- Assinatura e compra de créditos.
- Relatórios e contatos.
- Criação, edição, duplicação, publicação e exclusão de vagas.
- Geração de descrição de vaga com IA.
- Recebimento de candidaturas.
- Alteração de status de candidatos.
- Recalculo de Match dos candidatos.
- Criação de processos de triagem.
- Envio de currículos em lote.
- Extração e classificação de currículos.
- Avaliação de requisitos eliminatórios.
- Consulta do resultado e do candidato individual.
- Geração de roteiro de entrevista do candidato.
- Busca de talentos descobríveis e elegíveis.
- Filtros por interesses e perfil.
- Solicitação e controle de contato com candidatos.

Rotas: `/empresa`, `/empresa/vagas`, `/empresa/vagas/nova`,
`/empresa/triagem`, `/empresa/triagem/nova`, `/empresa/talentos`,
`/empresa/perfil`, `/empresa/equipe`, `/empresa/contatos`,
`/empresa/relatorios`, `/empresa/billing`.

## 16. Parceiros educacionais

- Cadastro, login e perfil público do parceiro.
- Cadastro e edição de cursos gratuitos.
- Catálogo público de cursos.
- Destaque pago de cursos.
- Compra e controle de créditos de destaque.
- Registro de cliques nos cursos.
- Captação e acompanhamento de leads.
- Registro de interesse do candidato.
- Divulgação do parceiro e dos cursos por localização.

Rotas: `/parceiro`, `/parceiro/dashboard`, `/parceiro/dashboard/cursos`,
`/parceiro/dashboard/anunciar`, `/parceiro/dashboard/leads`,
`/parceiros`, `/parceiros/[id]`, `/cursos-gratuitos`.

## 17. Marketplace freelancer

- Perfil público de freelancer.
- Cadastro e busca de projetos.
- Envio de propostas.
- Geração assistida de propostas por IA.
- Aceite de proposta.
- Criação e acompanhamento de contrato.
- Conversas e mensagens entre as partes.
- Checkout de contrato quando configurado.
- Avaliação mútua ao concluir o trabalho.
- Reputação no perfil público.
- Visões de clientes, projetos, propostas e precificação.

Rotas: `/freelancer`, `/freelancer/perfil`, `/freelancer/meus-projetos`,
`/freelancer/propostas`, `/freelancer/contratos`, `/freelancer/clientes`,
`/freelancer/precificacao`, `/freelancers`, `/freelancers/[id]`,
`/projetos`, `/projetos/novo`, `/projetos/[id]`.

## 18. Conteúdo público e aquisição

- Landing page principal e páginas por segmento.
- Blog, categorias e artigos.
- Conteúdo sobre currículo, carreira e mercado de trabalho.
- Páginas de vagas, cursos, universidades e oportunidades públicas.
- Captação de leads.
- SEO, metadados e dados estruturados.
- Publicidade/AdSense quando configurada.
- Pixels e analytics de marketing mediante consentimento.
- Páginas de ajuda, contato, termos, privacidade e sobre o produto.

## 19. Assinaturas, pagamentos e permissões

- Diagnóstico avulso e primeira análise.
- Assinaturas recorrentes por segmento.
- Checkout Mercado Pago e Stripe quando configurado.
- Cartão e Pix quando disponíveis no provedor.
- Webhooks de confirmação de pagamento.
- Processamento idempotente de pagamentos.
- Liberação e extensão do período de assinatura.
- Gestão e cancelamento de assinatura.
- Cupons de desconto.
- Créditos de diagnóstico, triagem empresarial e destaque de parceiro.
- Controle de acesso por plano, assinatura, créditos, indicação e perfil admin.

## 20. Comunicação, suporte e notificações

- Abertura e acompanhamento de tickets de suporte.
- Mensagens e histórico do ticket.
- Anexos em tickets.
- Tratamento administrativo dos chamados.
- E-mails transacionais.
- Lembretes de entrevistas.
- Alertas de vagas e radar.
- Nudges de onboarding e reengajamento.
- Opt-in e integração com WhatsApp quando configurados.
- Notificações push quando autorizadas.
- Pesquisa NPS.

Rotas: `/suporte`, `/suporte/[id]`, `/contato`, `/nps`.

## 21. Administração e operação

- Dashboard administrativo.
- Busca e consulta de usuários.
- Gestão de tickets.
- Gestão de repasses.
- Concessão manual de créditos, diagnóstico e assinatura.
- Gestão de cupons.
- Gestão, sincronização e manutenção de fontes de oportunidades.
- Gestão de denúncias de oportunidades.
- Gestão do catálogo e fila de universidades.
- Configuração do modelo de IA.
- Geração de posts de blog por IA.
- Gestão de instâncias e campanhas de WhatsApp.
- Consulta e reset de analytics.
- Backfill e manutenção de tags de vagas.

Rotas: `/admin`, `/admin/usuarios`, `/admin/suporte`, `/admin/repasses`.

## 22. Segurança, dados e operação técnica

- Autenticação centralizada e proteção de rotas.
- Controle de acesso por candidato, empresa, parceiro e administrador.
- Proteção de APIs por sessão, permissão e assinatura.
- Rate limit em fluxos anônimos e de IA.
- Validação de URLs e proteção contra destinos inseguros.
- Validação de respostas estruturadas da IA.
- Webhooks com assinatura e idempotência.
- Consentimento para descoberta e contato empresarial.
- Exportação e exclusão de dados.
- Logs para evitar duplicidade em e-mails e eventos.
- Analytics de eventos e page views.
- Métricas operacionais e endpoint de health check.
- Jobs agendados para sincronização, alertas e lembretes.
- Observabilidade opcional com Sentry, Prometheus, Grafana, Loki e Plausible.

## 23. Integrações externas

- Provedores de IA compatíveis com OpenAI, incluindo Groq, Cerebras, Gemini,
  OpenAI, Together, DeepInfra e OpenRouter quando configurados.
- Mercado Pago e Stripe.
- Google OAuth.
- Resend para e-mail.
- WhatsApp/Evolution.
- Fontes externas e scrapers de vagas e oportunidades.
- YouTube para sincronização de conteúdo quando configurado.
- Sentry, Prometheus, Grafana, Loki e Plausible.

## 24. Limites funcionais

- O sistema apoia análise, preparação e organização; não garante contratação,
  aprovação ou aumento salarial.
- O score de ATS não substitui a análise de aderência à vaga.
- A candidatura automática não funciona indistintamente em sites externos.
- O contato entre empresa e candidato depende de descoberta e aceite.
- Pagamentos, IA, WhatsApp, push e analytics dependem da configuração do
  ambiente.
- Limites e recursos pagos variam conforme plano, créditos e segmento.

## 25. Fontes para manutenção deste documento

- Interfaces: `src/app`.
- APIs: `src/app/api`.
- Componentes: `src/components`.
- Regras de negócio e integrações: `src/lib`.
- Entidades e persistência: `prisma/schema.prisma`.
- Jornadas: `docs/USER_FLOWS.md`.
- Inventário anterior: `docs/FEATURES.md`.
- Mapa de acesso: `docs/ROUTES_MAPPING.md`.

Este documento deve ser revisado sempre que uma nova rota de produto, API ou
integração for criada, removida ou alterar seu comportamento.

## 26. Catálogo técnico de APIs

Esta seção registra os endpoints implementados. Os trechos entre colchetes são
parâmetros dinâmicos da URL.

### Análise, currículo e perfil

- `/api/analyze`: cria análise de currículo e vaga.
- `/api/analyze/reanalyze`: reexecuta uma análise.
- `/api/analysis/[id]`: consulta ou remove uma análise.
- `/api/analysis/[id]/refine`: refina o resultado de uma análise.
- `/api/resume/[id]`: consulta ou atualiza currículo.
- `/api/resume/[id]/pdf`: gera ou entrega PDF do currículo.
- `/api/resume/export-pdf`: exporta currículo em PDF.
- `/api/resume/export-docx`: exporta currículo em DOCX.
- `/api/profile-suggestions`: cria e lista sugestões de perfil.
- `/api/profile-suggestions/[id]`: atualiza ou remove sugestão.
- `/api/verificador-ats`: executa a verificação ATS.
- `/api/evidencias`: registra e consulta evidências de progresso.
- `/api/career-growth/plan`: cria plano de crescimento profissional.

### Autenticação e usuário

- `/api/auth/[...nextauth]`: autenticação e sessão.
- `/api/auth/forgot-password`: inicia recuperação de senha.
- `/api/auth/reset-password`: redefine senha com token.
- `/api/register`: cria conta de candidato.
- `/api/onboarding`: salva dados de onboarding.
- `/api/user`: consulta ou atualiza dados do usuário.
- `/api/user/change-password`: altera senha.
- `/api/user/export`: exporta dados pessoais.
- `/api/user/delete-account`: exclui conta.
- `/api/user/class-schedule`: cria e lista horários de aula.
- `/api/user/class-schedule/[id]`: atualiza ou remove horário de aula.
- `/api/user/internship-checklist`: consulta checklist de estágio.

### Vagas, candidaturas e alertas

- `/api/feed/fetch-jobs`: carrega vagas do feed.
- `/api/feed/add-job`: adiciona vaga ao feed.
- `/api/applications/quick-save`: salva vaga como candidatura.
- `/api/applications/[id]/versions`: consulta versões da candidatura.
- `/api/job-alerts`: cria, lista e atualiza alertas de vagas.
- `/api/job-alerts/[id]`: consulta ou remove alerta.
- `/api/public-opportunities/[id]/save`: salva oportunidade pública.
- `/api/public-opportunities/[id]/click`: registra clique.
- `/api/public-opportunities/[id]/report`: denuncia oportunidade.
- `/api/locations/cities`: consulta cidades por localização.
- `/api/auto-apply/settings`: configura piloto automático.
- `/api/auto-apply/queue`: consulta fila de candidaturas automáticas.
- `/api/auto-apply/run`: executa o piloto automático autorizado.

### Entrevistas e ferramentas de carreira

- `/api/interviews/[id]`: consulta e salva preparação de entrevista.
- `/api/interviews/[id]/regenerate`: regenera roteiro de entrevista.
- `/api/tools/application-answer`: gera resposta para candidatura.
- `/api/tools/application-kit`: gera kit de candidatura.
- `/api/tools/prepare-application`: prepara candidatura para uma vaga.
- `/api/tools/cover-letter`: gera carta de apresentação.
- `/api/tools/compare-jobs`: compara vagas.
- `/api/tools/behavioral-test`: executa teste comportamental.
- `/api/tools/vocation-test/[area]`: processa teste vocacional por área.
- `/api/tools/vocation-test/discover`: descobre áreas de interesse.
- `/api/tools/linkedin-optimizer`: otimiza LinkedIn.
- `/api/tools/linkedin-review`: revisa LinkedIn.
- `/api/tools/github-review`: revisa perfil GitHub.
- `/api/tools/interview-answer-draft`: cria rascunho de resposta.
- `/api/tools/interview-feedback`: avalia resposta de entrevista.
- `/api/tools/interview-simulator`: executa simulação de entrevista.
- `/api/tools/star-feedback`: gera feedback no formato STAR.
- `/api/tools/extract-soft-skills`: extrai soft skills.
- `/api/tools/generate-flashcards`: gera flashcards.
- `/api/tools/project-to-experience`: converte projeto em experiência.
- `/api/tools/profile-from-scratch`: gera perfil profissional.
- `/api/tools/resume-from-scratch`: gera currículo.
- `/api/tools/skill-matrix`: gera matriz de competências.
- `/api/tools/fetch-job-by-url`: importa dados de vaga por URL.
- `/api/tools/essay-grader`: corrige redação.
- `/api/tools/mock-exam`: gera mock exam.
- `/api/tools/parse-edital`: interpreta edital.
- `/api/tools/study-calendar/[area]`: gera calendário de estudos.
- `/api/tools/study-calendar/item/[id]`: atualiza item do calendário.

### Ensino médio, universidade e concursos

- `/api/ensino-medio/gerar`: gera conteúdo de estudo.
- `/api/ensino-medio/calculadora-enem`: calcula estimativa do ENEM.
- `/api/ensino-medio/comparador/analisar`: compara faculdade e curso técnico.
- `/api/ensino-medio/cronograma/gerar`: gera cronograma.
- `/api/ensino-medio/flashcards/gerar`: gera flashcards escolares.
- `/api/ensino-medio/mapa-mental/gerar`: gera mapa mental.
- `/api/ensino-medio/questao-do-dia`: retorna questão do dia.
- `/api/ensino-medio/redacao/corrigir`: corrige redação escolar.
- `/api/ensino-medio/simulado/gerar`: gera simulado.
- `/api/ensino-medio/tutor/chat`: conversa com tutor de estudos.
- `/api/tools/concurso/simulado`: gera simulado de concurso.
- `/api/tools/concurso/nota-de-corte`: calcula nota de corte.
- `/api/tools/concurso/plano-de-estudo`: gera plano de estudos.
- `/api/tools/cutoff-estimate/[area]`: estima nota de corte por área.
- `/api/tools/exam-map/[area]`: gera mapa de prova.
- `/api/tools/oab/segunda-fase`: prepara segunda fase da OAB.
- `/api/universidade/courses/search`: busca cursos.
- `/api/universidade/courses/[id]/semesters`: consulta semestres.
- `/api/universidade/subjects`: lista disciplinas.
- `/api/universidade/subjects/[id]/exercises`: consulta exercícios.
- `/api/universidade/subjects/[id]/insight`: gera insight da disciplina.
- `/api/universidade/curriculum-subjects/[id]/exercises`: consulta exercícios do currículo.
- `/api/universidade/curriculum-subjects/[id]/insight`: gera insight do currículo.
- `/api/universidade/enrollment`: registra vínculo acadêmico.

### Empresas

- `/api/empresa/register`: cadastra empresa.
- `/api/empresa/conta`: consulta ou atualiza conta.
- `/api/empresa/conta/senha`: altera senha da empresa.
- `/api/empresa/perfil`: atualiza perfil privado.
- `/api/empresa/perfil/publico`: atualiza perfil público.
- `/api/empresa/equipe`: lista e adiciona membros.
- `/api/empresa/equipe/[id]`: atualiza ou remove membro.
- `/api/empresa/vagas`: cria e lista vagas.
- `/api/empresa/vagas/[id]`: consulta, edita ou remove vaga.
- `/api/empresa/vagas/[id]/duplicar`: duplica vaga.
- `/api/empresa/vagas/[id]/rematch`: recalcula Match.
- `/api/empresa/vagas/[id]/candidatar`: registra candidatura interna.
- `/api/empresa/vagas/descricao`: gera descrição de vaga com IA.
- `/api/empresa/candidaturas/[id]`: consulta ou altera candidatura.
- `/api/empresa/candidates/status`: atualiza status de candidato.
- `/api/empresa/candidates/[id]/interview-script`: gera roteiro para candidato.
- `/api/empresa/triagem`: cria e lista triagens.
- `/api/empresa/triagem/[id]`: consulta ou remove triagem.
- `/api/empresa/triagem/[id]/curriculos`: envia currículos para triagem.
- `/api/empresa/triagem/candidato`: consulta candidato da triagem.
- `/api/empresa/talentos/buscar`: busca talentos.
- `/api/empresa/talentos/contato`: solicita contato com talento.
- `/api/empresa/contatos/[id]`: gerencia contato empresarial.
- `/api/empresa/billing/assinar`: inicia assinatura empresarial.
- `/api/empresa/billing/comprar`: compra créditos empresariais.

### Parceiros educacionais

- `/api/partner/register`: cadastra parceiro.
- `/api/partner/courses`: cria e lista cursos.
- `/api/partner/courses/[id]/highlight`: ativa ou remove destaque.
- `/api/partner/billing/comprar`: compra créditos de destaque.
- `/api/partner/contact`: registra contato com parceiro.
- `/api/partner-submissions`: registra submissões de parceiros.
- `/api/parceiro/university`: gerencia dados educacionais do parceiro.
- `/api/cursos-gratuitos/[id]/click`: registra clique em curso.
- `/api/cursos-gratuitos/[id]/interesse`: registra interesse em curso.
- `/api/leads`: cria e consulta leads.

### Freelancers

- `/api/freelance/profile`: cria ou atualiza perfil.
- `/api/freelance/pricing`: calcula sugestão de precificação.
- `/api/freelance/projects`: cria e lista projetos.
- `/api/freelance/projects/[id]/proposals`: lista ou cria propostas.
- `/api/freelance/proposals/[id]`: consulta, aceita ou atualiza proposta.
- `/api/freelance/proposals/generate-ai`: gera proposta com IA.
- `/api/freelance/contracts/[id]`: consulta ou atualiza contrato.
- `/api/freelance/contracts/[id]/checkout`: inicia checkout do contrato.
- `/api/freelance/contracts/[id]/review`: registra avaliação.
- `/api/freelance/threads/[id]/messages`: envia e consulta mensagens.

### Cobrança, acesso e indicações

- `/api/billing/products`: lista produtos e planos.
- `/api/billing/checkout-intent`: cria intenção de checkout.
- `/api/billing/payment`: cria pagamento avulso.
- `/api/billing/subscription`: cria assinatura.
- `/api/billing/subscription/manage`: gerencia assinatura.
- `/api/billing/stripe/checkout`: inicia checkout Stripe.
- `/api/billing/webhook`: processa confirmação do Mercado Pago.
- `/api/webhooks/stripe`: processa eventos Stripe.

### Suporte, comunicação e observabilidade

- `/api/support/attachments/[id]`: consulta anexo de suporte.
- `/api/nps`: registra avaliação NPS.
- `/api/push`: registra preferências de push.
- `/api/analytics/event`: registra evento.
- `/api/analytics/page-view`: registra visualização de página.
- `/api/metrics`: consulta métricas operacionais.
- `/api/health`: verifica saúde da aplicação.
- `/api/whatsapp/webhook`: recebe eventos do WhatsApp.

### Administração e jobs

- `/api/admin/user`: busca e administra usuários.
- `/api/admin/grant-analysis-credit`: concede crédito de análise.
- `/api/admin/grant-diagnostic`: concede diagnóstico.
- `/api/admin/grant-subscription`: concede assinatura.
- `/api/admin/coupons` e `/api/admin/coupons/[id]`: gerenciam cupons.
- `/api/admin/groq-model`: configura modelo de IA.
- `/api/admin/blog/generate`: gera conteúdo de blog.
- `/api/admin/external-sources/sync`: sincroniza fontes externas.
- `/api/admin/opportunity-sources` e `/[id]`: gerenciam fontes de oportunidades.
- `/api/admin/opportunity-reports` e `/[id]`: gerenciam denúncias.
- `/api/admin/backfill-job-tags`: corrige tags de vagas.
- `/api/admin/universities/catalog`: administra catálogo universitário.
- `/api/admin/universities/scrape-queue`: administra fila de coleta.
- `/api/admin/analytics/commercial`: consulta analytics comerciais.
- `/api/admin/reset-analytics`: redefine analytics.
- `/api/admin/whatsapp/instances`: gerencia instâncias WhatsApp.
- `/api/admin/whatsapp/instances/[id]/connect`: conecta instância.
- `/api/admin/whatsapp/instances/[id]/logout`: encerra instância.
- `/api/admin/whatsapp/marketing-campaign`: dispara campanha administrativa.
- `/api/cron/sync-all`: sincronização geral agendada.
- `/api/cron/job-alerts`: processamento de alertas de vagas.
- `/api/cron/radar-alerts`: processamento de alertas do radar.
- `/api/cron/interview-reminders`: envio de lembretes de entrevista.

## 27. Domínios internos e regras de negócio

Os principais módulos internos que sustentam as funções são:

- **Acesso e identidade:** autenticação, contas, sessões, permissões e
  exigência de assinatura.
- **Análise e IA:** schemas de resposta, provedores, uso de IA, recomendações,
  teaser, ATS, palavras-chave e segurança de saída estruturada.
- **Carreira:** segmentos, áreas, vocação, crescimento, evolução, guias e
  sugestões de perfil.
- **Vagas:** feed, filtros, tags, fontes externas, scraping, segurança de
  oportunidades, radar, categorias e sincronização.
- **Candidaturas:** criação, status, histórico, auto-track, plano de ação,
  entrevistas e lembretes.
- **Comercial:** planos, produtos, preços, cupons, créditos, entitlements,
  uso por produto, Mercado Pago e Stripe.
- **Educação:** ensino médio, ferramentas, cursos, universidades, vestibulares,
  concursos, OAB, exercícios e sincronizadores acadêmicos.
- **Gamificação:** jogos, progressão, engajamento, desafios, motivação e scores.
- **Marketplace:** freelancers, propostas, contratos, mensagens, avaliações e
  precificação.
- **Comunicação:** e-mail, suporte, leads, NPS, push, WhatsApp e alertas.
- **Operação:** admin, analytics, métricas, rate limit, webhooks, SEO e
  observabilidade.

## 28. Estados e regras importantes

- Uma análise anônima pode ser limitada por IP e pode exigir cadastro ou compra
  para liberar o diagnóstico completo.
- A primeira análise pode ser liberada conforme a regra comercial configurada.
- O diagnóstico completo pode ser liberado por assinatura, compra avulsa,
  crédito de indicação ou autorização administrativa.
- Uma indicação só conta quando o usuário acessa o fluxo pelo link de indicação;
  autoindicação e indicação repetida são ignoradas.
- Uma candidatura possui um status atual e um histórico de atividades.
- Uma solicitação de contato empresarial começa pendente e só libera dados de
  contato depois do aceite do candidato.
- Uma proposta freelancer pode ser aceita e então originar um contrato.
- Avaliações de contratos atualizam a reputação pública.
- Pagamentos iniciam pendentes e são atualizados por confirmação do provedor;
  webhooks devem ser validados e processados de forma idempotente.
- Créditos possuem finalidade própria: diagnóstico, triagem empresarial ou
  destaque de curso.
- Recursos pagos dependem de plano, segmento, consumo e configuração comercial.

## 29. Inventário de componentes de interface

Além das páginas e APIs, o sistema possui componentes reutilizáveis para:

- shell do candidato, empresa, parceiro e páginas públicas;
- navegação lateral, topbar, menus, tema e tour guiado;
- análise, scores, recomendações, ATS, refinamento e compartilhamento;
- currículo, otimização, exportação e versões;
- feed, Match de vagas, ações, candidaturas e Kanban;
- plano de ação, evolução, checklist, motivação e progresso semanal;
- entrevistas, simulador, feedback e roteiro de candidato;
- empresas, triagem, candidatos, talentos, equipe e contatos;
- parceiros, cursos, leads, destaques e checkout;
- freelancers, projetos, propostas, contratos, mensagens e avaliações;
- ensino médio, exercícios, redações, simulados, tutor e gamificação;
- jogos, pontuação, progresso, quiz e compartilhamento;
- login, cadastro, senha, cobrança, cupons, upsell e gates de acesso;
- suporte, anexos, NPS, push, WhatsApp e analytics;
- administração, usuários, cupons, fontes, denúncias, IA e campanhas;
- acessibilidade, formulários, paginação, cards, badges, botões e feedback.

## 30. Convenções para manutenção

Ao criar ou alterar uma função, atualizar neste documento:

1. a seção funcional correspondente;
2. a rota de interface, se houver;
3. o endpoint da API, se houver;
4. o domínio interno envolvido;
5. a regra de acesso, plano ou crédito;
6. integrações externas e jobs afetados;
7. limitações ou dependências de configuração.

O código executável continua sendo a fonte de verdade. Este documento descreve
o que foi encontrado no código em 05/08/2026 e não deve transformar itens de
roadmap ou marketing em funcionalidades existentes.
