# AGENTS.md

Guidance for AI coding agents working in this repository.

## Build & Test Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Unit tests (Vitest)
npm run test         # Run all tests once
npm run test:watch   # Watch mode
npx vitest run src/__tests__/jwt.test.ts  # Single test file

# E2E tests (Playwright)
npx playwright test                    # Run all E2E tests
npx playwright test e2e/login.spec.ts  # Single E2E file
```

## Architecture

Next.js 15.3.3 App Router + Supabase + JWT auth. Three Supabase clients:

- `@/lib/supabase/admin` — Service role, bypasses RLS (server-only)
- `@/lib/supabase/server` — SSR with cookie sessions
- `@/lib/supabase/browser` — Client-side operations

Auth uses httpOnly cookies (`session_token`). API routes call `getTokenFromRequest(req)` which checks Bearer header then cookie.

## Project Structure

```
src/
├── app/
│   ├── api/           # Route handlers (GET/POST/PUT/DELETE)
│   ├── admin/         # Admin pages (role: admin)
│   ├── barbero/       # Barber pages (role: barbero)
│   ├── dashboard/     # Client dashboard
│   ├── citas/         # Appointments (list + new)
│   ├── perfil/        # User profile
│   ├── login/         # Login form + server action
│   └── register/      # Registration form
├── lib/
│   ├── auth/          # JWT utils (server) + client helpers
│   ├── supabase/      # Three Supabase clients
│   └── rate-limit.ts  # Upstash Redis rate limiting
├── __tests__/         # Vitest unit tests
└── middleware.ts       # Route protection + role enforcement
```

## Code Style

### Imports
- Path alias: `@/*` → `./src/*`
- Group order: (1) `next/*`, (2) React, (3) third-party, (4) `@/lib/*`, (5) `@/components/*`
- Server-only files: add `import "server-only"` at top
- Named exports preferred for lib utilities

### TypeScript
- Strict mode enabled
- Explicit return types on exported functions
- `type` for data shapes, `interface` for component props
- Zod schemas for runtime validation at API boundaries

### Components
- `"use client"` directive for client components (forms, interactive pages)
- Server components by default — only add `"use client"` when needed
- Inline styles common (dark theme: `#18181B` bg, `#D4AF37` gold accent)

### API Routes
- Pattern: validate → auth check → business logic → return JSON
- Error responses: `{ error: "CODE", details?: string }` with appropriate HTTP status
- Structured error codes: `MISSING_TOKEN`, `INVALID_TOKEN`, `FORBIDDEN`, `INVALID_INPUT`, `DB_ERROR`, `INTERNAL_ERROR`

### Auth Pattern (all protected API routes)
```typescript
const token = getTokenFromRequest(req);
if (!token) return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 401 });

const payload = await verifyAuthToken(token);
if (!payload) return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });

// For admin-only routes:
if (!verifyAdminRole(payload)) {
  return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
}
```

### Naming
- Files: kebab-case (`login-form.tsx`, `rate-limit.ts`)
- Components: PascalCase (`AdminDashboard`)
- Database: snake_case (`app_users`, `user_role`, `created_at`)
- API routes: Spanish for user-facing strings, English for error codes

## Testing

- Unit tests in `src/__tests__/`, use Vitest + `describe`/`it`/`expect`
- E2E tests in `e2e/`, use Playwright
- Mock server-only modules via `__mocks__/server-only.ts`
- Test files excluded from build via vitest.config.ts `exclude`

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
