# Métricas e sistema de growth

## North Star

**Candidaturas preparadas por semana:** quantidade de análises concluídas que
geram ao menos uma ação de preparação — currículo salvo, item do plano marcado,
entrevista praticada ou candidatura registrada.

Essa métrica aproxima uso de valor. “Análise gerada” sozinha pode representar
curiosidade, não progresso.

## Funil

```text
Visitante
  ↓ visita qualificada
Ferramenta/vaga
  ↓ analysis_started
Análise iniciada
  ↓ analysis_completed
Resultado inicial
  ↓ diagnostic_teaser_viewed
Intenção paga
  ↓ checkout_started
Checkout
  ↓ payment_confirmed
Cliente
  ↓ nova análise/ação em 7 ou 30 dias
Retido
```

## Eventos atuais

Já existem:

- `analysis_started`;
- `analysis_completed`;
- `diagnostic_teaser_viewed`;
- `unlock_clicked`;
- `checkout_started`;
- `payment_confirmed`;
- `subscription_started`;
- `signup_completed`;
- `lead_captured`;
- `tool_used`.

## Propriedades recomendadas

Todo evento relevante deve carregar, quando aplicável:

| Propriedade | Exemplo |
| --- | --- |
| `segment` | `internship` |
| `source` | `google` |
| `medium` | `cpc` |
| `campaign` | `internship_search` |
| `content` | `ugc_no_experience_v2` |
| `landing_page` | `/estagio` |
| `tool` | `resume_analysis` |
| `product_kind` | `diagnostic` |
| `value_cents` | `490` |
| `is_new_user` | `true` |

Não enviar currículo, vaga completa, e-mail, telefone ou outros dados pessoais
como propriedade de analytics.

## Eventos faltantes prioritários

- `landing_cta_clicked`;
- `resume_uploaded`;
- `job_added`;
- `analysis_failed` com categoria segura;
- `checkout_failed`;
- `resume_saved`;
- `interview_practiced`;
- `application_created`;
- `action_plan_item_completed`;
- `subscription_renewed`;
- `subscription_expired`;
- `refund_confirmed`;
- `contact_request_accepted`.

## Métricas executivas

| Área | Métrica |
| --- | --- |
| Aquisição | CAC por segmento/canal |
| Ativação | visitante → análise concluída |
| Monetização | análise concluída → pagamento |
| Receita | receita, ticket, margem e MRR/receita por período |
| Retenção | nova ação em D7/D30 e renovação |
| Produto | candidaturas preparadas por semana |
| Qualidade | reembolso, falha, ticket e satisfação |
| Crescimento | LTV:CAC e payback |

## Metas iniciais como faixas de aprendizado

Não tratar como benchmark universal. Ajustar após quatro semanas de dados
limpos.

| Etapa | Faixa inicial a investigar |
| --- | ---: |
| Landing → análise iniciada | 8–20% |
| Análise iniciada → concluída | 55–80% |
| Concluída → teaser | 70%+ |
| Teaser → checkout | 5–15% |
| Checkout → pagamento | 35–70% |
| Cliente → nova ação D30 | 20–40% |

Uma taxa baixa deve ser diagnosticada por segmento, device, canal e erro antes
de redesenhar o funil inteiro.

## Meta mínima diária de crescimento

Para os primeiros 30 dias de aquisição ativa, a meta operacional é:

| Métrica | Mínimo diário | Meta semanal | Meta em 30 dias |
| --- | ---: | ---: | ---: |
| Novas assinaturas confirmadas | 5 | 35 | 150 |
| Visitas qualificadas | 1.000 | 7.000 | 30.000 |
| Conversão visita → assinatura | 0,5% | 0,5% | 0,5% |

**Visita qualificada** é uma sessão válida em uma landing, vaga ou ferramenta,
excluindo bots, tráfego interno e sessões sem engajamento. Visualizações de
vídeo e impressões de anúncio devem ser acompanhadas separadamente e não contam
como visita qualificada.

A meta diária serve como ritmo, mas a decisão deve considerar a média móvel de
sete dias. Um dia abaixo da meta não exige mudança imediata; sete dias abaixo de
35 assinaturas ou 7.000 visitas exigem diagnóstico do canal e do funil.

### Cálculo da meta

```text
assinaturas necessárias por dia =
meta de novas assinaturas no período / número de dias

visitas qualificadas necessárias por dia =
assinaturas necessárias por dia / conversão visita → assinatura
```

Com a meta inicial:

```text
5 assinaturas / 0,005 = 1.000 visitas qualificadas por dia
```

Recalcular após quatro semanas com a conversão real, sem reduzir a meta de
assinaturas apenas porque o funil converteu abaixo do esperado. Exemplo: se a
conversão real for 0,3%, serão necessárias aproximadamente 1.667 visitas
qualificadas por dia para manter cinco assinaturas; se for 1%, serão necessárias
500.

### Semáforo diário com leitura semanal

| Situação | Assinaturas/dia | Visitas qualificadas/dia | Ação |
| --- | ---: | ---: | --- |
| Vermelho | 0–2 | abaixo de 600 | Corrigir aquisição, mensagem ou falhas do funil |
| Amarelo | 3–4 | 600–999 | Manter testes e atacar a etapa de maior perda |
| Verde | 5–7 | 1.000–1.499 | Manter execução e validar CAC, margem e retenção |
| Supermeta | 8+ | 1.500+ | Considerar escala gradual se a economia estiver saudável |

O resultado comercial prevalece sobre o volume: atingir visitas sem assinatura
não caracteriza meta batida. Da mesma forma, assinatura com CAC acima do limite
ou pagamento não conciliado não deve justificar escala.

## Economia unitária

```text
CAC = investimento de aquisição / novos clientes atribuídos

Margem de contribuição =
receita - taxas de pagamento - IA - mídia variável - suporte variável

Payback =
CAC / margem de contribuição mensal média por cliente

LTV conservador =
margem mensal × meses médios observados de retenção
```

Para diagnóstico de R$ 4,90, mídia paga direta pode não se pagar na primeira
compra. O modelo precisa medir assinatura, recompra e valor do lead; não assumir
LTV futuro sem coorte observada.

## Ritmo operacional

### Diário

- gasto e conversões;
- falhas de checkout/pagamento;
- alertas de infraestrutura;
- comentários e reputação.

### Semanal

- funil por segmento/canal;
- criativos vencedores e fadiga;
- experimentos concluídos;
- receita conciliada;
- tickets e feedback.

### Mensal

- coortes de retenção;
- LTV:CAC e payback;
- contribuição por produto;
- mix orgânico/pago/parcerias;
- decisão de aumentar, manter ou cortar investimento.

## Registro de experimentos

| Campo | Exemplo |
| --- | --- |
| Hipótese | Mostrar antes/depois aumenta início de análise |
| Segmento | Estágio |
| Mudança | Hero demonstrativo |
| Métrica primária | Landing → `analysis_started` |
| Guardrail | Taxa de conclusão |
| Período | 14 dias |
| Resultado | +X%, intervalo/amostra |
| Decisão | Adotar, iterar ou descartar |

## Semáforo de escala

**Verde:** dados conciliados, CAC dentro do limite, conversão estável, retenção
presente e operação saudável.

**Amarelo:** aquisição funciona, mas LTV/retenção ainda incertos; manter
orçamento e aprender.

**Vermelho:** compra não concilia, reembolso cresce, suporte sobrecarrega ou
campanha só gera lead barato; pausar e corrigir.
