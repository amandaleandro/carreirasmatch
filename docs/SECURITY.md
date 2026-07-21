# Segurança

Este documento registra controles que existem de fato no código, checados
contra `src/auth.ts`, `src/auth.config.ts`, `src/proxy.ts`,
`src/lib/rate-limit.ts` e `src/lib/webhook-secret.ts`. Não substitui auditoria
profissional.

## Autenticação

Auth.js (`next-auth` v5 beta) com sessão **JWT** (`session: { strategy: "jwt"
}`, sem sessão em banco). Três providers de credenciais coexistem em
`src/auth.ts`, cada um autenticando uma entidade diferente:

| Provider | Entidade autenticada | `accountType` na sessão |
| --- | --- | --- |
| `Credentials` (padrão) | `User` (candidato) | `"candidate"` (implícito) |
| `company-credentials` | `CompanyMember` (não a `Company` diretamente) | `"company"` |
| `partner-credentials` | `Partner` | `"partner"` |

Google OAuth é opcional, só habilitado se `GOOGLE_CLIENT_ID` e
`GOOGLE_CLIENT_SECRET` estiverem presentes (candidato apenas).

Senhas são hasheadas com `bcryptjs` (`bcrypt.compare` no login). Não há MFA.

O login (todos os três providers) passa por rate limit por IP + e-mail antes
de consultar o banco — ver seção "Rate limiting" abaixo.

`src/auth.config.ts` carrega os callbacks `jwt`/`session`/`authorized`
compartilhados entre `src/auth.ts` (app) e `src/proxy.ts` (proxy/middleware),
porque o proxy instancia o NextAuth separadamente e precisa do mesmo
`accountType`, `companyId`, `companyRole`, `partnerId` no token — sem isso o
middleware não sabia diferenciar sessão de empresa e redirecionava tudo para
`/empresa/login`.

## Segredos: `.env` local vs produção

- `.env` está no `.gitignore` **e** no `.dockerignore` — nunca é versionado
  nem entra na imagem Docker.
- Produção usa um `.env` **próprio e separado**, mantido só em
  `/opt/carreiras-match/.env` na VPS. Editar o `.env` local não afeta
  produção; a variável precisa ser copiada manualmente para lá (ver
  [OPERATIONS.md](OPERATIONS.md)).
- Variáveis `NEXT_PUBLIC_*` são embutidas no bundle do cliente em **build
  time** (passadas como build args no `docker-compose.yml`) — são
  intencionalmente públicas (chave pública do Mercado Pago, DSN público do
  Sentry, domínio do Plausible). Nunca coloque segredo real nesse prefixo.
- Não há validação de schema de env vars no boot (nenhum zod/similar rodando
  cedo) — variável ausente ou com placeholder falha silenciosamente ou só no
  primeiro uso (ex.: `src/lib/mercadopago.ts` só lança erro quando alguém
  tenta pagar). Revisar a lista manualmente antes de cada deploy (ver
  [ENV.md](ENV.md)).
- Nunca versionar `.env`, nem colar valor de chave em documentação, log,
  print ou ticket. Credencial exposta deve ser **revogada**, não só removida
  do arquivo.
- Produção, homologação e desenvolvimento devem usar credenciais diferentes
  (ex.: `MERCADOPAGO_ACCESS_TOKEN` de teste `TEST-...` vs produção
  `APP_USR-...`).

## Rate limiting

`src/lib/rate-limit.ts` implementa um limitador **em memória** (`Map` local
ao processo, sem Redis), por chave arbitrária (`login:{ip}:{email}`,
`company-login:...`, `partner-login:...`), com janela deslizante simples.

Aplicado hoje ao login dos três providers de credenciais (10 tentativas / 15
minutos, por IP + e-mail). Não é compartilhado entre réplicas — com mais de
um container `app`, o limite efetivo multiplica pelo número de réplicas. Hoje
há só uma réplica, então isso não é um problema na prática, mas é um risco
conhecido para quando a operação escalar horizontalmente.

## Webhook do Mercado Pago

`src/lib/webhook-secret.ts` valida o header `x-signature` do Mercado Pago:

- formato `ts=<timestamp>,v1=<hmac_sha256>`;
- HMAC-SHA256 sobre o manifest `id:<dataId>;request-id:<requestId>;ts:<ts>;`
  com o segredo `MERCADOPAGO_WEBHOOK_SECRET`;
- comparação com `timingSafeEqual` (evita timing attack);
- requer `xSignature`, `xRequestId`, `dataId` e `secret` todos presentes —
  qualquer um ausente já reprova.

`src/app/api/billing/webhook/route.ts` chama essa validação antes de
processar o evento e responde `401` se a assinatura for inválida. Depois de
validar a assinatura, o handler **ainda consulta o pagamento/preapproval
diretamente na API do Mercado Pago** (`getPayment`/`getPreapproval`) antes de
liberar qualquer acesso — não confia só no corpo do webhook. As atualizações
de status são idempotentes (comparação de transição de estado antes de
conceder crédito/enviar e-mail), protegendo contra reentrega do mesmo evento.

Se `MERCADOPAGO_WEBHOOK_SECRET` estiver errado ou for o placeholder, **todo**
webhook real é rejeitado e nenhum pagamento confirma automaticamente — mesmo
que o pagamento tenha sido aprovado no Mercado Pago.

## Proteção de rotas administrativas

`src/lib/admin.ts` define administrador como: e-mail em `ADMIN_EMAILS` (lista
separada por vírgula, normalizada para minúsculas) **ou** e-mail marcado como
acesso total em `src/lib/full-access-users.ts` (lista fixa no código, hoje
usada para a conta da própria operação).

- `requireAdminPage()` — usado em páginas server (`/admin/**`); redireciona
  para `/login` sem sessão, para `/dashboard` se logado mas não admin.
- `requireAdminApi()` — usado em API routes administrativas; responde `401`
  sem sessão, `403` se não for admin.

Área `/admin` **não** é protegida pelo proxy global (ver
[AUTHORIZATION.md](AUTHORIZATION.md)) — cada página e cada rota de API abaixo
dela chama o helper explicitamente. Auditar uma rota nova em `/api/admin/**`
sempre inclui checar se `requireAdminApi()` está sendo chamado antes de
qualquer leitura/escrita sensível.

## Entrada e conteúdo

- Validação de payload com Zod e limite de tamanho nas rotas que processam
  entrada externa.
- PDFs e textos enviados por usuário são tratados como conteúdo não
  confiável (extração de texto antes de qualquer uso, sem `eval`/execução).
- Escapar conteúdo ao gerar HTML/e-mail.
- `src/lib/url-safety.ts` (com teste em `url-safety.test.ts`) restringe
  protocolo, host e redirecionamento em fetch/scraping de URLs fornecidas
  por usuário ou fonte externa.
- Respostas de IA não são tratadas como comandos confiáveis: passam por
  schema/validação antes de virar dado persistido.

## Dados pessoais e LGPD

O sistema trata currículo, contato, histórico profissional e dados de
candidatura/contratação de talentos e freelancers. A operação deve:

- coletar apenas o necessário;
- explicar finalidade e retenção (ver `/termos` e `/privacidade`);
- atender pedidos de acesso, correção e exclusão;
- restringir acesso interno a dados sensíveis;
- manter base legal e consentimento quando aplicável;
- não expor contato de talento antes do aceite explícito (fluxo de
  `TalentContactRequest`).

## Riscos conhecidos a acompanhar

- rate limit em memória não é compartilhado entre réplicas do `app`;
- agendadores rodam no processo web (ver [OPERATIONS.md](OPERATIONS.md)) —
  escalar horizontalmente sem coordenação duplicaria envios/sincronizações;
- Loki não está ingerindo logs hoje — investigação de incidente por log
  histórico é limitada ao que sobrou no `docker logs` do container atual;
- campos JSON armazenados como `String` no Prisma têm validação mais fraca
  que colunas tipadas;
- alteração administrativa do modelo de IA afeta comportamento globalmente,
  sem escopo por usuário;
- lista de administradores de acesso total em `full-access-users.ts` é fixa
  no código — mudar exige deploy, não é um dado de configuração em runtime.

## Relato de vulnerabilidade

Não abra issue pública com segredo ou dado pessoal. Registre internamente o
impacto, evidência mínima, rota afetada e forma de reprodução segura; faça
contenção (revogação/rotação de credencial) antes de qualquer divulgação.
