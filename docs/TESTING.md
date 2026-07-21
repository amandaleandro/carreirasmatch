# Testes e validação

## O que existe de verdade

Testes automatizados hoje são **exclusivamente unitários, com Vitest**
(`vitest.config.ts`, `test: { environment: "node", include: ["src/**/*.test.ts"]
}`). São **23 arquivos** `*.test.ts`, todos em `src/lib/`:

```text
admin.test.ts               entitlements.test.ts        rate-limit.test.ts
ai-providers.test.ts        external-source-sync.test.ts support.test.ts
ai-shape.test.ts            free-analysis-limit.test.ts tool-access.test.ts
analysis-teaser.test.ts     full-access-users.test.ts   url-safety.test.ts
career-segments.test.ts     github-profile.test.ts      webhook-secret.test.ts
contact-validation.test.ts  radar-sync.test.ts          youtube-sync.test.ts
coupon-input.test.ts        rate-limit.test.ts
coupon-report.test.ts
coupons.test.ts
course-match.test.ts
email.test.ts
```

Rodar:

```bash
npm test         # vitest run — roda uma vez
npm run test:watch
```

**Não existe** nenhuma outra camada de teste automatizado no repo hoje:

- **Sem testes de integração** contra API routes (nenhum teste chama
  `/api/**` diretamente com request/response simulados).
- **Sem end-to-end.** `playwright` e `playwright-extra` estão nas
  dependências, mas são usados como **motor de scraping** do coletor de
  vagas do Indeed (`src/lib/job-sources/indeed.ts`), não como framework de
  teste — não há `playwright.config.ts` nem pasta de specs e2e no projeto.
- **Sem Jest** (o projeto usa só Vitest; não há config nem dependência de
  Jest).
- **Sem teste de contrato/schema** do banco além do que o próprio `prisma
  migrate` valida.

Se você chegou aqui procurando suíte de testes de UI, de fluxo completo de
pagamento, ou de rota de API — ela não existe ainda. O que cobre esses
fluxos hoje é validação manual (matriz abaixo) e, para pagamento em
produção, o roteiro dedicado em
[PAYMENT_PRODUCTION_VALIDATION.md](PAYMENT_PRODUCTION_VALIDATION.md).

## O que os testes unitários cobrem

Lendo os nomes dos arquivos, a cobertura concentra-se em lógica de negócio
sensível dentro de `src/lib/`:

- normalização e roteamento de providers de IA (`ai-providers`, `ai-shape`);
- entitlements e limite de análise gratuita (`entitlements`,
  `free-analysis-limit`, `full-access-users`);
- cupons, comissão e relatório de influenciador (`coupons`, `coupon-input`,
  `coupon-report`);
- rate limit (`rate-limit`);
- e-mail e suporte (`email`, `support`, `contact-validation`);
- acesso a ferramentas (`tool-access`);
- sincronização de fontes externas — cursos, boletins, **radares de
  concurso/vestibular** (`external-source-sync`, `radar-sync`), GitHub
  (`github-profile`), YouTube (`youtube-sync`), correspondência de curso
  (`course-match`);
- segurança de URL (`url-safety`);
- assinatura do webhook do Mercado Pago (`webhook-secret`);
- segmentação de carreira (`career-segments`) e teaser de análise
  (`analysis-teaser`);
- helper de admin (`admin`).

Não há teste para as rotas de API que usam essas libs (ex.: o webhook de
billing em si, `/api/analyze`, `/api/freelance/**`), nem para os componentes
React.

## Comandos de validação antes de qualquer mudança

```bash
npm run lint
npm test
npm run build
```

- ESLint cobre regras estáticas.
- Vitest roda os 23 arquivos unitários acima.
- `npm run build` valida TypeScript, imports, geração de rota e convenções
  do Next.js — é hoje a principal rede de segurança contra erro de rota/tipo,
  já que não há teste de integração cobrindo isso.

## Matriz manual crítica

Sem testes automatizados de API/E2E, estes fluxos precisam de verificação
manual a cada mudança relevante:

| Fluxo | Casos mínimos |
| --- | --- |
| Cadastro/login (candidato, empresa, parceiro) | sucesso, senha errada, duplicidade, rate limit (10/15min) |
| Recuperação de senha | token válido, expirado, reutilizado, e-mail inexistente |
| Análise de currículo | PDF/texto, anônimo, usuário logado, falha de IA, limite gratuito |
| Pagamento | cartão, Pix/webhook, reenvio do webhook (idempotência), assinatura inválida |
| Entitlement | gratuito, crédito, avulso, assinatura, expiração, influenciador |
| Candidatura | criar, mover estado no kanban, editar, excluir |
| Empresa | cadastro, membro adicional, crédito de triagem, isolamento entre empresas (`companyId`) |
| Parceiro | cadastro, crédito de destaque de curso, isolamento entre parceiros |
| Freelancer marketplace | publicar projeto, propor, aceitar (cria contrato + rejeita demais propostas), avaliar |
| Talentos | opt-in, pedido de contato, aceite, recusa, privacidade antes do aceite |
| Admin | usuário comum bloqueado (403/redirect), administrador autorizado |
| Agendadores | execução repetida no mesmo dia/horário não duplica (`SourceSync`, `EmailLog`) |
| PWA / push | manifest instala, service worker registra, notificação chega quando `VAPID_*` configurado |

## Ao alterar o banco

1. Criar migration (`prisma migrate dev` local, contra Postgres real — não
   há SQLite local mais, então precisa de um Postgres rodando para
   desenvolver).
2. Aplicar em banco descartável antes de produção.
3. Testar dados existentes e novos.
4. Validar rollback operacional ou plano de restauração via backup.
5. Conferir índices e constraints.
6. Confirmar que a migration foi gerada como **arquivo** (`prisma migrate
   dev`), não aplicada com `prisma db push` — o entrypoint de produção só
   roda `prisma migrate deploy`, que ignora mudanças de schema feitas por
   `db push`. Já houve tabela criada por `db push` que só existe em produção
   por isso; um banco novo do zero ficaria sem ela.

## Ao alterar integrações externas

Use mocks nos testes unitários (padrão já usado nos arquivos de
`external-source-sync`, `radar-sync`, `github-profile`, `youtube-sync`) e um
ambiente controlado para qualquer teste de integração manual. Pagamento em
produção segue sempre
[PAYMENT_PRODUCTION_VALIDATION.md](PAYMENT_PRODUCTION_VALIDATION.md) — nunca
confie em credencial configurada como evidência de que o fluxo ponta a ponta
funciona.

## Critério de conclusão

Uma mudança está pronta quando: `npm run lint`, `npm test` e `npm run build`
passam; a documentação afetada foi atualizada; a matriz manual relevante ao
fluxo tocado foi executada; e não existem erros conhecidos escondidos por
flag, mock ou dado artificial deixado no código.
