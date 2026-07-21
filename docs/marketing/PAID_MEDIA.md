# Mídia paga

## Estado real: só existe Google AdSense, e é opt-in por env var

O único mecanismo de monetização/mídia via terceiro encontrado no código é o
**Google AdSense**, usado para exibir anúncios dentro do conteúdo próprio
(blog e guias) — não é aquisição paga de usuários, é veiculação de anúncios
de terceiros no site (fonte de receita, não de tráfego).

- `src/lib/adsense.ts`: `ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT`.
  Se a env não estiver definida, tudo vira no-op — "dev fica limpo".
- Slots configuráveis individualmente por env var
  (`ADSENSE_SLOTS.blogArticle`, `.blogList`, `.toolGuide`), cada um só
  renderiza se a env correspondente existir.
- Comentário no próprio código explica a decisão de escopo: "Só existe slot
  para blog e guias: é conteúdo escrito por nós. As listagens de vagas não
  entram porque são agregadas de fontes externas, e anúncio sobre conteúdo
  replicado é risco de suspensão da conta inteira - não só da página."
- `src/components/adsense-script.tsx`: injeta o script oficial do AdSense no
  `<head>`, só quando `ADSENSE_CLIENT` está definido.
- `src/app/ads.txt/route.ts`: serve `/ads.txt` dinamicamente a partir do
  publisher id derivado do client id — retorna 404 se o AdSense não estiver
  configurado (em vez de servir um `ads.txt` estático que poderia apontar
  para a conta errada).

## O que não existe (confirmado por busca no código)

Não foi encontrado no código nenhum indício de:

- **Google Ads / Google Search Ads** (nenhum snippet de conversão, nenhum
  `gtag(` no repositório);
- **Meta Pixel / Facebook Pixel** (nenhum `fbq(`, nenhuma tag do Meta);
- **TikTok Pixel** ou qualquer outro pixel de rede social;
- **Google Analytics (GA4)** (não há `gtag`/`G-XXXX` no código; o único
  analytics ativo é o Plausible + endpoint próprio, ver `GROWTH_METRICS.md`).

Ou seja: hoje o produto **não compra tráfego pago** e **não tem
instrumentação de conversão para nenhuma plataforma de anúncio**. Se uma
campanha paga for lançada, o pixel/tag correspondente ainda precisa ser
implementado do zero — nenhuma parte da integração já existe no código,
mesmo desligada por env var (diferente do AdSense, que já está pronto e só
falta a env).

## Implicação prática

Qualquer decisão de investir em mídia paga (Google Ads, Meta, TikTok)
precisa incluir, como trabalho técnico prévio:

1. decidir e implementar a tag de conversão da plataforma escolhida;
2. mapear os eventos existentes em `ANALYTICS_EVENTS`
   (`src/lib/analytics.ts`) para os eventos de conversão da plataforma
   (ex.: `payment_confirmed` → compra);
3. garantir consentimento de cookies/tags adequado, já que hoje o site só
   carrega o Plausible (sem cookie) e o AdSense (quando habilitado).

## Receita de anúncio hoje

A única receita de mídia é passiva: AdSense em posts de blog e páginas de
guia/ferramenta, condicionada a `NEXT_PUBLIC_ADSENSE_CLIENT` estar
configurado no ambiente de produção. Não há dado de receita de AdSense no
repositório (isso vive no painel do Google AdSense, fora do código).
