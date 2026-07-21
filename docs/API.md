# API interna

Endpoints implementados por Route Handlers em `src/app/api/`. Não há
versionamento nem contrato OpenAPI. Corpos são JSON, exceto fluxos que
recebem arquivo/formulário (upload de currículo/anexo) ou retornam PDF/bytes.

## Convenções de acesso

| Rótulo | Regra |
| --- | --- |
| Público | Não exige sessão; pode ter rate limit e validação |
| Candidato | `requireAuth()` (sessão `accountType: candidate`) e validação de propriedade do recurso |
| Assinante | Candidato + entitlement ativo (`entitlements.ts`, `require-subscription-page.ts`) |
| Empresa | `requireCompanyApi()` (`src/lib/company-auth.ts`) |
| Parceiro | `requirePartnerApi()` (`src/lib/partner-auth.ts`) |
| Admin | `requireAdminApi()` (`src/lib/admin.ts`, checa `ADMIN_EMAILS`) |
| Webhook | Assinatura externa validada (`x-signature` do Mercado Pago) |

**`/api/**` não passa pelo `src/proxy.ts`** (o proxy só cobre páginas) —
cada handler é responsável pela própria autenticação. Recursos por ID devem
sempre validar o proprietário (usuário, empresa ou parceiro dono do recurso).

## Identidade e usuário

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/register` | Público | Criar conta de candidato |
| `GET, POST /api/auth/[...nextauth]` | Público | Handlers do NextAuth (login, callback, logout) |
| `POST /api/auth/forgot-password` | Público | Solicitar recuperação de senha |
| `POST /api/auth/reset-password` | Público | Trocar senha com token |
| `PATCH /api/user` | Candidato | Atualizar perfil |
| `PATCH /api/user/internship-checklist` | Candidato | Salvar progresso do checklist de estágio |
| `GET, POST /api/user/class-schedule` | Candidato | Listar/criar aula na grade |
| `PATCH, DELETE /api/user/class-schedule/[id]` | Candidato | Editar/excluir aula própria |
| `POST /api/leads` | Público | Capturar lead (nome/e-mail/telefone) antes de virar conta |

Cadastro, login e recuperação têm rate limit por IP+e-mail
(`src/lib/rate-limit.ts`). Respostas de recuperação não revelam se um e-mail
existe.

## Currículo, análise e carreira

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/analyze` | Público/candidato | Analisar currículo contra vaga (uso anônimo limitado) |
| `GET /api/analysis/[id]` | Candidato/lead | Consultar análise |
| `DELETE /api/analysis/[id]` | Candidato | Excluir análise própria |
| `PATCH /api/resume/[id]` | Candidato | Atualizar currículo próprio |
| `GET, POST /api/resume/[id]/pdf` | Candidato | Baixar/gerar PDF do currículo |
| `PATCH /api/action-plan/[id]` | Assinante | Atualizar progresso do plano de ação |
| `PATCH /api/interviews/[id]` | Assinante | Atualizar preparação de entrevista |
| `POST /api/interviews/[id]/regenerate` | Assinante | Regenerar conteúdo de preparação |
| `GET, POST /api/profile-suggestions` | Candidato/assinante | Consultar/gerar sugestões de curso/certificação |

## Pagamentos

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/billing/payment` | Candidato | Criar pagamento avulso (Payment Brick) |
| `POST /api/billing/subscription` | Candidato | Criar assinatura (Preapproval/Subscription Brick) |
| `POST /api/billing/webhook` | Webhook | Confirmar eventos do Mercado Pago (pagamento, assinatura, crédito de empresa/parceiro) |
| `POST /api/empresa/billing/comprar` | Empresa | Comprar pacote de créditos de triagem |
| `POST /api/partner/billing/comprar` | Parceiro | Comprar créditos de destaque de curso |

O webhook é o ponto autoritativo assíncrono: valida `x-signature` (HMAC,
`src/lib/webhook-secret.ts`, falha fechado com 401 se inválida), consulta o
pagamento/preapproval na API do Mercado Pago e trata reenvio sem duplicar
crédito, comissão ou acesso (checa transição de status antes de agir).

## Vagas, oportunidades e alertas

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/feed/fetch-jobs` | Candidato | Buscar/sincronizar vagas nas fontes externas |
| `POST /api/feed/add-job` | Candidato | Adicionar vaga manualmente por URL/dados |
| `GET, POST /api/job-alerts` | Candidato | Listar/criar alerta de vaga |
| `DELETE /api/job-alerts/[id]` | Candidato | Excluir alerta próprio |
| `GET /api/locations/cities` | Público | Listar cidades (autocomplete) |
| `POST /api/public-opportunities/[id]/save` | Candidato | Salvar oportunidade pública |
| `POST /api/public-opportunities/[id]/click` | Público | Registrar clique |
| `POST /api/public-opportunities/[id]/report` | Público/candidato | Denunciar oportunidade suspeita |
| `POST /api/partner-submissions` | Público | Enviar oportunidade/parceria por formulário |
| `GET /api/cursos-gratuitos/[id]/click` | Público | Registrar clique em curso |
| `POST /api/cursos-gratuitos/[id]/interesse` | Público | Capturar interesse/lead em curso |

## Empresa (vagas, talentos e triagem)

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/empresa/register` | Público | Criar conta de empresa |
| `GET, PATCH /api/empresa/conta` | Empresa | Dados da conta |
| `PATCH /api/empresa/conta/senha` | Empresa | Trocar senha |
| `GET, PATCH /api/empresa/perfil` | Empresa | Perfil (marca empregadora) |
| `GET, PATCH /api/empresa/perfil/publico` | Empresa | Ativar/editar página pública (`/empresas/[slug]`) |
| `GET, POST /api/empresa/equipe` | Empresa (owner) | Listar/convidar membro da equipe |
| `PATCH, DELETE /api/empresa/equipe/[id]` | Empresa (owner) | Editar/remover membro |
| `GET, POST /api/empresa/vagas` | Empresa | Listar/criar `CompanyVaga` |
| `GET, PATCH, DELETE /api/empresa/vagas/[id]` | Empresa | Ler/editar/excluir vaga própria |
| `POST /api/empresa/vagas/[id]/duplicar` | Empresa | Duplicar vaga |
| `POST /api/empresa/vagas/[id]/rematch` | Empresa | Recalcular matching de candidatos |
| `POST /api/empresa/vagas/[id]/candidatar` | Candidato | Candidatar-se a uma `CompanyVaga` publicada |
| `POST /api/empresa/vagas/descricao` | Empresa | Gerar descrição de vaga por IA |
| `PATCH /api/empresa/candidaturas/[id]` | Empresa | Atualizar status/nota de candidatura |
| `POST /api/empresa/talentos/buscar` | Empresa | Buscar talentos elegíveis (banco `discoverable`) |
| `POST /api/empresa/talentos/contato` | Empresa | Solicitar contato com um talento |
| `PATCH /api/contact-requests/[id]` | Candidato | Aceitar/recusar pedido de contato da empresa |
| `PATCH /api/empresa/contatos/[id]` | Empresa | Anotar/agendar entrevista sobre um contato liberado |
| `GET, POST /api/empresa/triagem` | Empresa | Listar/criar triagem (`CompanyJob`) |
| `GET /api/empresa/triagem/[id]` | Empresa | Detalhe da triagem |
| `POST /api/empresa/triagem/[id]/curriculos` | Empresa | Enviar currículos (PDF) para pontuar |
| `PATCH /api/empresa/triagem/candidato` | Empresa | Atualizar status/nota de um candidato triado |

## Parceiro (cursos)

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/partner/register` | Público | Criar conta de parceiro |
| `GET, POST /api/partner/courses` | Parceiro | Listar/cadastrar curso |
| `POST /api/partner/courses/[id]/highlight` | Parceiro | Destacar curso (consome crédito) |

## Marketplace freelancer

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `GET, PUT /api/freelance/profile` | Candidato | Consultar/editar o próprio `FreelancerProfile` |
| `GET, POST /api/freelance/projects` | Público/Candidato | Listar projetos abertos / publicar projeto (contratante) |
| `GET, POST /api/freelance/projects/[id]/proposals` | Candidato | Listar/enviar proposta a um projeto |
| `PATCH /api/freelance/proposals/[id]` | Candidato | Aceitar/rejeitar/retirar proposta |
| `GET, PATCH /api/freelance/contracts/[id]` | Candidato (parte do contrato) | Ver/atualizar status do contrato (entregue, concluído, cancelado) |
| `POST /api/freelance/contracts/[id]/review` | Candidato (parte do contrato) | Avaliar a outra parte após conclusão |
| `GET, POST /api/freelance/threads/[id]/messages` | Candidato (parte da thread) | Ler/enviar mensagem no chat do projeto |

## Ferramentas com IA ou persistência

| Método e rota | Função |
| --- | --- |
| `POST /api/tools/behavioral-test` | Teste comportamental |
| `POST /api/tools/compare-jobs` | Comparar vagas |
| `POST /api/tools/cover-letter` | Gerar carta de apresentação |
| `POST /api/tools/essay-grader` | Corrigir redação |
| `POST /api/tools/github-review` | Revisar perfil GitHub |
| `POST /api/tools/linkedin-review` | Revisar perfil LinkedIn |
| `POST /api/tools/interview-simulator` | Simular entrevista |
| `POST /api/tools/interview-feedback` | Avaliar resposta de entrevista |
| `POST /api/tools/mock-exam` | Gerar simulado genérico |
| `POST /api/tools/profile-from-scratch` | Criar perfil profissional do zero |
| `POST /api/tools/project-to-experience` | Converter projeto pessoal em experiência de currículo |
| `POST /api/tools/resume-from-scratch` | Criar currículo do zero |
| `POST /api/tools/concurso/simulado` | Simulado de concurso |
| `POST /api/tools/concurso/nota-de-corte` | Estimar nota de corte |
| `POST /api/tools/concurso/plano-de-estudo` | Criar plano de estudo de concurso |
| `POST /api/tools/oab/segunda-fase` | Preparação para segunda fase da OAB |
| `POST /api/tools/vocation-test/discover` | Descobrir área vocacional |
| `POST /api/tools/vocation-test/[area]` | Resultado do teste por área |
| `POST /api/tools/cutoff-estimate/[area]` | Estimativa de nota de corte por área |
| `POST /api/tools/exam-map/[area]` | Mapa de provas por área |
| `POST, GET /api/tools/study-calendar/[area]` | Criar/consultar calendário de estudo |
| `PATCH, DELETE /api/tools/study-calendar/item/[id]` | Atualizar/remover item do calendário |

Cada handler aplica sua própria combinação de autenticação, limite gratuito
(`free-tool-access.ts`, `free-analysis-limit.ts`) e rate limit.

## Jogos, notificações e mensageria

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/jogos/scores` | Candidato | Registrar pontuação de minijogo |
| `GET, POST, DELETE /api/push` | Candidato | Gerenciar inscrição de Web Push (VAPID) |
| `GET /api/support/attachments/[id]` | Candidato/admin dono do ticket | Baixar anexo de mensagem de suporte |

## Administração

| Método e rota | Função |
| --- | --- |
| `GET /api/admin/user` | Consultar usuário |
| `POST /api/admin/grant-diagnostic` | Liberar diagnóstico completo manualmente |
| `POST /api/admin/grant-subscription` | Conceder assinatura manualmente |
| `POST /api/admin/grant-analysis-credit` | Conceder crédito de análise |
| `GET, POST /api/admin/coupons` | Listar/criar cupom de influenciador |
| `PATCH /api/admin/coupons/[id]` | Alterar cupom |
| `GET, POST /api/admin/groq-model` | Consultar/alterar modelo de IA em uso (`AppSetting`) |
| `POST /api/admin/blog/generate` | Gerar post de blog sob demanda |
| `POST /api/admin/external-sources/sync` | Forçar sincronização de fontes externas |
| `GET, POST /api/admin/opportunity-sources` | Listar/criar fonte de oportunidade pública |
| `PATCH, DELETE /api/admin/opportunity-sources/[id]` | Alterar/excluir fonte |
| `GET /api/admin/opportunity-reports` | Listar denúncias de oportunidade |
| `PATCH /api/admin/opportunity-reports/[id]` | Tratar denúncia |
| `GET /api/admin/backfill-job-tags` | Reprocessar tags de vagas antigas |

`GET /api/admin/backfill-job-tags` produz alteração de dados apesar do verbo
GET — tratar como ação administrativa; candidato a virar POST.

## Telemetria

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/analytics/event` | Público | Registrar evento de funil (`FunnelEvent`) |
| `POST /api/analytics/page-view` | Público | Registrar visualização de página (`PageView`) |
| `GET /api/metrics` | Token opcional (`METRICS_TOKEN`) | Expor métricas Prometheus (`prom-client`) |

## Formato recomendado de erros

Handlers novos devem responder JSON consistente:

```json
{
  "error": "Mensagem segura para o cliente",
  "code": "MACHINE_READABLE_CODE"
}
```

Use `400` para entrada inválida, `401` sem sessão, `403` sem permissão, `404`
para recurso inexistente/não pertencente, `409` para conflito, `429` para
limite excedido e `500` para falha não prevista. Nunca retorne stack trace ou
segredo no corpo.
