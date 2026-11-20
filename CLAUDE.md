# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (project uses bun.lockb but npm also works)
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

There is no test suite configured. `npx tsc -p tsconfig.app.json --noEmit` typechecks (the build does not).

## Architecture

This is iPackage (repo `condo-order-hub`), a SaaS for package tracking in Brazilian condominiums, built with Vite + React + TypeScript. The UI is **entirely in Brazilian Portuguese**. The data model follows the MySQL Workbench model (`Condominio`, `Casa`, `Morador`, `Morador_Casa`, `Usuario`, `Encomenda`, `Precificacao`, `Faturamento`).

**Two data modes, chosen at build time** by `VITE_USE_MOCKS` in `src/config.ts` (default `true`, see `.env.example`):
- **Mock** (`true`): a mock database in the browser. `src/data/mockData.ts` builds the seed (`createMockDb`, dates relative to now; every sample password is `123456`), `src/data/store.tsx` (`StoreProvider`/`useStore`) holds it in state and persists it to `localStorage` (`ipackage-mock-db`; bump `MOCK_DB_VERSION` when the shape changes). "Restaurar dados de exemplo" in the user menu resets it.
- **API** (`false`): the `orders-app` backend at `VITE_API_URL` (with or without `/api/v1`; `API_BASE` normalizes it). Contract in `docs/backend-handoff.md`. `src/lib/api.ts` is the only HTTP client: cookie session (`credentials: 'include'`), always sends `X-Requested-With: ipackage` (CSRF), throws `ApiError { status, code, message, fields }` with a pt-BR message ready for a toast (`errorMessage(err)`). Session-lost codes (401 `UNAUTHENTICATED`, 403 `USER_INACTIVE`/`CONDOMINIUM_INACTIVE`/`PASSWORD_CHANGE_REQUIRED`) fire a window event the `AuthContext` listens to.
- `uploadFile(dataUrl, purpose)` (`src/data/upload.ts`) returns `{ key, url }`: send `key` as `photoUrl`/`signatureUrl`, show `url` (signed, 15 min). In mock mode both are the data URL.

**Auth** (`src/contexts/AuthContext.tsx`): login by **matrícula + senha**. Mock: checks `store.users`, session = matrícula in `localStorage` (`ipackage-session`). API: `POST /auth/login`, `GET /me` on load (`refresh()`), `POST /auth/logout`; the query cache is cleared on login/logout. `login`, `logout` and `changePassword` are async. Users created by a manager/owner get a temporary password and `mustChangePassword: true`; `App.tsx` renders `ChangePassword` before anything else until they set their own.

**Profiles** (`src/types/user.ts`, `src/hooks/usePermissions.ts`): `doorman` (Porteiro), `manager` (Responsável), `admin` (Administrador do condomínio), `owner` (dono do iPackage, `condominiumId: null`). Always use `usePermissions()` — never check `user.profile` in components.

**Data hooks** — each has a mock and an API implementation with the same shape (`PortariaData` / `AdminDataApi` in `src/contexts/dataTypes.ts`); `useData`/`useAdminData` pick one by `USE_MOCKS`:
- `useData()` (`src/contexts/DataContext.tsx` mock, `src/contexts/apiData.ts` API) — everything of the logged user's condominium: `isLoading`, `packages` (as `PackageView`: status, code and names resolved), `residents`, `units`, `users` (empty for doormen: the API only lists them to manager/admin), and actions (`addPackage`, `registerPickup`, `deletePackage(id, reason)`, `saveResident`, `addUser`, `resetUserPassword`…).
- `useAdminData()` (`src/contexts/AdminData.ts` mock, `src/contexts/apiAdminData.ts` API) — owner area: condominiums (`AdminCondominium` with `unitCount`/`currentPlanId`), plans, invoices. Plan/invoice rules (`planStatus`, `invoiceStatus`, `invoiceDueDate`, `suggestPlan`) live in `src/lib/billing.ts`.
- **All actions are async** and throw on failure: pages `await` them, show `toast.error(errorMessage(err))`, and only close the dialog on success. Dialogs take `onSave: (...) => Promise<void>` and disable the submit button while it runs. Show `<LoadingState />` while `isLoading`.
- API mode uses TanStack Query (client configured in `App.tsx`: 30 s stale time, no retry on 4xx, one toast on load failure). Query keys include the condominium id (`['portaria', cid, 'packages']`); packages refetch every 60 s and are fetched page by page (200 per page).

**Domain rules worth knowing**:
- A resident can live in several units (`ResidentUnit` = Morador_Casa). Units are created when a resident is saved (`ensureUnit`). Removing a unit from a resident ends the link (`endedAt`) when packages point to it.
- A package points to a `residentUnitId` (fk_id_morador_casa); `receivedBy`/`deliveredBy` are matrículas. Status is derived: `collectedAt` set = retirada.
- Soft delete everywhere (`deletedAt`): residents and packages disappear from lists but stay in history. Users are only inactivated.
- Invoices are due on day 10 of the month after the competence. "Gerar cobranças do mês" creates one per active condominium using its current plan or the smallest active plan that fits its unit count.

**Routing** (`src/App.tsx`): owner → `/admin/condominios`, `/admin/planos`, `/admin/faturamento`, `/account`. Everyone else → `/` (packages), `/packages/new`, `/packages/:id/pickup`, `/residents`, `/users` (manager/admin), `/account`.

**Pages** (`src/pages/`): `Index` (pending/collected tabs, period filter, search), `RegisterPackage`, `RegisterPickup`, `Residents`, `Users`, `Account`, `ChangePassword`, `Login`, `admin/AdminCondominiums`, `admin/AdminPlans`, `admin/AdminBilling`.

**Components** (`src/components/`): `Header` (app bar, nav by profile, theme switch), `Logo` (`Wordmark` = symbol + name, `LogoMark` = symbol only), `PageHeader`, `SearchInput`, `FilterTabs`, `EmptyState`, `FormField`, `MoneyInput`, `StatusBadge`, `OptionGroup`, `SignaturePad`, `PackageCard`, `PackageDetailsModal`, `ResidentCard`, `ResidentDialog`, `UserCard`, `UserDialog`, `TemporaryPasswordDialog`, `ChangePasswordForm`, `admin/CondominiumDialog`, `admin/PlanDialog`. shadcn/ui primitives in `src/components/ui/`.

**Types** (`src/types/`): `user`, `condominium`, `unit`, `resident`, `package`, `billing`, `auth`. UI labels in `src/lib/labels.ts`; formatting in `src/lib/format.ts` (`formatUnit`, `unitCode`, `formatWhen`, `formatBRL`, `maskPhone`, `slugify`…); `src/lib/image.ts` compresses photos before upload.

**Path alias**: `@/` maps to `src/` — use it for all imports.

**Dev-mode gotcha**: `lovable-tagger` (enabled only in `vite --mode development`) rewrites JSX and breaks on generic type arguments in tags (`<OptionGroup<PackageKind> …>` → "Expected jsx identifier"). Never pass generics in JSX; type the props instead (e.g. `const OPTIONS: OptionGroupOption<PackageKind>[]`). `npm run build` does not run the tagger, so it won't catch this — check with `npm run dev`.

**Styling**: iPackage design system on Tailwind CSS + shadcn/ui. Tokens in `src/index.css` (HSL CSS variables, light `:root` and `.dark`; theme via `next-themes`, default = system) and `tailwind.config.ts`; reference docs, component guidelines and reference screens in `docs/design-system/`. Before any UI change, use the `ipackage-ui` skill (`.claude/skills/ipackage-ui/`, copy kept in `docs/design-system/claude-skill/`). Never use hardcoded colors (`bg-blue-600`, hex) — only tokens like `bg-primary`, `text-muted-foreground`, `bg-pendente`. The one exception is the logo in `src/components/Logo.tsx`, whose brand colors are fixed hex on purpose; brand files (SVG/PNG) and usage rules are in `docs/design-system/brand/` and the "Logotipo" section of the design-system README.

## Adding a new entity

1. Add a type in `src/types/<entity>.ts` mirroring the database table (keep `createdAt`/`updatedAt`/`deletedAt`).
2. Add it to `MockDb` + seed in `src/data/mockData.ts` and bump `MOCK_DB_VERSION`.
3. Expose it and its actions from `useData()` (condominium scope) or `useAdminData()` (owner scope).
4. Create the page in `src/pages/` and its card/dialog components; add the route in `src/App.tsx` (and to the `Header` nav if needed).
