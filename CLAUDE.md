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

There is no test suite configured.

## Architecture

This is a condominium management SPA (condo-order-hub) built with Vite + React + TypeScript. The UI is **entirely in Brazilian Portuguese**.

**Routing** (`src/App.tsx`): React Router v6 with three protected routes (`/`, `/residents`, `/doormen`). Auth guard lives in `AppContent` — if `user` is null, `<Login />` is rendered unconditionally before any route is evaluated. `/doormen` requires `requiredRole="admin"` via `ProtectedRoute`.

**Auth** (`src/contexts/AuthContext.tsx`): Fully mocked — credentials are hardcoded arrays in the file itself. Session is persisted to `localStorage`. Two roles: `admin` and `doorman`. Each user belongs to a `condominiumId` that scopes the data they see.

**Permissions** (`src/hooks/usePermissions.ts`): Central hook that derives `canManageResidents`, `canDeletePackages`, and `canAccessDoormen` from the current user's role. Always use this hook — never check `user.role` directly in components.

**Data layer**: There is no backend. All entity data (packages, residents, doormen) lives as `useState` initialized from local `mockXxx` arrays inside each page component. TanStack Query is set up as a provider in `App.tsx` but is not yet used for data fetching.

**Pages** (`src/pages/`):
- `Index.tsx` — Package dashboard: list, filter by status (received/collected), search, add/update/delete packages
- `Residents.tsx` — Resident management (admin-only write operations)
- `Doormen.tsx` — Doorman management (admin-only)

**Components** (`src/components/`): Feature components follow a consistent pattern per entity — `<Entity>Card`, `<Entity>DetailsModal`, `AddEntityForm`. Shared components: `Header`, `StatsCards`, `FilterTabs`, `DataTable`, `DatePicker`. All shadcn/ui primitives are in `src/components/ui/`.

**Types** (`src/types/`): One file per entity — `auth.ts`, `package.ts`, `resident.ts`, `doorman.ts`.

**Path alias**: `@/` maps to `src/` — use it for all imports.

**Styling**: Tailwind CSS with shadcn/ui (slate base color, CSS variables). Config in `tailwind.config.ts`, CSS variables in `src/index.css`.

## Adding a new entity

Follow the existing pattern:
1. Add a type interface in `src/types/<entity>.ts`
2. Create page in `src/pages/<Entity>.tsx` with local `useState` mock data
3. Create `<Entity>Card`, `<Entity>DetailsModal`, `Add<Entity>Form` components
4. Add a protected route in `src/App.tsx`
