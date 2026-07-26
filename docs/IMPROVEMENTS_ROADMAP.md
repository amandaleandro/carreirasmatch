# Roadmap de melhorias

Documento revisado em 26/07/2026. Itens abaixo são trabalho futuro; recursos
já presentes no código não devem aparecer como pendências.

## Concluído

- Rate limiting, validação HMAC do webhook do Mercado Pago e testes de regras
  críticas estão implementados em `src/lib` e nas rotas correspondentes.
- O mapa funcional e as jornadas principais foram documentados nos arquivos
  mantidos neste diretório.

## Próximas melhorias

- Organizar componentes de `src/components` por domínio sem alterar contratos
  das rotas.
- Manter o inventário de rotas sincronizado com `src/app`.
- Evoluir estados de carregamento e feedback de IA nas telas de análise,
  entrevistas e plano de ação.
- Melhorar a visualização de fit score e triagem no portal da empresa.
- Medir continuamente os fluxos de análise, checkout, candidatura e retenção.

## Critério para marcar como entregue

Um item só sai do roadmap depois de existir em `src/`, possuir validação
adequada e estar refletido no documento de produto ou jornada correspondente.
