# Mapa de proximas features

Roadmap sugerido para o CarreirasMatch, organizado por impacto no negocio,
risco tecnico e momento do produto. Este mapa parte do estado atual descrito em
[`FEATURES.md`](FEATURES.md) e [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md).

## Norte do produto

O produto ja tem um nucleo forte: analise de curriculo x vaga, pagamento,
assinatura, historico, otimizador de curriculo, entrevistas, plano de acao,
kanban, feed de vagas, ferramentas gratuitas e captacao de leads.

As proximas features devem priorizar tres resultados:

1. aumentar a conversao de visitante em lead/cliente;
2. aumentar retencao depois da primeira analise;
3. reduzir risco operacional antes de escalar trafego pago ou parcerias.

## Fase 0: antes de divulgar pesado

Objetivo: garantir que o produto pode vender e entregar acesso sem depender de
ajuste manual.

| Feature / iniciativa | Por que fazer | Resultado esperado | Prioridade |
|---|---|---|---|
| ✅ Teste real de pagamento ponta a ponta (validado em 16/07/2026) | Confirma Mercado Pago, webhook e liberacao de acesso | Pagamento aprovado ativa diagnostico/assinatura automaticamente | Concluido |
| Confirmar `ADMIN_EMAILS` em producao | Garante suporte e concessao manual em caso de problema | Admin acessivel no ambiente real | P0 |
| ✅ PostgreSQL e backup periódico | Reduz risco de perda e suporta concorrência | Dumps automáticos; falta validar restauração periodicamente | Concluído |
| Ativar Plausible e Sentry em producao | Permite medir funil e enxergar erros reais | Eventos e erros visiveis desde o dia 1 | P1 |
| Revisao juridica de termos/privacidade | Reduz risco ao operar com dados, IA e pagamentos | Base legal mais segura para escala | P1 |

## Fase 1: conversao e primeira receita

Objetivo: melhorar o caminho do usuario anonimo ate o pagamento.

| Feature | Descricao | Impacto | Esforco |
|---|---|---|---|
| Tela de resultado gratuito mais persuasiva | Reorganizar teaser da analise para mostrar score, 2-3 insights e CTA claro para diagnostico completo | Alto | Medio |
| Checkout com prova de valor por segmento | Texto/preco/beneficios diferentes para aprendiz, estagio, primeiro emprego, transicao e profissional | Alto | Baixo |
| Recuperacao de lead por e-mail | Sequencia curta para quem fez analise/teste e nao pagou | Alto | Medio |
| Pagamento recusado com retentativa guiada | Tela/e-mail explicando como tentar de novo ou usar PIX/cartao | Medio | Baixo |
| Cupons com relatorio por influenciador | Mostrar usos, vendas pagas e receita por cupom no admin | Medio | Medio |
| Pagina publica de vaga do dia | Usar `/vagas-de-hoje` e `/vagas/[slug]` como entrada SEO com CTA para analisar curriculo | Medio | Medio |

## Fase 2: retencao e rotina semanal

Objetivo: fazer o usuario voltar depois da primeira analise.

| Feature | Descricao | Impacto | Esforco |
|---|---|---|---|
| Dashboard de jornada | Uma tela inicial com score atual, proximas acoes, candidaturas, prazos e entrevistas | Alto | Medio |
| Lembretes de prazo e entrevista | E-mails para `deadline` e `interviewAt` das candidaturas | Alto | Medio |
| Metas semanais mais visiveis | Check-in semanal: candidaturas feitas, curriculos ajustados, entrevistas treinadas | Medio | Medio |
| Evolucao do score por cargo | Grafico simples mostrando melhora entre analises parecidas | Medio | Medio |
| Reanalise rapida apos editar curriculo | Botao para comparar curriculo otimizado contra a mesma vaga | Alto | Medio |
| Exportacao do plano de acao | Baixar ou copiar checklist semanal de estudos e ajustes | Baixo | Baixo |

## Fase 3: qualidade da IA e confiabilidade

Objetivo: reduzir falhas, respostas ruins e custo operacional.

| Feature / melhoria | Descricao | Impacto | Esforco |
|---|---|---|---|
| Validacao de env vars no boot | Usar schema para falhar rapido quando faltar config critica | Alto | Baixo |
| Schema da resposta da IA | Validar JSON estruturado da analise antes de salvar | Alto | Medio |
| Retry/backoff com fallback | Tentar novamente em timeout/rate limit e alternar provedor quando possivel | Alto | Medio |
| Testes de integracao do billing | Cobrir webhook, pagamento aprovado, falha e idempotencia | Alto | Medio |
| Testes de integracao da analise | Cobrir parsing, resposta IA mockada e persistencia | Medio | Medio |
| Logs operacionais por analise | Registrar provider/modelo/tempo/custo aproximado/status | Medio | Baixo |

## Fase 4: crescimento organico e SEO

Objetivo: transformar ferramentas gratuitas e vagas em aquisicao constante.

| Feature | Descricao | Impacto | Esforco |
|---|---|---|---|
| Landing por segmento + palavra-chave | Paginas especificas para jovem aprendiz, estagio, primeiro emprego, transicao etc. | Alto | Medio |
| Conteudo programatico de vagas | Paginas indexaveis por area/cidade/modelo de trabalho | Alto | Alto |
| Lead magnet por ferramenta | Cada ferramenta gratuita captura um proximo passo especifico | Medio | Medio |
| Blog com revisao editorial | Melhorar posts gerados automaticamente antes de indexar em escala | Medio | Medio |
| Casos reais anonimizados | Exemplos de antes/depois de curriculo e score | Alto | Medio |

## Fase 5: features premium

Objetivo: aumentar disposicao a pagar e diferenciar planos.

| Feature | Descricao | Impacto | Esforco |
|---|---|---|---|
| Simulador de entrevista com feedback | Usuario responde por texto/audio e recebe feedback estruturado | Alto | Alto |
| Comparador de multiplas vagas salvo | Usuario escolhe 3-5 vagas e recebe ranking de melhor aposta | Alto | Medio |
| Curriculo por versao de vaga | Salvar variantes do curriculo por candidatura | Alto | Alto |
| Biblioteca de respostas | Respostas prontas e personalizadas para perguntas comuns | Medio | Medio |
| Perfil publico compartilhavel | Pagina simples com curriculo otimizado/portfolio para enviar a recrutadores | Medio | Alto |
| Assistente de candidatura | Gerar mensagem, carta, ajuste de curriculo e plano para uma vaga em um fluxo unico | Alto | Alto |

## Fase 6: escala tecnica

Objetivo: preparar o produto para mais usuarios, mais escrita concorrente e
operacao menos fragil.

| Iniciativa | Por que fazer | Momento recomendado |
|---|---|---|
| ✅ PostgreSQL 17 | Migração concluída com volume e backup dedicado | Concluído; monitorar e testar restauração |
| Rate limit distribuido | Limite em memoria nao funciona bem com multiplas instancias | Antes de escalar horizontalmente |
| Fila para analises e scraping | Evita timeout e melhora experiencia em tarefas longas | Quando analises/feed ficarem lentos |
| Cache de matching de vagas | Reduz chamadas de IA repetidas | Quando feed tiver volume maior |
| Backoffice de suporte | Ver pagamentos, leads, analises, erros e usuarios em uma tela | Quando suporte manual crescer |

## Priorizacao recomendada

### Agora

1. ✅ Pagamento real em producao validado em 16/07/2026.
2. ✅ Backup diario do banco configurado.
3. Ativar analytics em producao e confirmar eventos no painel; Sentry ja esta configurado.
4. Acompanhar a conversao do teaser/checkout e iterar com dados reais.

### Proximas 2 semanas

1. Dashboard de jornada.
2. Lembretes de prazo/entrevista.
3. Recuperacao de lead por e-mail.
4. Reanalise rapida depois de editar curriculo.
5. Validacao de env vars no boot.

### Proximos 30-60 dias

1. Schema e retry/backoff na IA.
2. Relatorio de cupons/influenciadores.
3. Conteudo SEO por segmento.
4. Testes de integracao de billing e analise.
5. Comparador premium de multiplas vagas salvo.

## Criterios para decidir a proxima feature

Use esta ordem de decisao:

1. desbloqueia receita ou reduz risco de pagamento?
2. aumenta a chance do usuario voltar em ate 7 dias?
3. melhora a clareza do valor antes do checkout?
4. reduz suporte manual?
5. gera trafego organico qualificado?

Se a resposta for "nao" para todos, provavelmente nao e a proxima feature.

## Entregue na expansão de oportunidades públicas

1. Cadastro administrativo de fontes oficiais.
2. Busca pública por cargo, cidade e estado.
3. Leitura de informações disponíveis em boletins PDF.
4. Alertas diários e semanais por e-mail.
5. Páginas indexáveis de vagas e cursos por cidade.
6. Recomendações baseadas no perfil e nos cargos de interesse.
7. Métricas de cliques, campanhas, cidades e denúncias.
8. Consolidação de duplicados, expiração e revisão administrativa.

## Metricas para acompanhar

| Metrica | Por que importa |
|---|---|
| Visitante -> analise iniciada | Mede promessa da landing |
| Analise iniciada -> analise concluida | Mede friccao tecnica/UX |
| Analise concluida -> lead capturado | Mede valor percebido do resultado gratis |
| Lead -> pagamento avulso | Mede forca do teaser e checkout |
| Usuario pago -> segunda analise | Mede retencao real |
| Assinante -> uso semanal | Mede valor recorrente |
| Candidaturas criadas por usuario | Mede uso do produto como rotina |
| Erros por analise/pagamento | Mede confiabilidade operacional |
