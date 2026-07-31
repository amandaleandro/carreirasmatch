# CarreirasMatch Design System

Fonte de verdade dos tokens de interface implementados em `src/app/globals.css`.

## Foundations

| Grupo | Tokens principais | Uso |
| --- | --- | --- |
| Cor | `--color-primary`, `--color-primary-hover`, `--color-secondary-action` | Ações e navegação |
| Match | `--color-match-success`, `--color-warning`, `--color-danger` | Score, lacunas e alertas |
| Superfície | `--background`, `--surface`, `--surface-elevated`, `--border-color` | Layout claro/escuro |
| Espaçamento | `--space-1` a `--space-10` | Grid base de 4px |
| Forma | `--radius-sm` a `--radius-2xl`, `--radius-full` | Campos, cards e badges |
| Elevação | `--shadow-sm`, `--shadow-md`, `--shadow-focus` | Hierarquia e foco |

## Primitives

- `.ds-card`: superfície padrão para conteúdo agrupado.
- `.ds-button-primary`, `.ds-button-secondary`, `.ds-button-quiet`: ações com altura mínima de 44px.
- `.ds-input`: campo com foco visível e contraste consistente.
- `.ds-focus-ring`: foco para controles customizados.
- `.ds-skeleton`: carregamento de IA com movimento reduzível.
- `.ds-status-match`, `.ds-status-warning`, `.ds-status-danger`: estados semânticos do Match.

## Regras de UX

- Foco nunca depende apenas de cor: use `:focus-visible`.
- Carregamentos de IA usam skeleton e mensagem de progresso, não spinner isolado.
- Score de 80–100% usa Match, 60–79% usa atenção e abaixo de 60% usa risco.
- Animações respeitam `prefers-reduced-motion`.
- Não usar travessão em copy de produto, conforme as diretrizes de marca.

## Mapeamento para Figma

Quando um arquivo Figma editável estiver disponível, criar as collections `Primitives`, `Color`, `Spacing` e `Typography`, com modos `Value`, `Light` e `Dark` conforme aplicável. Componentes prioritários: Button, Input, Card, Badge/Status, Score, Progress, Skeleton, Tabs, Modal e Navigation.
