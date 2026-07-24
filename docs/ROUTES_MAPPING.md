# Mapeamento Completo de Rotas e Segurança

Este documento detalha o mapa de rotas da aplicação, as permissões necessárias e o comportamento de controle de acesso (gerenciado via `src/proxy.ts`, `src/auth.config.ts` e handlers de API).

---

## 1. Rotas Públicas & Lead Generation (Acesso Livre)

| Rota | Descrição | Nível de Acesso |
|---|---|---|
| `/` | Landing Page Principal | Público |
| `/login` | Tela de Login do Candidato | Público |
| `/register` | Cadastro de Candidato | Público |
| `/esqueci-senha` | Solicitação de Recuperação de Senha | Público |
| `/redefinir-senha` | Redefinição de Senha via Token | Público |
| `/como-fazer-curriculo` | Guia SEO de Formatação de Currículo | Público |
| `/curriculo-gratis` | Ferramenta Gratuita de Gerador de Currículo | Público |
| `/curriculo-sem-experiencia` | Guia SEO para Primeiro Emprego/Estágio | Público |
| `/teste-curriculo-ats` | Scanner Rápido de ATS | Público / Gate |
| `/nota-do-curriculo` | Calculadora de Pontuação de Currículo | Público |
| `/vagas-publicas` | Vitrine Aberta de Oportunidades | Público |
| `/blog` & `/blog/[slug]` | Artigos de Carreira e Mercado | Público |
| `/termos` & `/privacidade` | Documentação Legal e LGPD | Público |
| `/tools/*` | Catálogo de Ferramentas Gratuitas | Público / Degradação Graciosa |

---

## 2. Portal do Candidato (Requer Sessão Candidate)

| Rota | Descrição |
|---|---|
| `/dashboard` | Painel Principal com Recomendações e Resumo |
| `/analise` | Otimizador de Currículo com IA (Groq/Llama) |
| `/resume` | Construtor Interativo de Currículo |
| `/interviews` | Simulador de Entrevistas Técnicas e Comportamentais |
| `/action-plan` | Plano de Ação Personalizado para Carreira |
| `/applications` | Quadro Kanban de Rastreamento de Candidaturas |
| `/vagas` | Central de Match de Vagas |
| `/assinar` | Checkout de Planos e Assinatura Mercado Pago |
| `/profile` | Edição de Perfil e Preferências |
| `/settings` | Configurações de Conta e Segurança |

---

## 3. Portal da Empresa (Requer Sessão Company)

| Rota | Descrição |
|---|---|
| `/empresa/login` | Login Exclusivo para Recrutadores |
| `/empresa/cadastro` | Cadastro de Empresa |
| `/empresa/dashboard` | Painel de Controle de Vagas e Processos |
| `/empresa/vagas/nova` | Formulário de Publicação de Vaga |
| `/empresa/vagas/[id]` | Gestão do Funil de Candidatos (Kanban ATS) |
| `/empresa/banco-de-talentos` | Busca no Banco de Talentos Otimizada |
| `/empresa/creditos` | Compra de Créditos e Planos Corporativos |

---

## 4. Portal do Parceiro (Requer Sessão Partner)

| Rota | Descrição |
|---|---|
| `/parceiro/login` | Login de Parceiro Edu/Conteúdo |
| `/parceiro/dashboard` | Métricas de Cursos e Indicações |
| `/parceiro/cursos/novo` | Cadastro de Cursos Recomendados |

---

## 5. Painel Administrativo (Requer Permissão Admin)

| Rota | Descrição | Proteção |
|---|---|---|
| `/admin` | Visão Geral do Sistema e Métricas | Admin Only (`ADMIN_EMAILS`) |
| `/admin/usuarios` | Consulta e Suporte de Usuários | Admin Only |
| `/admin/cupons` | Gerenciador de Cupons de Desconto | Admin Only |
| `/admin/scrapers` | Disparo e Monitoramento de Fontes de Vagas | Admin Only |
| `/admin/whatsapp` | Campanhas de WhatsApp Marketing | Admin Only |
| `/admin/modelos-ia` | Configuração de Provedores LLM | Admin Only |

---

## 6. Endpoints de API (`/api/*`)

- **Autenticação**: `/api/auth/*`
- **Análise & IA**: `/api/analyze/route.ts`, `/api/interview/route.ts`
- **Billing & Webhooks**: `/api/billing/checkout`, `/api/billing/webhook` (Validação `HMAC-SHA256`)
- **Vagas**: `/api/vagas/*`, `/api/feed/*`
