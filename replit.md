# EngHub

A full-stack engineering projects showcase platform where students and engineers share academic and personal projects, browse submissions by course/difficulty, upvote favorites, and leave comments. Built for academic communities to discover and celebrate engineering work.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/enghub run dev` — run the React frontend (port 23429)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — rebuild lib declarations (run this after changing lib/db or lib/api-spec)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Wouter routing, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (jsonwebtoken + bcryptjs), stored in localStorage on the client
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users, projects, comments)
- `artifacts/api-server/src/routes/` — Express route handlers (users, projects, comments, stats)
- `artifacts/enghub/src/` — React frontend (pages, components, hooks)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — generated Zod validation schemas (do not edit)

## Architecture decisions

- **JWT auth, not sessions**: Token stored in localStorage, passed as Bearer header. The custom fetch in `lib/api-client-react/src/custom-fetch.ts` reads it automatically.
- **OpenAPI-first**: All API contracts live in `openapi.yaml`. Never hand-write types that codegen produces. After spec changes, run codegen then `typecheck:libs`.
- **`type: number` not `type: integer` in OpenAPI spec**: Orval v8.23+ generates `zod.int()` for integer fields which is Zod v4 syntax. The api-zod lib imports from the v3 path, so use `number` instead.
- **`zod/v4` in lib/db, `zod` (v3) in api-zod**: The db package uses `zod/v4` for drizzle-zod schemas; the generated api-zod schemas import from `zod` (v3 compat path). Don't mix them.

## Product

- **Home** (`/`): Hero with platform stats, trending projects grid, course breakdown chart
- **Browse** (`/projects`): Filterable/searchable project list (by course, difficulty, cost level, search term; sort by newest or upvotes)
- **Project detail** (`/projects/:id`): Full project info, upvote button, comments section
- **Submit** (`/submit`): Form to create a new project (requires login)
- **Login** (`/login`) / **Register** (`/register`)

## User preferences

_Populate as you build._

## Gotchas

- After changing `lib/db/src/schema/` or `lib/api-spec/openapi.yaml`, always run `pnpm run typecheck:libs` before typechecking artifact packages or the leaf checks will see stale declarations.
- The `getUserIdFromRequest` helper in `artifacts/api-server/src/routes/users.ts` is imported by other route files — don't remove it.
- Seed users use `password123` as their password (bcrypt hash in the DB).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
