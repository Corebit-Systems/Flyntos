# Flyntos

Premium multi-locale travel-tech monorepo with a Next.js web app, Fastify API, and worker service.

## Stack

- `apps/web`: Next.js app
- `apps/api`: Fastify API
- `apps/worker`: background worker
- `packages/*`: shared config, contracts, i18n, UI, and provider code

## Requirements

- Node.js 22+
- Corepack enabled
- pnpm `10.6.3`

## Install

From the repo root:

```powershell
corepack enable
corepack pnpm install
```

## Run The Project

### Full local dev stack

Use this when you want web, API, and worker together:

```powershell
corepack pnpm dev
```

Local targets:

- web: `http://127.0.0.1:3000/en`
- api: `http://127.0.0.1:4000/health`

### Web only

Use this when you only need the landing page or frontend:

```powershell
corepack pnpm --filter @flyntos/web dev
```

Open:

```text
http://127.0.0.1:3000/en
```

### Stable browser run from a separate terminal

If the browser shows `ERR_CONNECTION_REFUSED`, the usual reason is that the server process was started in a terminal session that already closed.

For a stable local run on Windows, start the web app in a separate PowerShell window and keep that window open:

```powershell
cd C:\dev\Flyntos\apps\web
node .\node_modules\next\dist\bin\next dev -p 3000
```

If you want production mode instead:

```powershell
cd C:\dev\Flyntos
corepack pnpm --filter @flyntos/web build
cd C:\dev\Flyntos\apps\web
node .\node_modules\next\dist\bin\next start -p 3000
```

Then open:

```text
http://127.0.0.1:3000/en
```

## Useful Commands

```powershell
corepack pnpm build
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm --filter @flyntos/api dev
corepack pnpm --filter @flyntos/worker dev
```

## Troubleshooting

- `ERR_CONNECTION_REFUSED` usually means nothing is listening on port `3000`.
- If port `3000` is already busy, stop the old process before starting a new one.
- Keep the terminal window that started the server open while using the site.
- If the page still shows an old error in Chrome, force refresh with `Ctrl+F5`.
