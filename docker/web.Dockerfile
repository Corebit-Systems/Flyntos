FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
COPY packages/search-contracts/package.json packages/search-contracts/
COPY packages/provider-sdk/package.json packages/provider-sdk/
COPY packages/seo-engine/package.json packages/seo-engine/
COPY packages/i18n/package.json packages/i18n/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --filter @flyntos/web... --no-frozen-lockfile
COPY . .
RUN pnpm --filter @flyntos/web build
CMD ["pnpm", "--filter", "@flyntos/web", "start"]

