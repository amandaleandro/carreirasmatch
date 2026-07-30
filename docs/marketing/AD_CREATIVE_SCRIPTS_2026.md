# Kit de Criativos e Copys para Mídia Paga (Meta Ads & Google Ads)

Este guia contém os scripts de anúncios, formatos de imagem, headlines e configurações de campanha prontos para copiar e colar nos gerenciadores de anúncios.

---

## 🎨 1. Criativos Visuais Gerados (Meta Ads / Instagram)

### Criativo A: Feed / Carrossel (Verificador ATS & 3 Scores)
- **Formato**: Imagem Quadrada 1:1 (`ad_instagram_ats_checker.jpg`)
- **Visual**: Interface em Dark Mode do CarreirasMatch mostrando os **3 Scores** (Leitura ATS, Qualidade do CV, Aderência à Vaga).
- **Texto Principal (Legenda do Post)**:
  ```text
  Você envia o mesmo currículo para dezenas de vagas na Gupy ou no LinkedIn e não recebe nenhuma chamada para entrevista? 🛑

  O erro provavelmente não é a sua experiência. É que os sistemas automáticos (ATS) descartam o seu arquivo antes mesmo de um recrutador humano ler.

  Com o Verificador ATS do CarreirasMatch, você descobre em segundos:
  1. Se o robô consegue ler seu PDF sem erros de formatação;
  2. A nota de qualidade do seu texto e verbos de ação;
  3. A aderência real do seu perfil contra a vaga desejada.

  👉 Faça o teste 100% gratuito agora: carreirasmatch.com.br/verificador-ats
  ```

---

### Criativo B: Instagram Stories & Reels (Desafio do Match - 9:16)
- **Formato**: Vertical 9:16 (`ad_story_desafio_match.jpg`)
- **Visual**: Mockup de tela mobile com o Card de Match % para compartilhar nos Stories.
- **Texto do Story**:
  - *Headline Visual*: "Descubra seu Match % real com a vaga dos seus sonhos!"
  - *Texto do Botão*: "Testar Meu Currículo Grátis"
- **Roteiro em Vídeo (Para gravar ou usar áudio)**:
  - *0-3s*: "Se você tá mandando currículo pra vaga de estágio ou primeiro emprego e ninguém responde, para tudo e olha isso."
  - *3-10s*: "Eu peguei meu currículo, joguei no Desafio do Match do CarreirasMatch e descobri que meu match com a vaga era 62% por causa de 3 palavras-chave que faltavam."
  - *10-15s*: "Ajustei em 2 minutos e meu match subiu pra 91%. O link pra testar de graça tá aqui no sticker."

---

## 🔍 2. Anúncios para Google Ads (Rede de Pesquisa)

### Grupo de Anúncios 1: Verificador ATS & Gupy (Intenção Direta)

- **Palavras-chave**:
  - `"verificador de curriculo ats"`
  - `"testar curriculo gupy"`
  - `"analisador de curriculo ia"`
  - `"como passar no filtro da gupy"`
  - `"score ats curriculo"`

- **Títulos (Máx. 30 caracteres cada)**:
  - `Seu Currículo Passa no ATS?`
  - `Verificador ATS Gratuito`
  - `Analise seu PDF na Hora`
  - `CarreirasMatch | Teste Grátis`
  - `Evite Rejeição nos Filtros`

- **Descrições (Máx. 90 caracteres cada)**:
  - `Descubra se os robôs da Gupy e Sólides conseguem ler seu PDF. Análise 100% gratuita.`
  - `Compare seu currículo com a vaga desejada. Descubra palavras-chave e ajuste antes de enviar.`

- **URL Final**: `https://carreirasmatch.com.br/verificador-ats?utm_source=google&utm_medium=cpc&utm_campaign=busca_ats`

---

## 🎯 3. Kit de Teste de Ângulos por Dor (8 criativos, 1 conjunto de anúncios)

Ao contrário dos criativos A/B acima (que já vendem o "Desafio do Match" como formato),
este kit testa qual **dor** do público converte melhor, mantendo mesma LP e mesma oferta
("Compare seu currículo com uma vaga e descubra o que ajustar antes de enviar").
Rodar os 8 dentro do mesmo conjunto de anúncios (Meta) para o algoritmo distribuir
verba pela dor que mais gera `analysis_started`/`payment_confirmed`, não pela que
tem mais cliques. Ver matriz de decisão e leitura de resultado em
`GROWTH_EXPERIMENTS.md` (experimento 7).

| # | Dor | Headline | CTA | `utm_content` |
| :--- | :--- | :--- | :--- | :--- |
| 1 | "Enviei vários currículos e ninguém respondeu" | Seu currículo pode estar sendo descartado antes de um humano ler. | Descubra por que antes de mandar o próximo. | `dor_sem_resposta` |
| 2 | "Será que meu currículo passa pelo ATS?" | 9 em cada 10 currículos são filtrados antes de chegar ao recrutador. | Teste seu currículo contra o filtro em 2 minutos. | `dor_filtro_ats` (rota: `/verificador-ats`) |
| 3 | "Encontrei uma vaga, mas não sei se meu currículo serve" | Você encontrou a vaga. Agora descubra se está pronto pra ela. | Veja seu % de match antes de se candidatar. | `dor_match_vaga` (rota: `/desafio` ou `/analise`) |
| 4 | "Pare de mandar o mesmo currículo para vagas diferentes" | Cada vaga pede uma versão diferente de você. Seu currículo não muda nunca. | Adapte antes de enviar. | `dor_curriculo_generico` |
| 5 | "Quero mudar de área, mas não sei apresentar minha experiência" | Sua experiência serve pra essa área nova. Seu currículo só não mostra isso. | Descubra como reposicionar sua experiência. | `dor_transicao_carreira` |
| 6 | "A vaga pede coisas que eu tenho, mas não sei colocar no currículo" | Você já tem o que a vaga pede. Só não está escrito do jeito certo. | Veja as palavras-chave que faltam no seu. | `dor_keywords_faltando` |
| 7 | "Tenho experiência, mas meu currículo não mostra" | Sua experiência é boa. Seu currículo é que está te vendendo mal. | Veja o que está te derrubando. | `dor_experiencia_invisivel` |
| 8 | Controle / guarda-chuva | Antes de enviar, descubra seu match com a vaga. | Analise grátis antes de se candidatar. | `dor_controle_generico` |

Regras de execução:

- 1 campanha de conversão, 1 conjunto de anúncios amplo com os 8 criativos — não pré-segmentar por idade/interesse além do já definido em `CAMPAIGN_PLAYBOOK_2026.md`.
- Mesma landing page e mesma oferta nos 8, pra isolar a variável "dor".
- Rodar até ter volume mínimo de `analysis_started` por criativo antes de cortar (não cortar só por CTR).

---

## ⚙️ 4. Como Ativar os Pixels de Medição

Adicione as variáveis com seus IDs reais no arquivo `.env` do servidor de produção:

```env
# Meta Pixel (Instagram & Facebook Ads)
NEXT_PUBLIC_META_PIXEL_ID="SEU_ID_DO_PIXEL"

# Google Ads ID
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-SEU_ID_DO_GOOGLE"
```
