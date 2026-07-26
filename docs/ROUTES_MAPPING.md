# Mapa resumido de rotas e acesso

Revisado em 26/07/2026. O mapa exato é o diretório `src/app`; grupos entre
parênteses, como `(painel)`, não aparecem na URL pública.

## Público

Landing, autenticação, conteúdo SEO, blog, vagas e oportunidades públicas,
segmentos de carreira, cursos, ferramentas, ensino médio, jogos, radar,
`/desafio`, `/gratuito`, `/comece`, `/verificador-ats`, `/sobre`, `/ajuda`,
`/termos` e `/privacidade` são definidos em `src/app` sem sessão obrigatória,
embora alguns recursos possam aplicar gate de cadastro ou limite gratuito.

## Candidato autenticado

`/dashboard`, `/profile`, `/settings`, `/analise`, `/report`, `/resume`,
`/applications`, `/interviews`, `/action-plan`, `/history`, `/feed`,
`/mensagens`, `/projetos` e áreas relacionadas usam sessão conforme o fluxo.
As páginas de assinatura (`/assinar`) e os endpoints de billing controlam a
liberação de recursos pagos.

## Empresa

O portal usa `/empresa/login`, `/empresa/cadastro` e o painel em
`/empresa/(painel)`, que gera URLs como `/empresa`, `/empresa/vagas`,
`/empresa/triagem`, `/empresa/talentos`, `/empresa/perfil`, `/empresa/equipe`
e `/empresa/billing`.

## Parceiros, freelancers e administração

- Parceiros: `/parceiro/*` e páginas públicas `/parceiros/*`.
- Freelancers: `/freelancer/*`, `/freelancers/*` e `/projetos/*`.
- Administração: `/admin/*`, protegida pelas regras administrativas de
  `src/auth.config.ts` e pelos handlers de API correspondentes.

## API

Todos os endpoints estão em `src/app/api`. Os grupos principais são análise e
IA, autenticação, usuário, candidaturas, vagas/feed, alertas, billing,
empresas, parceiros, freelancer, ensino médio, ferramentas, suporte,
analytics, cron e webhooks.

## Proteção

`src/proxy.ts` aplica a sessão de forma centralizada, enquanto cada página/API
também pode exigir usuário, assinatura, tipo de conta ou permissão de admin.
Ao criar ou mover uma rota, conferir o proxy, a página e o handler associado.
