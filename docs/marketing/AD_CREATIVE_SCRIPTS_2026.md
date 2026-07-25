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

## ⚙️ 3. Como Ativar os Pixels de Medição

Adicione as variáveis com seus IDs reais no arquivo `.env` do servidor de produção:

```env
# Meta Pixel (Instagram & Facebook Ads)
NEXT_PUBLIC_META_PIXEL_ID="SEU_ID_DO_PIXEL"

# Google Ads ID
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-SEU_ID_DO_GOOGLE"
```
