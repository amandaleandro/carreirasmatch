# Autenticação e autorização

## Papéis existentes

O sistema não tem uma coluna `role` única — o papel é derivado de **qual
entidade autenticou** e, para admin/influenciador, de uma checagem adicional
sobre a sessão de candidato:

| Papel | Entidade | Como é concedido |
| --- | --- | --- |
| **Visitante** | nenhuma sessão | padrão |
| **Candidato** | `User` | cadastro/login normal (credenciais ou Google) |
| **Influenciador** | `User` + `Coupon.ownerUserId` | é um candidato comum que **também** é dono de um cupom; login idêntico ao de candidato, ganha acesso total ao produto sem pagar e enxerga `/influencer` |
| **Empresa** | `CompanyMember` (não a `Company` diretamente) | provider `company-credentials`; sessão carrega `accountType = "company"`, `companyId` (da empresa, não do membro) e `companyRole` (`"owner"` ou `"member"`) |
| **Parceiro** | `Partner` | provider `partner-credentials`; sessão carrega `accountType = "partner"` e `partnerId` |
| **Administrador** | `User` | e-mail em `ADMIN_EMAILS` (env var) ou em `full-access-users.ts` (lista fixa no código); é uma checagem sobre a sessão de candidato, não um provider separado |

Candidato, influenciador e admin compartilham a mesma sessão de `User` — a
diferença é o que é checado *depois* do login (dono de cupom? e-mail na
lista?), não *como* logam. Empresa e parceiro têm entidades e providers de
credenciais totalmente separados (`CompanyMember`/`Partner`, tabelas
próprias, sem relação com `User`).

## Onde a sessão é decidida: `src/auth.config.ts` + `src/proxy.ts`

`src/proxy.ts` instancia `NextAuth(authConfig)` separadamente da instância
principal em `src/auth.ts`, e usa só o callback `authorized` desse config
como matcher de páginas (Next.js "middleware", chamado `proxy.ts` neste
projeto por causa de convenções da versão instalada do Next — ver
`node_modules/next/dist/docs/`). Os callbacks `jwt`/`session` que colocam
`accountType`/`companyId`/`companyRole`/`partnerId` no token vivem em
`authConfig` (não só em `auth.ts`) exatamente para que o proxy também consiga
lê-los — sem isso ele não enxergava sessão de empresa/parceiro e redirecionava
tudo para `/login` de candidato.

### Regras de `authorized()` (`src/auth.config.ts`)

1. **`PUBLIC_PATHS`** — lista explícita de prefixos liberados sem sessão
   (`/login`, `/register`, `/vagas`, `/blog`, `/freelancers`, `/projetos`,
   `/parceiros`, `/desafio`, etc.) mais qualquer ferramenta marcada `free` no
   catálogo (`isFreeTool()`).
2. **`/empresa` e `/empresa/*`** — `/empresa/login` e `/empresa/cadastro` são
   públicas (com auto-redirect para `/empresa` se já logado como empresa); o
   resto exige `accountType === "company"`, senão redireciona para
   `/empresa/login`. O boundary usa `=== "/empresa"` ou `startsWith("/empresa/")`
   propositalmente, para não capturar `/empresas` (marketing/landing) nem
   perfis públicos de empresa.
3. **`/parceiro` e `/parceiro/*`** — mesma lógica, com `accountType ===
   "partner"`.
4. **Candidato logado** em `/login`/`/register` é redirecionado para
   `/dashboard`.
5. Qualquer outra rota fora de `PUBLIC_PATHS`: exige alguma sessão
   (`isLoggedIn`); se for empresa/parceiro tentando acessar área de
   candidato, redireciona para o próprio painel em vez de deixar passar.

### Allowlist do freelancer marketplace

O marketplace de freelancer (`/freelancers`, `/freelancers/[id]`, `/projetos`,
`/projetos/[id]`) é conteúdo público — qualquer `User` pode contratar e/ou ser
contratado, sem conta separada. Essas rotas precisaram ser adicionadas
manualmente a `PUBLIC_PATHS`; sem isso o proxy redirecionava para `/login`
antes de a página carregar. Note o cuidado de nomenclatura: `startsWith(
"/freelancers")` (plural, vitrine pública) não intercepta `/freelancer`
(singular — hub autenticado com perfil, propostas e projetos do próprio
usuário), que continua exigindo login por não estar na lista.

### O matcher não cobre `/api/**`

`src/proxy.ts` define:

```ts
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

APIs, assets estáticos e arquivos técnicos (robots, sitemap, ads.txt,
manifest do PWA) ficam **fora** do proxy de propósito — passar `ads.txt` ou o
manifest pelo proxy devolveria redirect para `/login` em vez do conteúdo
esperado, quebrando crawler e a checagem de instalabilidade do PWA. Isso
significa que **toda API Route Handler precisa se proteger individualmente**;
não existe uma rede de segurança automática para `/api/**`.

## Helpers de autorização por área

| Helper | Área | Onde |
| --- | --- | --- |
| `requireAuth()` / páginas equivalentes | Candidato (API/página) | `src/lib/require-auth.ts`, `src/lib/require-auth-page.ts` |
| `requireActiveSubscription()` | Candidato com assinatura ativa | `src/lib/require-auth.ts` |
| `requireCompanyPage()` / `requireCompanyApi()` | Empresa | `src/lib/company-auth.ts` |
| `requirePartnerPage()` / `requirePartnerApi()` | Parceiro | `src/lib/partner-auth.ts` |
| `requireAdminPage()` / `requireAdminApi()` | Admin | `src/lib/admin.ts` |
| `requireInfluencerPage()` | Influenciador | `src/lib/influencer.ts` |

Cada um checa a sessão via `auth()` e, quando aplicável, uma condição extra
no banco (dono de cupom, e-mail admin, `companyId`/`partnerId` presente).
Páginas redirecionam (`redirect()`); APIs devolvem `{ session: null,
response: NextResponse.json(..., { status }) }` para o chamador decidir o
que fazer.

## Entitlements: "quem é" vs "o que pode acessar"

Autenticação responde "quem é"; entitlement responde "o que pode acessar
agora". Acesso completo a um diagnóstico/análise pode vir de qualquer um
destes, combinados em `src/lib/entitlements.ts`:

- assinatura ativa e dentro do período (`Subscription.currentPeriodEnd`);
- pagamento avulso associado à análise (`Payment`);
- crédito elegível para análise gratuita/reduzida;
- ser influenciador (dono de cupom);
- estar na lista de acesso total (`full-access-users.ts`);
- concessão administrativa manual.

Regras centrais: `src/lib/entitlements.ts`, `src/lib/require-auth.ts`,
`src/lib/full-access-users.ts`. Evite reimplementar essa lógica em páginas ou
componentes — chame os helpers centrais.

## Propriedade de recursos (autorização por linha)

Depois de autenticar, todo endpoint que opera sobre um ID precisa filtrar
também pelo dono — a sessão prova identidade, não prova propriedade do
recurso pedido:

```ts
where: { id, userId: session.user.id }
```

Para empresa, use `companyId` (da empresa, vindo do token — nunca do membro
nem do corpo da requisição). Para parceiro, `partnerId`. Retornar `404` (não
`403`) em recurso alheio reduz vazamento de existência do recurso. Nunca
confie em `userId`/`companyId`/`partnerId` enviados pelo cliente no corpo ou
querystring — sempre leia da sessão server-side.

## Matriz resumida

| Área | Visitante | Candidato | Assinante | Influenciador | Empresa | Parceiro | Admin |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Conteúdo público, vagas, blog, freelancers/projetos | Sim | Sim | Sim | Sim | Sim | Sim | Sim |
| Perfil, histórico, candidaturas | Não | Sim | Sim | Sim | Não | Não | Conforme operação |
| Diagnóstico completo | Limitado | Por crédito/pagamento | Sim | Sim (sem pagar) | Não | Não | Sim |
| Painel `/influencer` (vendas do cupom) | Não | Não | Não | Sim | Não | Não | Sim |
| Triagem, kanban, banco de talentos | Não | Não | Não | Não | Sim (própria empresa) | Não | Conforme operação |
| Painel `/parceiro` (cursos, créditos) | Não | Não | Não | Não | Não | Sim (próprio parceiro) | Conforme operação |
| `/admin` (fontes, cupons, suporte, moderação) | Não | Não | Não | Não | Não | Não | Sim |
