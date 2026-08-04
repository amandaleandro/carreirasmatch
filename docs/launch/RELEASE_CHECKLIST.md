# Checklist de lançamento do CarreirasMatch

## Concluído no ambiente local

- [x] `npx prisma validate`
- [x] Migrações do PostgreSQL aplicadas
- [x] TypeScript sem erros
- [x] Suíte Vitest: 51 arquivos e 293 testes aprovados
- [x] Menu mobile revisado para candidato, empresa, parceiro, administrador e influenciador
- [x] Sitemap, robots, metadados canônicos e FAQ estruturada revisados
- [x] Compatibilidade com assinaturas legadas sem `planKey`
- [x] Endpoint de saúde em `/api/health` para monitoramento do serviço e banco

## Antes de publicar

- [ ] Executar `npm run build` em CI ou no servidor de produção com acesso ao banco
- [ ] Confirmar `DATABASE_URL`, `APP_URL`, autenticação, pagamentos e webhooks
- [ ] Confirmar Sentry (`SENTRY_DSN`) e verificar o primeiro evento de erro
- [ ] Confirmar eventos de analytics: cadastro, análise, resultado, checkout e pagamento
- [ ] Testar fluxos de login, cadastro, análise, assinatura, candidatura e exclusão de conta
- [ ] Testar layouts mobile nos perfis candidato, empresa e parceiro
- [ ] Verificar sitemap e Search Console após publicar

## Integrações externas

- [ ] LinkedIn: definir escopo OAuth e aprovação do aplicativo
- [ ] Áudio: escolher provedor de transcrição e configurar limites de armazenamento
- [ ] Extensão: definir permissões e revisão da loja
- [ ] Notificações: confirmar VAPID, domínio e consentimento do usuário
- [ ] Parcerias: definir contrato, atribuição de leads e acesso da instituição

## Segurança e privacidade

- [ ] Validar rate limit das APIs públicas e de IA
- [ ] Confirmar que toda consulta autenticada filtra pelo `userId` ou pela conta da empresa
- [ ] Verificar limites de tamanho e tipo de arquivos enviados
- [ ] Confirmar sanitização de textos exibidos e proteção contra XSS
- [ ] Validar exportação e exclusão de dados conforme a política de privacidade
- [ ] Fazer backup do banco antes da migração de produção
