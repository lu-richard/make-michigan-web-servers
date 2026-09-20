# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Make Michigan (M3 / "Michigan Maker Map") is a monorepo with two independently deployed apps that share one Supabase-hosted Postgres database:

- `frontend/` — React 19 + TypeScript + Vite SPA.
- `backend/` — Django + Django REST Framework API (`make_michigan_rest_api` project, `core` app).

## Commands

### Frontend (run from `frontend/`)

- `npm run dev` — start the Vite dev server.
- `npm run build` — type-check (`tsc -b`) then production build.
- `npm run lint` / `npm run lint:fix` — ESLint (flat config in `eslint.config.js`).
- `npm run format` — Prettier write (`.prettierrc.json`: single quotes, no semicolon-breaking trailing commas, printWidth 180).
- `npm run preview` — preview the production build.
- There is no test runner/framework configured in the frontend; don't assume Jest/Vitest exist.

### Backend (run from `backend/`, using the checked-in `.venv`)

- `python manage.py runserver` — run the API locally (needs `backend/.env` with `SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `DEFAULT_THROTTLE_ANON`, `DEFAULT_THROTTLE_USER`).
- `python manage.py test` — run tests; single test: `python manage.py test core.tests.<TestClass>.<test_method>`. Note `core/tests.py` is currently an empty stub.
- `python manage.py inspectdb` — regenerate models from the live DB schema (see Architecture below before touching `core/models.py` by hand).

### Full stack via Docker

- `docker-compose up --build` — builds and runs both containers. `frontend` (Apache) is published on port 80 and reverse-proxies `/api/` to the internal `backend` (Apache + mod_wsgi) container on port 80. Each service reads its own `.env` file (`backend/.env`, `frontend/.env`), which are not committed.

## Architecture

### Two data-access paths to the same database

The frontend talks to data in two different ways, and both end up hitting the same Supabase Postgres instance:

1. **Supabase JS client** (`frontend/src/lib/supabase.ts`) — used directly for auth (`supabase.auth.*`, see `pages/App.tsx`) and for simple, low-traffic table reads (e.g. fetching the signed-in user's own `profiles` row).
2. **Django REST API** (`backend/`) — a separate service that connects to the *same* Postgres database via `DATABASE_URL`/psycopg, and is called from the frontend with plain `fetch()` against `VITE_API_BASE_URL` (e.g. `EquipmentCatalog.tsx`, `MakerspaceCatalog.tsx`, `AdminDashboardUsageStats*.tsx`). This path exists for list/catalog/dashboard views that need DRF's search, filter, ordering, and pagination backends (`django_filters`, `SearchFilter`, `OrderingFilter`, `LimitOffsetPagination`), which are more convenient here than hand-rolling the equivalent PostgREST queries.

When adding a new data-fetching feature, decide which path fits: simple/auth-scoped reads → Supabase client; searchable/filterable/paginated lists → a new DRF endpoint.

### Backend models mirror the Supabase schema — they don't own it

`backend/core/models.py` is auto-generated (originally via `inspectdb`) from the actual Supabase schema and every model is `managed = False`. Django does not create or migrate these tables — the Supabase schema (tables, views, and materialized views like `credential_summary`, `view_equipment_cards`, `view_makerspace_cards`) is the source of truth. If the DB schema changes, `models.py` must be kept in sync by hand (or regenerated); `db_table` values and field names must exactly match the real table/view/column names, per the comment at the top of the file.

Adding a new table/view to the API follows a fixed chain: model in `core/models.py` (`managed=False`, correct `db_table`) → serializer in `core/serializers.py` → `ModelViewSet` in `core/views.py` → `router.register(...)` in `make_michigan_rest_api/urls.py`. All routes are mounted under `/api/`.

Postgres array columns (e.g. `roles`, `themes`) come back through the DRF `ModelSerializer` as stringified `{a,b}` array literals rather than JSON arrays. Several serializers work around this with a `SerializerMethodField` that strips `{}` and splits on `,` (see `ProfileSerializer.get_roles`, `MakerspaceSerializer.get_themes`, `ViewMakerspaceCardsSerializer.get_themes`). Follow the same pattern for any new array field exposed through the API.

### Frontend types are generated from the same schema

`frontend/database.types.ts` is generated from the Supabase schema (Supabase CLI type generation) and is the canonical source for `Tables<...>` types used throughout `frontend/src/types/types.ts`. Regenerate it when the schema changes rather than hand-editing.

### Routing and auth gating

`frontend/src/routes/routes.tsx` defines a nested `react-router-dom` v7 route tree under a single root (`pages/App.tsx`). Two gate components control access:
- `UnauthenticatedRoute` — routes only reachable when signed out (`/signup`, `/signin`).
- `ProtectedRoute` — routes that redirect to `/signin` when there's no profile.

Both read `profile`/`loading` from `AppContext` (`src/context/AppContext.tsx`), which `pages/App.tsx` populates by subscribing to `supabase.auth.onAuthStateChange` and fetching the corresponding `profiles` row.

### Styling and UI libraries

The frontend mixes several UI approaches by area: CSS Modules (`src/styles/*.module.css`) for page/component layout, Tailwind v4 (via `@tailwindcss/vite`), MUI (`@mui/material`, `@mui/x-charts` for admin usage-stats charts), and shadcn/radix-ui primitives under `src/components/ui` (config in `components.json`, style `radix-vega`).

Vite/TS path aliases (`vite.config.ts` and the shadcn aliases in `components.json`): `@`, `@lib`, `@components`, `@pages`, `@types`, `@constants`, `@assets`, `@hooks`, `@utils`, plus shadcn's `@/components`, `@/lib`, `@/components/ui`, `@/hooks`.

### Deployment shape

Both services ship as Apache-based Docker images (`backend/Dockerfile`: `httpd` + `mod_wsgi` serving Django; `frontend/Dockerfile`: multi-stage Node build copied into `httpd`). `frontend/httpd.conf` serves the built SPA with a `FallbackResource /index.html` and reverse-proxies `/api/` to the `backend` service — this is what makes `VITE_API_BASE_URL` resolvable as a same-origin path in production while pointing at a separate container in `docker-compose.yml`.
