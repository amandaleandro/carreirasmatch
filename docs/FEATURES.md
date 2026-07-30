# Inventário de funcionalidades do sistema

> Documento funcional do CarreirasMatch. Revisado em 29/07/2026 com base nas páginas em `src/app`, componentes, módulos de domínio em `src/lib`, rotas de API e modelo Prisma. O código executável é a fonte de verdade quando este documento divergir de outros materiais.

## 1. Visão geral

O sistema é uma plataforma de carreira que compara currículo e vaga, explica as lacunas encontradas e orienta o próximo passo do usuário. A jornada principal é:

**currículo + vaga → match → diagnóstico → preparação → candidatura → acompanhamento**

Além desse núcleo, o sistema possui produtos complementares para desenvolvimento profissional, ensino médio, empresas, parceiros educacionais e freelancers.

## 2. Funcionalidades do candidato

### 2.1 Cadastro, acesso e onboarding

- Cadastro e login de candidatos.
- Login social via Google quando configurado.
- Recuperação e redefinição de senha.
- Onboarding com segmento de carreira e área profissional.
- Tour guiado do produto, adaptado ao segmento do usuário.
- Modal de novidades e funcionalidades disponíveis.
- Alternância de tema claro/escuro.
- Controle de preferências, privacidade e exclusão da conta.
- Exportação dos dados pessoais.

Rotas principais: `/login`, `/register`, `/esqueci-senha`, `/redefinir-senha`, `/dashboard`, `/settings`.

### 2.2 Análise de currículo x vaga por IA

- Análise iniciada com currículo em PDF e descrição ou URL da vaga.
- Análise anônima inicial, sujeita a limite por IP.
- Extração de texto do currículo.
- Score geral de aderência (Match %).
- Scores de aspectos técnicos, experiência, senioridade e ATS.
- Identificação de pontos fortes e pontos fracos.
- Requisitos encontrados, ausentes e parcialmente atendidos.
- Palavras-chave relevantes e palavras-chave faltantes.
- Recomendações de correção do currículo.
- Checklist de compatibilidade com ATS.
- Recomendação sobre candidatar-se, ajustar antes ou desenvolver competências.
- Perguntas prováveis de entrevista.
- Mensagem sugerida para recrutador.
- Plano de estudo e próximos passos.
- Sugestão de cargos alternativos e cargos-ponte.
- Identificação de habilidades transferíveis em transição de carreira.
- Narrativa profissional para mudança de área.
- Histórico de análises, reanálise e refinamento do resultado.
- Exclusão de análises.
- Geração e compartilhamento de card de Match.

Rotas principais: `/analise`, `/analise/[area]`, `/report/[id]`, `/history`, `/desafio`.

### 2.3 Currículo e apresentação profissional

- Cadastro, edição e gerenciamento de currículos.
- Upload de currículo em PDF.
- Criação de currículo do zero.
- Otimização de currículo existente.
- Currículo para quem ainda não tem experiência.
- Transformação de projetos em experiências profissionais.
- Sugestões de melhoria de perfil.
- Geração de carta de apresentação.
- Extração de soft skills.
- Matriz de competências.
- Exportação de currículo em PDF e DOCX.
- Visualização e compartilhamento de currículo.
- Verificador de qualidade e nota do currículo.
- Verificador de leitura por ATS.
- Selo/resultado de currículo verificável.

Rotas principais: `/resume`, `/curriculo-gratis`, `/curriculo-sem-experiencia`, `/nota-do-curriculo`, `/verificador-ats`, `/teste-curriculo-ats`.

### 2.4 Busca de vagas e oportunidades

- Feed personalizado de vagas, ordenado por aderência.
- Lista geral de vagas sem curadoria de Match.
- Vagas de hoje.
- Busca e consulta de vagas internas.
- Importação de vaga por URL.
- Oportunidades públicas oficiais por cargo, estado e cidade.
- Radar de concursos e outras oportunidades públicas.
- Salvamento de vagas e oportunidades.
- Registro de cliques e denúncias de oportunidade.
- Filtros e paginação.
- Atualização das fontes de vagas por sincronização e tarefas agendadas.
- Alertas de novas vagas e oportunidades.
- Notificações push quando habilitadas.

Rotas principais: `/feed`, `/todas-as-vagas`, `/vagas`, `/vagas-de-hoje`, `/vagas-publicas`, `/radar`, `/concursos`, `/vestibulares`.

### 2.5 Candidaturas e acompanhamento

- Salvamento rápido de uma vaga como candidatura.
- Kanban de candidaturas.
- Estados do funil de candidatura.
- Registro do histórico de transições de status.
- Datas, prazos, entrevistas e próximos passos.
- Acompanhamento de candidaturas a vagas de empresas cadastradas na plataforma.
- Plano de ação associado à análise ou candidatura.
- Evolução histórica dos scores.
- Metas e indicadores de progresso.

Rotas principais: `/applications`, `/action-plan`, `/insights`.

### 2.6 Entrevistas

- Preparação de entrevista por candidatura.
- Roteiro personalizado de perguntas.
- Simulador de entrevista com IA.
- Feedback sobre respostas.
- Rascunho de respostas para perguntas comuns.
- Regeneração do roteiro.
- Agendamento e acompanhamento de entrevista.
- Lembretes automáticos de entrevistas próximas.

Rotas principais: `/interviews`, `/interviews/[applicationId]`, `/tools/interview-simulator`.

### 2.7 Perfil e networking

- Perfil profissional editável.
- Áreas e cargos de interesse.
- Experiências, cursos e competências.
- Perfil descobrível por empresas, mediante ativação do usuário.
- Preferências de contato e privacidade.
- Mensagens e conversas dentro da plataforma quando habilitadas.
- Solicitações de contato de empresas com aceite ou recusa do candidato.
- Divulgação de interesse em cursos parceiros.
- Programa de indicação e recompensas.

Rotas principais: `/profile`, `/mensagens`, `/parceiros`, `/desafio`.

## 3. Ferramentas de carreira e estudo

As ferramentas usam regras do produto e, quando aplicável, IA para gerar uma resposta personalizada.

- Teste comportamental.
- Teste vocacional e descoberta de áreas.
- Comparador de vagas.
- Otimizador e revisor de LinkedIn.
- Revisor de GitHub.
- Gerador de currículo do zero.
- Gerador de perfil profissional do zero.
- Gerador de carta de apresentação.
- Gerador de flashcards.
- Calendário de estudos.
- Mapa de competências.
- Feedback no formato STAR.
- Rascunho de resposta para entrevista.
- Avaliação de resposta de entrevista.
- Correção de redação.
- Simulado e mock exam.
- Leitura e interpretação de edital.
- Mapa de prova por área.
- Estimativa e nota de corte.
- Plano de estudos para concurso.
- Segunda fase da OAB.

Rotas principais: `/tools/*`, `/concurso`, `/concursos`, `/oab`, `/faculdade-ou-tecnico`.

## 4. Ensino médio e preparação acadêmica

- Hub de ferramentas do ensino médio.
- Seleção de ano escolar e matéria.
- Questão do dia.
- Exercícios.
- Flashcards.
- Simulados.
- Tutor de estudos por chat.
- Correção e orientação de redação.
- Redação nota 1000.
- Cronograma de estudos.
- Mapa mental.
- Calculadora ENEM.
- Comparador de faculdade e curso técnico.
- Trilhas relacionadas a vestibular e escolha profissional.
- Sistema de progresso e gamificação para estudo.

Rotas principais: `/ensino-medio`, `/ensino-medio/[materia]`, `/ensino-medio/calculadora-enem`, `/ensino-medio/comparador`, `/ensino-medio/cronograma`, `/ensino-medio/exercicios`, `/ensino-medio/flashcards`, `/ensino-medio/foco`, `/ensino-medio/mapa-mental`, `/ensino-medio/questao-do-dia`, `/ensino-medio/redacao`, `/ensino-medio/redacao-nota-1000`, `/ensino-medio/simulado`, `/ensino-medio/tutor`.

## 5. Gamificação

- Catálogo de jogos de carreira.
- Jogos de currículo, digitação, palavras, forca, dilemas, inbox e duelo.
- Jogos personalizados.
- Pontuação e histórico de scores.
- Desafios diários.
- Sequência e progresso de atividades.
- Cards compartilháveis de resultados.
- Recompensas e elementos de motivação.

Rotas principais: `/jogos`, `/jogos/cacapalavras`, `/jogos/curriculo`, `/jogos/digitar`, `/jogos/dilemas`, `/jogos/duelo`, `/jogos/forca`, `/jogos/inbox`.

## 6. Desafio do Match e indicações

- Análise de Match apresentada em formato compartilhável.
- Uso do fluxo com ou sem login.
- Link individual de indicação.
- Registro de indicação na primeira visita pelo link.
- Crédito de diagnóstico completo por múltiplos de três indicações confirmadas.
- Exibição do total indicado, progresso para a próxima recompensa e créditos disponíveis.
- Consumo do crédito ao desbloquear um diagnóstico elegível.

## 7. Piloto automático de candidaturas

- Configuração de Match mínimo.
- Limite diário de candidaturas.
- Configuração do perfil usado no envio.
- Fila de candidaturas.
- Execução do piloto automático.
- Regras de autorização e acompanhamento da execução.
- Aplicação para vagas internas elegíveis.

O piloto não significa candidatura garantida em qualquer site externo. Fontes que exigem login, senha ou CAPTCHA podem ser bloqueadas; automações externas dependem da autorização e das regras da fonte.

Rotas principais: `/api/auto-apply/settings`, `/api/auto-apply/queue`, `/api/auto-apply/run`.

## 8. Área de empresas (B2B)

### Conta e gestão

- Cadastro e login empresarial.
- Perfil da empresa e perfil público.
- Gestão de conta e senha.
- Gestão de equipe e usuários da empresa.
- Assinatura e compra de créditos.
- Área de contatos e relatórios.

### Vagas

- Criar, editar e excluir vagas.
- Gerar descrição de vaga com IA.
- Publicar e gerenciar vagas.
- Duplicar vaga.
- Receber candidaturas.
- Recalcular Match dos candidatos.
- Alterar status de candidatos.

### Triagem de currículos

- Criar processo de triagem.
- Enviar currículos em lote.
- Extrair dados dos currículos.
- Classificar candidatos por aderência.
- Avaliar requisitos eliminatórios.
- Visualizar resultados da triagem.
- Consultar candidato individual.
- Gerar roteiro de entrevista do candidato.

### Banco de talentos

- Buscar candidatos elegíveis e descobríveis.
- Filtrar por interesses e perfil.
- Enviar solicitação de contato.
- Acompanhar solicitações pendentes, aceitas ou recusadas.
- Exibir dados de contato somente após aceite do candidato.

Rotas principais: `/empresa`, `/empresa/vagas`, `/empresa/vagas/nova`, `/empresa/triagem`, `/empresa/talentos`, `/empresa/perfil`, `/empresa/equipe`, `/empresa/contatos`, `/empresa/relatorios`, `/empresa/billing`.

## 9. Portal de parceiros educacionais

- Cadastro e login de parceiro.
- Perfil público do parceiro.
- Cadastro e edição de cursos gratuitos.
- Catálogo público de cursos.
- Destaque pago de cursos.
- Compra e controle de créditos de destaque.
- Registro de cliques nos cursos.
- Captação de leads de interesse.
- Acompanhamento de leads no painel.
- Comunicação de interesse entre candidato e parceiro.

Rotas principais: `/parceiro`, `/parceiro/cadastro`, `/parceiro/login`, `/parceiro/dashboard`, `/parceiros`, `/cursos-gratuitos`.

## 10. Marketplace freelancer

- Perfil público de freelancer.
- Cadastro de projetos.
- Busca e visualização de projetos.
- Envio de propostas.
- Geração assistida de propostas por IA.
- Aceite de proposta.
- Criação de contrato freelancer.
- Conversa e mensagens entre as partes.
- Acompanhamento do contrato e progresso.
- Checkout associado ao contrato quando configurado.
- Avaliação mútua ao finalizar o trabalho.
- Reputação exibida no perfil público.

O pagamento do serviço não é necessariamente um escrow integrado ao marketplace; o fluxo financeiro deve ser tratado conforme o checkout disponível e a configuração do contrato.

Rotas principais: `/freelancer`, `/freelancer/perfil`, `/freelancer/meus-projetos`, `/freelancer/propostas`, `/freelancers`, `/freelancers/[id]`, `/projetos`.

## 11. Conteúdo público e aquisição

- Landing page principal.
- Landing pages por segmento: primeiro emprego, estágio, jovem aprendiz, recolocação, transição, concurso, OAB e estudante.
- Blog e páginas de artigos.
- Conteúdo sobre currículo e carreira.
- Mercado de trabalho.
- Cursos gratuitos e páginas por localização.
- Vagas públicas e vagas de hoje.
- Página sobre o produto, ajuda, contato, termos e privacidade.
- SEO técnico, metadados e dados estruturados.
- Captura de leads.
- Slots de publicidade e integração com AdSense quando habilitada.
- Pixels de marketing com opt-in.

## 12. Assinaturas, pagamentos e acesso

- Diagnóstico avulso.
- Primeira análise e ofertas de desbloqueio.
- Assinaturas recorrentes por segmento.
- Checkout por Mercado Pago.
- Checkout complementar por Stripe.
- Pagamento por cartão e Pix quando disponível no provedor.
- Webhooks de confirmação de pagamento.
- Atualização idempotente de pagamentos.
- Liberação e extensão do período de assinatura.
- Gestão/cancelamento de assinatura.
- Cupons de desconto.
- Créditos de diagnóstico.
- Créditos empresariais de triagem.
- Créditos de destaque para parceiros.
- Controle de permissões por plano, créditos, assinatura, indicação e perfil administrativo.

## 13. Comunicação, notificações e suporte

- Central de suporte com abertura de tickets.
- Mensagens e histórico do ticket.
- Anexos em tickets.
- Tratamento do ticket pela equipe administrativa.
- E-mails transacionais.
- Lembretes de entrevista.
- Alertas de vagas e radar.
- Nudges de onboarding e reengajamento.
- Opt-in para WhatsApp.
- Integração de WhatsApp para notificações e campanhas administrativas quando configurada.
- Notificações push quando autorizadas pelo usuário.
- Pesquisa NPS.

Rotas principais: `/suporte`, `/suporte/[id]`, `/contato`, `/nps`.

## 14. Administração e operação

- Dashboard administrativo.
- Consulta e busca de usuários.
- Gestão de tickets de suporte.
- Gestão de repasses.
- Concessão manual de créditos de análise e diagnóstico.
- Concessão manual de assinatura.
- Gestão de cupons.
- Gestão e sincronização de fontes externas de oportunidades.
- Gestão de denúncias de oportunidades.
- Configuração do modelo Groq.
- Geração de posts de blog por IA.
- Gestão de instâncias de WhatsApp.
- Conexão e logout de instâncias.
- Campanhas de WhatsApp.
- Visualização e reset de analytics.
- Backfill e manutenção de dados de vagas.

Rotas principais: `/admin`, `/admin/usuarios`, `/admin/suporte`, `/admin/repasses`.

## 15. Segurança, dados e operação técnica

- Autenticação centralizada e proteção de rotas.
- Controle de acesso por tipo de conta: candidato, empresa, parceiro e administrador.
- Proteção de endpoints por sessão, permissões e assinatura.
- Rate limit para fluxos anônimos e de IA.
- Validação de URLs e proteção contra destinos inseguros.
- Validação de respostas estruturadas de IA.
- Webhooks com validação de assinatura e processamento idempotente.
- Consentimento para descoberta do perfil e contato empresarial.
- Exportação e exclusão de dados do usuário.
- Logs de e-mail para evitar duplicidade em fluxos aplicáveis.
- Analytics de eventos e page views.
- Métricas operacionais.
- Integração opcional com Sentry, Prometheus, Grafana, Loki e Plausible.
- Jobs agendados para sincronização de vagas, alertas e lembretes.
- Suporte a PostgreSQL em produção e SQLite em ambientes locais/testes.

## 16. Integrações externas identificadas

- Provedores de IA compatíveis com OpenAI, incluindo Groq, Cerebras, Gemini, OpenAI, Together, DeepInfra e OpenRouter quando configurados.
- Mercado Pago.
- Stripe.
- Google OAuth.
- Resend para e-mail.
- WhatsApp/Evolution quando configurado.
- Fontes externas e scrapers de vagas e oportunidades.
- YouTube para sincronização de conteúdo quando configurado.
- Sentry, Prometheus, Grafana, Loki e Plausible para observabilidade e analytics.

## 17. Limites e cuidados de comunicação

- O sistema oferece análise, preparação e organização; não garante contratação, aprovação ou aumento salarial.
- O score de ATS não substitui a análise de aderência à vaga.
- O piloto automático respeita autorização, regras da fonte, login e CAPTCHA.
- A candidatura automática não está disponível indistintamente para qualquer site externo.
- O contato entre empresa e candidato depende da descoberta habilitada e do aceite do candidato.
- A disponibilidade de pagamentos, WhatsApp, notificações, IA e analytics depende das respectivas configurações de ambiente.
- Limites, créditos e recursos pagos podem variar conforme plano e segmento.

## 18. Fontes técnicas deste inventário

- Páginas e rotas: `src/app`.
- Componentes de interface: `src/components`.
- Regras e integrações: `src/lib`.
- Endpoints: `src/app/api`.
- Persistência e entidades: `prisma/schema.prisma`.
- Fluxos descritos: `docs/USER_FLOWS.md`.
- Mapa de acesso: `docs/ROUTES_MAPPING.md`.
- Arquitetura: `docs/COMPLETE_ARCHITECTURE_AND_ECOSYSTEM.md`.
