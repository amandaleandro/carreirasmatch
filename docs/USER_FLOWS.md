# Jornadas principais

## Candidato: cadastro até análise

1. O visitante entra por uma landing page, vaga, conteúdo ou ferramenta.
2. Cria uma conta em `/register` ou inicia uma análise permitida sem sessão.
3. Informa ou envia o currículo e o texto da vaga.
4. `POST /api/analyze` extrai o conteúdo, aplica limites e chama a camada de IA.
5. O sistema persiste `Resume` e `Analysis`.
6. O relatório parcial ou completo é exibido em `/report/[id]`.
7. O acesso completo depende de crédito, diagnóstico pago, assinatura,
   influenciador ou acesso administrativo configurado.

## Compra avulsa

1. O usuário escolhe desbloquear um diagnóstico.
2. `POST /api/billing/payment` cria o pagamento no Mercado Pago e um `Payment`
   local pendente.
3. A aprovação pode chegar na resposta do checkout ou no webhook.
4. `POST /api/billing/webhook` valida a assinatura, consulta o pagamento e
   atualiza o registro de forma idempotente.
5. O `analysisId` pago passa a ter diagnóstico completo.

## Assinatura

1. O usuário seleciona um plano em `/assinar`.
2. `POST /api/billing/subscription` cria o fluxo recorrente.
3. Pagamentos confirmados atualizam `Payment` e `Subscription`.
4. `hasActiveSubscriptionAccess()` considera status e período vigente.
5. Cancelamento ou expiração remove o acesso recorrente, sem apagar o histórico.

## Busca e candidaturas

1. Fontes internas e externas alimentam `Job` e `PublicOpportunity`.
2. O candidato consulta `/feed`, `/vagas-de-hoje` ou `/vagas-publicas`.
3. Pode salvar a oportunidade e criar/atualizar uma candidatura.
4. `Application` registra o estado atual; `ApplicationActivity` guarda as
   transições.
5. Entrevistas e plano de ação reutilizam dados da análise e da candidatura.

## Empresa: triagem

1. A empresa cria conta em `/empresa/cadastro` e entra por `/empresa/login`.
2. A sessão recebe `accountType = company` e `companyId`.
3. A empresa cria uma triagem e envia currículos.
4. `POST /api/empresa/triagem` verifica franquia/créditos, extrai currículos e
   classifica candidatos.
5. A triagem fica disponível em `/empresa/triagem/[id]`.
6. Depois do limite gratuito, a empresa compra créditos em `/empresa/billing`.

## Banco de talentos

1. O candidato ativa `discoverable` e informa interesses.
2. A empresa pesquisa apenas perfis elegíveis.
3. Um `TalentContactRequest` é criado com status `pending`.
4. O candidato aceita ou recusa.
5. O contato só deve ser disponibilizado depois de `accepted`.

## Suporte

1. O usuário abre um ticket em `/suporte`.
2. Mensagens ficam associadas a `SupportTicket`.
3. A equipe trata o chamado em `/admin/suporte`.
4. Estado e histórico do chamado permanecem persistidos.
