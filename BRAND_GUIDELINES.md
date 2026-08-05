# Diretrizes de marca — CarreirasMatch

Documento de referência para manter consistência visual e de voz em todo o produto (app, landing, e-mails, blog, dashboards). Baseado no que já está implementado no código (`src/app/globals.css`, `src/components/brand-logo.tsx`, `src/lib/seo.ts`).

## 1. Posicionamento

CarreirasMatch é o copiloto da carreira inteira: acompanha desde a escolha profissional e os estudos até a candidatura, a entrevista, a recolocação e a evolução de carreira, não só a comparação de currículo com vaga. A análise de currículo x vaga continua sendo a porta de entrada mais forte do produto, mas é o primeiro passo de uma jornada mais longa, não o produto inteiro. Tom: direto, prático, orientado a resultado, nunca "fofo" ou institucional, é uma ferramenta de trabalho.

## 2. Logo

- Wordmark: `public/logos/wordmark-light.png` (fundo claro) e `wordmark-dark.png` (fundo escuro/dark mode).
- Ícone/símbolo: `icon-light.png`, `icon-dark.png`, `icon-transparent.png`.
- Componentes prontos: `BrandLogo` (troca sozinho entre light/dark via `dark:` do Tailwind) e `BrandMark` (só o ícone, `rounded-[22%]`).
- Use `BrandLogo onDark` em fundos coloridos/escuros fora do dark mode automático (ex.: hero com gradiente).
- Não distorcer proporção, não recolorir o wordmark, manter a área de respiro (mínimo = altura do próprio símbolo ao redor).

## 3. Paleta de cores

Paleta oficial, definida em `globals.css`:

| Nome | Hex | Uso |
|---|---|---|
| Azul Profundo | `#071827` | texto/fundo dark, contraste máximo |
| Azul Principal | `#2563EB` | cor de ação/marca (accent, links, CTAs) |
| Azul Principal (hover) | `#1D4ED8` | estado hover do azul principal |
| Verde Avanço | `#22C55E` | sucesso, progresso, aprovação |
| Amarelo Atenção | `#F59E0B` | alerta leve, destaque secundário |
| Vermelho Alerta | `#EF4444` | erro, risco, ação destrutiva |
| Branco Gelo | `#F8FAFC` | fundo claro / texto em dark |
| Cinza Texto | `#64748B` | texto secundário/muted |

Regras:
- Azul Principal é a cor de ação. Não usar amarelo ou verde como CTA primário.
- Verde = positivo/avanço (score bom, aprovação). Vermelho = risco/erro. Amarelo = atenção pontual, nunca erro grave.
- Gradiente de marca (usado em título/destaques): `#2563EB → #60A5FA → #F59E0B` (classe `.text-gradient-brand`).
- Dark mode é opt-in via `[data-theme="dark"]` no `<html>` (não segue o SO automaticamente) — sempre testar os dois temas ao criar UI nova.

## 4. Tipografia

- Texto/corpo: **Inter** (`--font-inter` → `--font-sans`).
- Títulos (`h1`–`h6`): **Manrope** (`--font-title`), aplicado globalmente — não precisa setar manualmente em novos componentes.
- Ambas via `next/font/google`, carregadas em `src/app/layout.tsx`.

## 5. Estilo visual / UI

- Cards: `.card-premium` — fundo `--surface`, borda sutil, sombra leve em camadas, eleva no hover (`translateY(-2px)`), estilo "SaaS premium" (referência: Linear/Vercel), não skeuomórfico.
- Cantos: arredondados generosos (`rounded-xl`/`rounded-2xl`, `1rem`–`1.25rem`).
- Sombras: sempre baseadas em `rgba(7, 24, 39, ...)` (o Azul Profundo), nunca preto puro.
- Movimento: **sóbrio de propósito**. Float, aurora e shine do hero foram desativados intencionalmente (ver `[[home-hero-sober-motion]]` na memória do projeto) — não reativar como "polish". Está ok: fade-in/slide-up de entrada, reveal on-scroll, ring de progresso do score, glow estático (sem pulsar) em destaques de plano. Está proibido: brilho varrendo botão em loop, cards flutuando, aurora animada.
- Sempre respeitar `prefers-reduced-motion: reduce` (já implementado globalmente — manter esse padrão em qualquer animação nova).

## 6. Voz e copy

- **Nunca usar travessão (—)** em telas ou e-mails. Trocar por vírgula ou dois-pontos. Essa regra é reforçada até por código (`DashSanitizer` no layout).
- Tom direto e prático, sem jargão corporativo vazio. Fala com quem está buscando emprego/vaga: objetivo, sem enrolação, sem infantilizar.
- Evitar promessas absolutas ("você vai conseguir a vaga"); falar em termos de aderência, preparo e chance real.
- pt-BR, locale `pt_BR` (ver `openGraph.locale` em `layout.tsx`).

## 7. Nome e menções

- Nome oficial: **CarreirasMatch** (uma palavra só, C e M maiúsculos). Não usar "Carreiras Match" com espaço nem "carreirasmatch" minúsculo em texto corrido.
- `SITE_NAME` é a fonte da verdade para o nome em metadata/SEO (`src/lib/seo.ts`).

## 8. Onde isso vive no código

- Paleta e temas: `src/app/globals.css`
- Logo: `src/components/brand-logo.tsx`, assets em `public/logos/`
- Fontes: `src/app/layout.tsx`
- SEO/nome/OG: `src/lib/seo.ts`
- Sanitização de travessão no copy: `src/components/dash-sanitizer.tsx`
