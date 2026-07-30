# Documentação do CarreirasMatch

O CarreirasMatch é um copiloto brasileiro de carreira: compara currículo e
vaga, mostra lacunas relevantes e transforma o diagnóstico em próximos passos.
O produto também reúne candidaturas, entrevistas, ferramentas gratuitas,
conteúdo, oportunidades, empresas, parceiros e marketplace freelancer.

Este diretório descreve o estado observado no código e foi revisado em
26/07/2026. Quando houver divergência, `src/` e `prisma/schema.prisma` são a
fonte de verdade.

## Documentos mantidos

| Necessidade | Documento |
| --- | --- |
| Inventário completo de funcionalidades | [FEATURES.md](FEATURES.md) |
| Visão executiva, público e proposta de valor | [PRODUCT_AND_MARKETING_BRIEF.md](PRODUCT_AND_MARKETING_BRIEF.md) |
| Arquitetura, integrações e domínios | [COMPLETE_ARCHITECTURE_AND_ECOSYSTEM.md](COMPLETE_ARCHITECTURE_AND_ECOSYSTEM.md) |
| Jornadas principais | [USER_FLOWS.md](USER_FLOWS.md) |
| Mapa resumido de rotas e acesso | [ROUTES_MAPPING.md](ROUTES_MAPPING.md) |
| Design e UX | [DESIGN_SYSTEM_AND_UX.md](DESIGN_SYSTEM_AND_UX.md) |
| Melhorias planejadas | [IMPROVEMENTS_ROADMAP.md](IMPROVEMENTS_ROADMAP.md) |
| Posicionamento e mensagens | [marketing/POSITIONING.md](marketing/POSITIONING.md) |
| Biblioteca de copy real | [marketing/COPY_LIBRARY.md](marketing/COPY_LIBRARY.md) |
| Operação de marketing | [marketing/README.md](marketing/README.md) |
| Mídia paga e rastreamento | [marketing/PAID_MEDIA.md](marketing/PAID_MEDIA.md) |

## Rodando localmente

```bash
npm install
npm run dev
```

Comandos disponíveis em `package.json`: `npm run build`, `npm run start`,
`npm run lint` e `npm test`. O ambiente depende das variáveis configuradas no
`.env` e do banco definido pelo Prisma; consulte o código de `src/lib/env.ts`
e `prisma/schema.prisma` antes de alterar infraestrutura.

## Regra de manutenção

Ao alterar uma funcionalidade, revise o documento correspondente. Rotas,
permissões e integrações devem ser conferidas diretamente em `src/app`,
`src/proxy.ts`, `src/auth.config.ts` e `src/lib`. Não documente como existente
algo que esteja apenas no roadmap ou em uma ideia de marketing.
