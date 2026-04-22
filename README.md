# Plotto

> **CONFIDENTIAL — PROPRIETARY & NDA-PROTECTED**
> © 2026. See [`PRODUCT.md`](./PRODUCT.md) for full IP notice.

Your life, plotted out.

## Repo layout

```
apps/
  mobile/         # Expo (iOS + Android)
  web/            # Next.js 15 dashboard
packages/
  schema/         # Zod schemas (source of truth)
  db/             # Drizzle schema + migrations
  ai/             # Claude prompts + extraction
  ui-tokens/      # Shared design tokens
  tsconfig/       # Shared TypeScript config
supabase/         # Edge functions + migrations
```

## Required tooling

- Node.js 20+ (see `.nvmrc`)
- pnpm 10+
- Expo CLI (via `npx expo`)
- Supabase CLI
- EAS CLI
- Vercel CLI
- Git

## Getting started

```bash
pnpm install
cp .env.example .env.local  # then fill in real values

pnpm dev:mobile   # Expo dev server
pnpm dev:web      # Next.js on http://localhost:3000
```

## Documentation

- [`PRODUCT.md`](./PRODUCT.md) — product definition + IP notice
- [`PLAN.md`](./PLAN.md) — master phased build plan + live status
- [`CLAUDE.md`](./CLAUDE.md) — agent operating instructions
