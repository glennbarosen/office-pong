FROM node:24-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml package.json ./

# corepack honours the packageManager pin in package.json; `npm i -g pnpm`
# would silently install a different version. It needs package.json in place.
RUN corepack enable && corepack prepare --activate

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
