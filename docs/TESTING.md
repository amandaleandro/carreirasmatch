# Testes e validação

## Comandos

```bash
npm run lint
npm test
npm run build
```

- ESLint cobre regras estáticas.
- Vitest executa testes unitários `src/**/*.test.ts`.
- O build valida TypeScript, imports, renderização e convenções do Next.js.

## Cobertura existente

Há testes para regras sensíveis, incluindo:

- providers e normalização de IA;
- entitlements e limites gratuitos;
- cupons, comissão e relatórios;
- rate limit;
- e-mail e suporte;
- acesso a ferramentas;
- fontes e sincronização de oportunidades;
- segurança de URL;
- GitHub e matching de cursos;
- regras de carreira e análise.

## Matriz manual crítica

| Fluxo | Casos mínimos |
| --- | --- |
| Cadastro/login | sucesso, senha errada, duplicidade, rate limit |
| Recuperação | token válido, expirado, reutilizado e e-mail inexistente |
| Análise | PDF/texto, anônimo, usuário, falha de IA e limite |
| Pagamento | cartão, Pix/webhook, repetição, assinatura inválida |
| Entitlement | gratuito, crédito, avulso, assinatura, expiração |
| Candidatura | criar, mover estado, editar e excluir |
| Empresa | cadastro, franquia, crédito e isolamento entre empresas |
| Talentos | opt-in, pedido, aceite, recusa e privacidade |
| Admin | usuário comum bloqueado e administrador autorizado |
| Schedulers | execução repetida sem duplicação |

## Ao alterar o banco

1. Criar migration.
2. Aplicar em banco descartável.
3. Testar dados existentes e novos.
4. Validar rollback operacional ou restauração.
5. Conferir índices e constraints.

## Ao alterar integrações

Use mocks nos testes unitários e um ambiente controlado para integração.
Pagamento em produção deve seguir
[PAYMENT_PRODUCTION_VALIDATION.md](PAYMENT_PRODUCTION_VALIDATION.md).

## Critério de conclusão

Uma mudança está pronta quando testes proporcionais ao risco passam, a
documentação afetada foi atualizada e não existem erros conhecidos ocultados
por flags, mocks ou dados artificiais.
