# Playbook de Operação de Mídia e Campanhas (2026)

Este documento estabelece o padrão operacional para execução, rastreamento e otimização das campanhas de marketing do **CarreirasMatch** no Meta Ads (Instagram/Facebook), LinkedIn Ads e Google Ads.

---

## 1. Padrão Estrito de UTMs

Todas as URLs divulgadas em mídia paga, influenciadores, redes orgânicas ou e-mail devem seguir a seguinte convenção de nomenclatura de UTMs:

### Estrutura Base
`https://carreirasmatch.com.br/<rota>?utm_source=<origem>&utm_medium=<meio>&utm_campaign=<campanha>&utm_content=<conteudo>`

### Tabela de Valores Padronizados

| Parâmetro | Valores Válidos | Exemplo |
| :--- | :--- | :--- |
| `utm_source` | `instagram`, `linkedin`, `tiktok`, `google`, `email`, `influencer`, `referral` | `instagram` |
| `utm_medium` | `cpc` (pago), `stories_organic`, `reels_organic`, `post_organic`, `newsletter`, `partner` | `cpc` |
| `utm_campaign` | `desafio_match`, `recolocacao_pleno`, `primeiro_emprego`, `estagio_tech`, `b2b_empresas` | `desafio_match` |
| `utm_content` | `card_match_story`, `carrossel_gupy_vs_cv`, `video_copiloto_30s`, `banner_linkedin_dados` | `carrossel_gupy_vs_cv` |

---

## 2. Segmentação de Público Recomendada

### A. Meta Ads (Instagram & Facebook)
* **Campanha 1: Desafio do Match (Viral Loop & Lead Gen)**
  * **Objetivo**: Cadastro / Lead (`SIGNUP_COMPLETED` ou `ANALYSIS_STARTED`).
  * **Idade**: 18 a 34 anos.
  * **Interesses**: Procura de emprego, Curriculum vitae, Primeiro emprego, Estágio, Catho, Gupy, LinkedIn.
  * **Formato Preferencial**: Reels 9:16 (Vídeo de 15 a 30s) e Stories com sticker de link.

* **Campanha 2: Transição de Carreira & Recolocação**
  * **Objetivo**: Assinatura / Conversão (`PAYMENT_CONFIRMED`).
  * **Idade**: 25 a 45 anos.
  * **Interesses**: Desenvolvimento profissional, Recolocação profissional, MBA, Cursos online, LinkedIn.

### B. LinkedIn Ads
* **Campanha 1: Profissionais em Transição / Recolocação**
  * **Objetivo**: Conversão em Plano Pro (`SUBSCRIPTION_CONFIRMED`).
  * **Targeting**: Funções: Vendas, Tecnologia, Marketing, Recursos Humanos, Operações.
  * **Status**: "Em busca de novas oportunidades" ou membros de grupos de transição de carreira.
  * **Formato**: Single Image Post + Text com chamada para teste de aderência por link da vaga.

* **Campanha 2: B2B Recrutamento (`/empresas`)**
  * **Objetivo**: Cadastro de Empresas para Triagem com IA.
  * **Targeting**: Cargo: Recrutador, Tech Recruiter, Gerente de RH, VP de Pessoas, Founder.

---

## 3. Matriz de Variáveis de Ambiente de Mídia

As variáveis abaixo controlam o disparo dos scripts e devem ser cadastradas na VPS / hospedagem de produção:

```env
# Meta Pixel (Instagram & Facebook Ads)
NEXT_PUBLIC_META_PIXEL_ID="1234567890123456"

# LinkedIn Insight Tag
NEXT_PUBLIC_LINKEDIN_PARTNER_ID="1234567"

# Google Ads / GA4
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-123456789"
```

---

## 4. Checklist de Lançamento de Campanha

- [ ] Variáveis `NEXT_PUBLIC_META_PIXEL_ID` e/ou `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` configuradas no ambiente.
- [ ] Testar se o evento `CompleteRegistration` é recebido no Gerenciador de Negócios do Meta ao criar uma conta no `/desafio` ou `/register`.
- [ ] Testar se o evento `Purchase` é recebido ao concluir um pagamento no ambiente de teste do Mercado Pago.
- [ ] Validar que todas as URLs do anúncio usam o gerador de UTMs conforme a Seção 1.
- [ ] Confirmar que os links da bio do Instagram apontam para `/desafio` ou `/comece` com UTMs apropriadas.
