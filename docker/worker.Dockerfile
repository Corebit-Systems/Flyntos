FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/worker/package.json apps/worker/
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --filter @flyntos/worker... --no-frozen-lockfile
COPY . .
RUN pnpm --filter @flyntos/worker build
CMD ["pnpm", "--filter", "@flyntos/worker", "start"]
