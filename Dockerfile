# Todos os estágios usam a mesma imagem base (Debian/glibc) do Playwright,
# porque o estágio final precisa do Chromium para o scraper do Indeed
# (src/lib/job-sources/indeed.ts) e módulos nativos (better-sqlite3) compilados
# em outra libc (ex.: Alpine/musl) não rodam nela.
FROM mcr.microsoft.com/playwright:v1.61.1-noble AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM mcr.microsoft.com/playwright:v1.61.1-noble AS prod-deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM mcr.microsoft.com/playwright:v1.61.1-noble AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Variáveis NEXT_PUBLIC_* são embutidas no bundle do cliente em BUILD time.
# Como o .env é dockerignore, elas precisam chegar como build args (passados
# pelo docker-compose a partir do .env da VPS). Sem elas, ficam vazias no
# navegador (Sentry client inerte, chave do Mercado Pago ausente no brick).
ARG NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN
ARG NEXT_PUBLIC_PLAUSIBLE_SRC
ENV NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=$NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN=$NEXT_PUBLIC_PLAUSIBLE_DOMAIN \
    NEXT_PUBLIC_PLAUSIBLE_SRC=$NEXT_PUBLIC_PLAUSIBLE_SRC
RUN npx prisma generate
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.61.1-noble AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --chown=pwuser:pwuser --from=prod-deps /app/node_modules ./node_modules
COPY --chown=pwuser:pwuser --from=builder /app/package.json ./package.json
COPY --chown=pwuser:pwuser --from=builder /app/.next ./.next
COPY --chown=pwuser:pwuser --from=builder /app/public ./public
COPY --chown=pwuser:pwuser --from=builder /app/prisma ./prisma
COPY --chown=pwuser:pwuser --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --chown=pwuser:pwuser --from=builder /app/next.config.ts ./next.config.ts
COPY --chown=pwuser:pwuser docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && mkdir -p /app/data && chown pwuser:pwuser /app/data

USER pwuser
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
