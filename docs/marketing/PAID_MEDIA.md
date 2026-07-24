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

## Infraestrutura de Rastreamento (Meta Pixel, LinkedIn Insight Tag, Google Ads)

A infraestrutura de mensuração de anúncios foi implementada de forma modular e opt-in:

- **Meta Pixel (Instagram/Facebook)**: Habilitado ao definir `NEXT_PUBLIC_META_PIXEL_ID`. Dispara eventos padrão (`CompleteRegistration`, `Lead`, `InitiateCheckout`, `Purchase`).
- **LinkedIn Insight Tag**: Habilitado ao definir `NEXT_PUBLIC_LINKEDIN_PARTNER_ID`.
- **Google Ads / GA4**: Habilitado ao definir `NEXT_PUBLIC_GOOGLE_ADS_ID`.
- **Componente centralizado**: `src/components/marketing-pixels.tsx` (carregado no `RootLayout`).
- **Mapeamento de eventos**: `src/lib/analytics.ts` canaliza todas as chamadas de `track(ANALYTICS_EVENTS.*)` para os pixels ativos.
- **Playbook de Campanhas**: Consulte `CAMPAIGN_PLAYBOOK_2026.md` para regras de UTMs e públicos.

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
