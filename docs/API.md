# API interna

Endpoints implementados por Route Handlers em `src/app/api`. A API não possui
versionamento nem contrato OpenAPI. Os corpos são JSON, exceto fluxos que
recebem arquivo/formulário ou retornam PDF.

## Convenções de acesso

| Rótulo | Regra |
| --- | --- |
| Público | Não exige sessão; pode ter rate limit e validação |
| Usuário | `requireAuth()` ou `auth()` e validação de propriedade |
| Assinante | Usuário mais entitlement ativo |
| Empresa | `requireCompanyApi()` |
| Admin | `requireAdminApi()` |
| Webhook | Assinatura externa validada |

`/api/*` não passa pelo proxy de páginas. Portanto, a proteção deve existir no
próprio handler. Recursos por ID devem sempre validar o proprietário.

## Identidade e usuário

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/register` | Público | Criar conta de candidato |
| `GET/POST /api/auth/[...nextauth]` | Público | Handlers do NextAuth |
| `POST /api/auth/forgot-password` | Público | Solicitar recuperação |
| `POST /api/auth/reset-password` | Público | Trocar senha com token |
| `PATCH /api/user` | Usuário | Atualizar perfil |
| `PATCH /api/user/internship-checklist` | Usuário | Salvar checklist |
| `GET, POST /api/user/class-schedule` | Usuário | Listar/criar aulas |
| `DELETE /api/user/class-schedule/[id]` | Usuário | Excluir aula própria |
| `POST /api/leads` | Público | Capturar lead |

Cadastro e recuperação possuem rate limit. Respostas de recuperação não devem
revelar se um e-mail existe.

## Currículo, análise e carreira

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/analyze` | Público/usuário | Analisar currículo contra vaga |
| `DELETE /api/analysis/[id]` | Usuário | Excluir análise própria |
| `PATCH /api/resume/[id]` | Usuário | Atualizar currículo próprio |
| `GET, POST /api/resume/[id]/pdf` | Usuário | Baixar/gerar PDF |
| `PATCH /api/action-plan/[id]` | Assinante | Atualizar progresso |
| `PATCH /api/interviews/[id]` | Assinante | Atualizar preparação |
| `POST /api/interviews/[id]/regenerate` | Assinante | Regenerar conteúdo |
| `GET, POST /api/profile-suggestions` | Usuário/assinante | Consultar/gerar sugestões |
| `POST /api/tools/interview-feedback` | Usuário | Avaliar resposta |

O handler de análise aceita uso anônimo limitado. A exibição completa é
controlada por entitlement e pela associação entre usuário, pagamento e
análise.

## Pagamentos

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/billing/payment` | Usuário | Criar pagamento avulso |
| `POST /api/billing/subscription` | Usuário | Criar assinatura |
| `POST /api/billing/webhook` | Webhook | Confirmar eventos do Mercado Pago |
| `POST /api/empresa/billing/comprar` | Empresa | Comprar créditos de triagem |

O webhook é o ponto autoritativo assíncrono. Ele deve validar `x-signature`,
confirmar dados na API do provedor e tratar repetição sem duplicar crédito,
comissão ou acesso.

## Vagas, oportunidades e alertas

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/feed/fetch-jobs` | Usuário | Buscar/sincronizar vagas |
| `POST /api/feed/add-job` | Usuário | Adicionar vaga por URL/dados |
| `GET, POST /api/job-alerts` | Usuário | Listar/criar alerta |
| `DELETE /api/job-alerts/[id]` | Usuário | Excluir alerta próprio |
| `GET /api/locations/cities` | Usuário | Listar cidades |
| `POST /api/public-opportunities/[id]/save` | Usuário | Salvar oportunidade |
| `POST /api/public-opportunities/[id]/click` | Público | Registrar clique |
| `POST /api/public-opportunities/[id]/report` | Público/usuário | Denunciar oportunidade |
| `POST /api/partner-submissions` | Público | Enviar oportunidade/parceria |

## Empresa e talentos

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/empresa/register` | Público | Criar conta de empresa |
| `POST /api/empresa/triagem` | Empresa | Criar e executar triagem |
| `POST /api/empresa/talentos/buscar` | Empresa | Buscar talentos elegíveis |
| `POST /api/empresa/talentos/contato` | Empresa | Solicitar contato |
| `PATCH /api/contact-requests/[id]` | Usuário | Aceitar/recusar contato |

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
| `POST /api/tools/mock-exam` | Gerar simulado |
| `POST /api/tools/profile-from-scratch` | Criar perfil profissional |
| `POST /api/tools/project-to-experience` | Converter projeto em experiência |
| `POST /api/tools/resume-from-scratch` | Criar currículo |
| `POST /api/tools/concurso/simulado` | Simulado de concurso |
| `POST /api/tools/concurso/nota-de-corte` | Estimar nota de corte |
| `POST /api/tools/concurso/plano-de-estudo` | Criar plano de estudo |
| `POST /api/tools/oab/segunda-fase` | Preparação para segunda fase |
| `POST /api/tools/vocation-test/discover` | Descobrir área |
| `POST /api/tools/vocation-test/[area]` | Resultado por área |
| `POST /api/tools/cutoff-estimate/[area]` | Estimativa por área |
| `POST /api/tools/exam-map/[area]` | Mapa de provas |
| `POST /api/tools/study-calendar/[area]` | Criar calendário |
| `PATCH /api/tools/study-calendar/item/[id]` | Atualizar item |

Cada handler aplica sua própria combinação de autenticação, limite gratuito e
rate limit. Antes de expor uma ferramenta nova, padronize validação Zod, limite
de tamanho do texto, timeout da IA e resposta de erro.

## Administração

| Método e rota | Função |
| --- | --- |
| `GET /api/admin/user` | Consultar usuário |
| `POST /api/admin/grant-diagnostic` | Liberar diagnóstico |
| `POST /api/admin/grant-subscription` | Conceder assinatura |
| `POST /api/admin/grant-analysis-credit` | Conceder crédito |
| `GET, POST /api/admin/coupons` | Listar/criar cupons |
| `PATCH /api/admin/coupons/[id]` | Alterar cupom |
| `GET, POST /api/admin/groq-model` | Consultar/alterar modelo |
| `POST /api/admin/blog/generate` | Gerar post |
| `POST /api/admin/external-sources/sync` | Sincronizar fontes |
| `GET, POST /api/admin/opportunity-sources` | Listar/criar fontes |
| `PATCH, DELETE /api/admin/opportunity-sources/[id]` | Alterar/excluir fonte |
| `GET /api/admin/opportunity-reports` | Listar denúncias |
| `PATCH /api/admin/opportunity-reports/[id]` | Tratar denúncia |
| `GET /api/admin/backfill-job-tags` | Reprocessar tags |

`GET /api/admin/backfill-job-tags` produz alteração de dados apesar do verbo
GET. Deve ser tratado como ação administrativa e é candidato a migração para
POST.

## Telemetria

| Método e rota | Acesso | Função |
| --- | --- | --- |
| `POST /api/analytics/page-view` | Público | Registrar visualização |
| `GET /api/metrics` | Token opcional | Expor métricas Prometheus |

## Formato recomendado de erros

Handlers novos devem responder JSON consistente:

```json
{
  "error": "Mensagem segura para o cliente",
  "code": "MACHINE_READABLE_CODE"
}
```

Use `400` para entrada inválida, `401` sem sessão, `403` sem permissão, `404`
para recurso inexistente/não pertencente, `409` para conflito, `429` para limite
e `500` para falha não prevista. Não retorne stack trace ou segredo.
