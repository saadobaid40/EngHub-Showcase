---
name: Vite pnpm monorepo React + proxy setup
description: Two fixes required after moving a Vite app to a new directory inside a pnpm workspace — duplicate React and API proxy routing.
---

## Problem 1 — Duplicate React ("Invalid hook call")

In a pnpm monorepo, moving a Vite app to a new directory (e.g. `artifacts/enghub/` → `client/`) can cause a "You might have more than one copy of React" error even when `resolve.dedupe` is set. Root cause: `@tanstack/react-query` (and other peer-dep packages) resolve `react` through pnpm's virtual store symlinks, bypassing Vite's dedupe.

**Fix** (both required together):
```ts
// client/vite.config.ts
resolve: {
  alias: [
    { find: 'react', replacement: path.resolve(import.meta.dirname, 'node_modules/react') },
    { find: 'react-dom', replacement: path.resolve(import.meta.dirname, 'node_modules/react-dom') },
    // ...other aliases
  ],
  dedupe: ['react', 'react-dom'],
},
optimizeDeps: {
  include: ['react', 'react-dom', '@tanstack/react-query'],
},
```

**Why:** `resolve.alias` with absolute paths forces ALL react imports (including from pnpm virtual store packages) to resolve to the same physical copy. `optimizeDeps.include` ensures Vite pre-bundles react-query alongside the pinned React.

## Problem 2 — API proxy (Replit path-based router not reliable)

After restructuring, `curl http://localhost:80/api/projects` returned Vite's HTML instead of JSON. The Replit path-based proxy (mapping `/api` to the api-server artifact port) was not reliably forwarding requests when the artifact directory changed.

**Fix** — add Vite's built-in proxy:
```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
},
```

**Why:** Vite's `server.proxy` runs at the dev server level and reliably forwards `/api/*` to the Express server regardless of how Replit's path router is configured. This also makes the configuration explicit and portable.

**How to apply:** Any time you move a Vite + Express pnpm workspace app, add both the react alias fix and the API proxy. Do not rely solely on Replit's artifact path routing for API calls in dev.
