# Autenticação e autorização

## Tipos de identidade

O NextAuth/Auth.js usa JWT e dois contextos:

- **candidato:** credenciais e, quando configurado, Google OAuth;
- **empresa:** provider próprio de credenciais, com `accountType = company` e
  `companyId` na sessão.

Senhas são armazenadas com `bcryptjs`. Empresa e candidato possuem entidades
separadas.

## Proteção de páginas

`src/proxy.ts` executa o callback `authorized` de `src/auth.config.ts`.

- páginas explicitamente públicas são liberadas;
- `/empresa/login` e `/empresa/cadastro` são públicas;
- demais páginas `/empresa/*` exigem sessão de empresa;
- páginas não públicas exigem alguma sessão.

O matcher ignora APIs, assets, imagens e arquivos técnicos. Isso significa que
API Route Handlers devem se proteger individualmente.

## Helpers

| Helper | Uso |
| --- | --- |
| `requireAuthPage()` | Página de candidato |
| `requireSubscriptionPage()` | Página com assinatura |
| `requireAuth()` | API de candidato, com rate limit comum |
| `requireActiveSubscription()` | API com acesso recorrente |
| `requireCompanyPage()` | Página de empresa |
| `requireCompanyApi()` | API de empresa |
| `requireAdminPage()` | Página administrativa |
| `requireAdminApi()` | API administrativa |

## Entitlements

Autenticação responde “quem é”; entitlement responde “o que pode acessar”.
O acesso completo pode resultar de:

- assinatura ativa e dentro do período;
- pagamento associado ao diagnóstico;
- crédito elegível para análise;
- perfil de influenciador;
- usuário de acesso total configurado;
- concessão administrativa.

As regras centrais ficam em `src/lib/entitlements.ts`,
`src/lib/require-auth.ts` e `src/lib/full-access-users.ts`. Evite reproduzir a
mesma regra diretamente em páginas ou componentes.

## Administração

Um usuário é administrador quando seu e-mail está em `ADMIN_EMAILS` ou atende à
regra interna de acesso total. E-mails devem ser normalizados para minúsculas.
Operações administrativas sensíveis ficam no servidor.

## Propriedade de recursos

Depois de autenticar, todo endpoint por ID deve filtrar também pelo dono:

```ts
where: { id, userId: session.user.id }
```

Para empresa, use `companyId`. Retornar `404` em recurso alheio reduz vazamento
de existência. Nunca confie em `userId` ou `companyId` enviados pelo cliente.

## Matriz resumida

| Área | Visitante | Candidato | Assinante | Empresa | Admin |
| --- | --- | --- | --- | --- | --- |
| Conteúdo e vagas públicas | Sim | Sim | Sim | Sim | Sim |
| Perfil e histórico | Não | Sim | Sim | Não | Conforme operação |
| Diagnóstico completo | Limitado | Por crédito/pagamento | Sim | Não | Sim |
| Triagem e talentos | Não | Não | Não | Sim | Conforme operação |
| Gestão de fontes/cupons | Não | Não | Não | Não | Sim |
