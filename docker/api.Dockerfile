FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
COPY packages/search-contracts/package.json packages/search-contracts/
COPY packages/provider-sdk/package.json packages/provider-sdk/
RUN pnpm install --filter @flyntos/api... --no-frozen-lockfile
COPY . .
RUN pnpm --filter @flyntos/api build
CMD ["pnpm", "--filter", "@flyntos/api", "start"]

