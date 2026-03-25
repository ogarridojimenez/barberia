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
│   ├── perfil/        # User profile (nombre, teléfono)
│   ├── login/         # Login form
│   └── register/      # Registration form
├── components/
│   └── ui/            # Reusable components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       ├── Select.tsx
│       └── Skeleton.tsx
├── lib/
│   ├── auth/
│   │   ├── jwt.ts           # JWT utils (server)
│   │   ├── client.ts        # Client helpers
│   │   └── middleware.ts    # withAuth() wrapper
│   ├── supabase/            # Three Supabase clients
│   ├── api-errors.ts        # internalError() helper
│   ├── constants.ts         # estadoCitaMap, roleMap, horarios
│   └── rate-limit.ts        # Upstash Redis rate limiting
├── __tests__/               # Vitest unit tests
└── middleware.ts             # Route protection + role enforcement
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
- Use `@/components/ui` for reusable components

### API Routes
- Pattern: validate → auth check → business logic → return JSON
- Use `withAuth()` wrapper to reduce boilerplate
- Error responses: `{ error: "CODE", message?: string }` with appropriate HTTP status
- Structured error codes: `MISSING_TOKEN`, `INVALID_TOKEN`, `FORBIDDEN`, `INVALID_INPUT`, `DB_ERROR`

### Auth Pattern (Preferred - using withAuth wrapper)
```typescript
import { withAuth } from "@/lib/auth/middleware";

export const GET = withAuth(async (req, ctx, payload) => {
  // payload is verified JWT with role
  return NextResponse.json({ data: "ok" });
}, { requireAdmin: true }); // Options: requireAdmin, requireBarbero, roles: ["admin", "barbero"]
```

### Auth Pattern (Manual - for special cases)
```typescript
import { getTokenFromRequest, verifyAuthToken, verifyAdminRole } from "@/lib/auth/jwt";

const token = getTokenFromRequest(req);
if (!token) return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 401 });

const payload = await verifyAuthToken(token);
if (!payload) return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });

if (!verifyAdminRole(payload)) {
  return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
}
```

### Safe Error Handling
```typescript
import { internalError } from "@/lib/api-errors";

try {
  // ... logic
} catch (err) {
  return internalError(err); // Generic message in production, details in dev
}
```

### Naming
- Files: kebab-case (`login-form.tsx`, `rate-limit.ts`)
- Components: PascalCase (`AdminDashboard`)
- Database: snake_case (`app_users`, `user_role`, `created_at`)
- API routes: Spanish for user-facing strings, English for error codes

## UI Components

Available in `@/components/ui`:

```typescript
import { Button, Card, Modal, Input, Badge, Select, Skeleton } from "@/components/ui";

// Button - 4 variants: primary, secondary, danger, ghost
<Button variant="primary" size="md" loading={isLoading}>Guardar</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>Contenido</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

// Modal
<Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Título">
  Contenido del modal
</Modal>

// Input
<Input label="Email" type="email" error={error} />

// Badge - 5 variants: default, success, warning, error, info
<Badge variant="success">Activo</Badge>

// Select
<Select label="Barbero" options={[{ value: "1", label: "Carlos" }]} />

// Skeleton loading
<Skeleton width="100%" height={44} />
<SkeletonCard />
<SkeletonTable rows={5} />
```

## Testing

- Unit tests in `src/__tests__/`, use Vitest + `describe`/`it`/`expect`
- E2E tests in `e2e/`, use Playwright
- Mock server-only modules via `__mocks__/server-only.ts`
- Mock `withAuth` in tests by mocking `@/lib/auth/middleware`
- Test files excluded from build via vitest.config.ts `exclude`

## Database

### Cita Estados
- `activa`: Pending appointment
- `cancelada`: Cancelled
- `completada`: Completed (admin/barbero only)

### Unique Constraint (prevents double booking)
```sql
CREATE UNIQUE INDEX idx_citas_unique_slot 
  ON citas (barbero_id, fecha, hora_inicio) 
  WHERE estado = 'activa';
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (generate: `openssl rand -base64 48`)

## Migrations

Located in `supabase/`. Run in order:
- `001-008`: Base schema
- `009_add_completada_estado.sql`: Add "completada" to enum
- `010_rls_policies.sql`: RLS policies (prepared, not active)
- `011_unique_cita_slot.sql`: Prevent double booking
- `012_add_nombre_telefono.sql`: Profile fields
