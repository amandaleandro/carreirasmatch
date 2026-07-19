# Operação

## Arquitetura de produção

O Compose principal executa:

- `app`: Next.js;
- `postgres`: PostgreSQL 17;
- `postgres-backup`: backup periódico;
- `caddy`: proxy reverso e TLS.

A stack opcional de observabilidade executa Prometheus, Loki, Promtail, Grafana,
cAdvisor e Node Exporter.

## Deploy

Checklist mínimo:

```bash
npm ci
npm run lint
npm test
npm run build
npx prisma migrate deploy
docker compose up -d --build
docker compose ps
```

Em produção, execute migrations com backup recente e uma estratégia de retorno.
Não imprima o `.env` em logs ou tickets.

## Verificações pós-deploy

1. Abrir página pública e efetuar login.
2. Conferir `docker compose ps` e logs sem loop de restart.
3. Validar conexão com PostgreSQL.
4. Executar uma análise controlada.
5. Confirmar `/api/metrics` pelo Prometheus.
6. Conferir erro/evento de teste no Sentry, quando habilitado.
7. Em mudanças de cobrança, executar o roteiro de homologação.

## Backup

`postgres-backup` usa:

- `BACKUP_INTERVAL_SECONDS`;
- `BACKUP_RETENTION_DAYS`;
- diretório montado por `SQLITE_BACKUP_HOST_DIR` (nome legado; atualmente
  também seleciona o destino do backup PostgreSQL).

Operação mensal obrigatória:

1. escolher um backup recente;
2. restaurar em uma instância PostgreSQL isolada;
3. conferir migrations e contagens;
4. executar consultas de leitura críticas;
5. registrar data, arquivo e resultado do teste.

Sem teste de restauração, existe arquivo de backup, mas não há garantia de
recuperação.

## Jobs agendados

Há agendadores para feed de vagas, fontes externas, e-mails, blog e YouTube.
Eles rodam no processo da aplicação; múltiplas réplicas exigem coordenação
distribuída para não duplicar trabalho. Consulte `SourceSync` e `EmailLog` ao
investigar repetição.

## Observabilidade

Subida da stack:

```bash
docker compose -f docker-compose.observability.yml up -d
```

Indicadores mínimos:

- disponibilidade e latência HTTP;
- taxa de respostas 5xx e 429;
- falhas/latência de IA;
- webhooks recebidos e rejeitados;
- pagamentos pendentes por tempo excessivo;
- falhas dos schedulers;
- CPU, memória, disco e conexões do banco.

## Incidente

1. Registrar horário, sintomas e impacto.
2. Preservar logs e identificar último deploy/migration.
3. Conter o impacto sem apagar evidências.
4. Se houver cobrança indevida ou vazamento, priorizar bloqueio da ação.
5. Restaurar o serviço e validar os fluxos críticos.
6. Documentar causa, correção e prevenção.

## Rotação de segredos

Troque imediatamente um segredo exposto, atualize o ambiente e reinicie os
serviços dependentes. Para webhook, atualize provedor e aplicação na mesma
janela. Considere inválido qualquer segredo que apareceu em commit, log, print
ou conversa pública.
