# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests (Vitest)
npm run test:watch   # Run tests in watch mode
```

### Run Single Test
```bash
npx vitest run src/__tests__/jwt.test.ts
```

### E2E Tests
```bash
npx playwright test                    # All tests
npx playwright test e2e/login.spec.ts  # Single file
```

## Project Overview

A barbershop management application built with Next.js 15.3.3, React, TypeScript, and Supabase. Uses JWT-based authentication with bcrypt password hashing. Three roles: Admin, Barbero (barber), Cliente (client).

## Architecture

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts     # POST login with JWT
│   │   │   ├── register/route.ts  # POST register user
│   │   │   └── logout/route.ts    # POST logout
│   │   ├── citas/
│   │   │   ├── route.ts           # GET/POST citas
│   │   │   └── [id]/route.ts      # PUT update cita status
│   │   ├── admin/
│   │   │   ├── stats/route.ts     # GET admin dashboard stats
│   │   │   ├── citas/route.ts     # GET all citas
│   │   │   ├── barberos/route.ts  # CRUD barberos
│   │   │   ├── servicios/route.ts # CRUD servicios
│   │   │   └── usuarios/route.ts  # Manage user roles
│   │   ├── barberos/
│   │   │   ├── route.ts           # GET active barbers
│   │   │   ├── citas/route.ts     # GET barber's citas
│   │   │   └── [id]/horarios/     # GET available slots
│   │   ├── dashboard/
│   │   │   └── stats/route.ts     # GET client stats
│   │   └── me/
│   │       ├── route.ts           # GET/PUT user profile
│   │       └── password/route.ts  # PUT change password
│   ├── admin/                     # Admin pages
│   ├── barbero/                   # Barber page
│   ├── dashboard/                 # Client dashboard
│   ├── citas/                     # Appointments pages
│   ├── perfil/                    # User profile
│   ├── login/                     # Login page
│   └── register/                  # Register page
├── components/
│   └── ui/                        # Reusable components
│       ├── Button.tsx             # 4 variants, 3 sizes
│       ├── Card.tsx               # Card with header/footer
│       ├── Modal.tsx              # Modal with overlay
│       ├── Input.tsx              # Input with label/error
│       ├── Badge.tsx              # 5 variants
│       ├── Select.tsx             # Select with label
│       └── Skeleton.tsx           # Loading skeletons
├── lib/
│   ├── auth/
│   │   ├── jwt.ts                 # JWT sign/verify, role helpers
│   │   ├── client.ts              # Client auth (apiGet, fetchApi)
│   │   └── middleware.ts          # withAuth() wrapper
│   ├── supabase/
│   │   ├── admin.ts               # Service role client (server-only)
│   │   ├── server.ts              # SSR client
│   │   └── browser.ts             # Browser client
│   ├── api-errors.ts              # internalError(), dbError() helpers
│   ├── constants.ts               # estadoCitaMap, roleMap, horarios
│   └── rate-limit.ts              # Upstash Redis rate limiting
└── __tests__/                     # Vitest unit tests
```

### Key Patterns

**Auth wrapper** (reduces boilerplate):
```typescript
import { withAuth } from "@/lib/auth/middleware";

export const GET = withAuth(async (req, ctx, payload) => {
  // payload is verified JWT
  return NextResponse.json({ data: "ok" });
}, { requireAdmin: true }); // Optional: requireAdmin, requireBarbero
```

**Get token from request** (checks header then cookie):
```typescript
import { getTokenFromRequest } from "@/lib/auth/jwt";

const token = getTokenFromRequest(req);
```

**Safe error responses** (no details in production):
```typescript
import { internalError } from "@/lib/api-errors";

catch (err) {
  return internalError(err);
}
```

**API response pattern**:
```typescript
// Success
return NextResponse.json({ data });

// Error
return NextResponse.json({ error: "ERROR_CODE", message: "..." }, { status: 400 });
```

### Database Schema

**app_users**: id, email, password_hash, nombre, telefono, user_role, created_at
**barberos**: id, nombre, especialidad, telefono, foto_url, activo
**servicios**: id, nombre, descripcion, duracion_minutos, precio, activo
**citas**: id, usuario_id, barbero_id, servicio_id, fecha, hora_inicio, hora_fin, estado, notas
**horarios_disponibles**: id, barbero_id, fecha, hora_inicio, hora_fin, disponible, cita_id

### Cita Estados

- `activa`: Cita pendiente
- `cancelada`: Cita cancelada
- `completada`: Cita completada (solo admin/barbero pueden marcar)

### Migrations

Located in `supabase/`:
- `001-008`: Base schema
- `009_add_completada_estado.sql`: Adds "completada" to enum
- `010_rls_policies.sql`: RLS policies (prepared but not active)
- `011_unique_cita_slot.sql`: Unique index to prevent double booking
- `012_add_nombre_telefono.sql`: Profile fields

## Code Style

- **Path alias**: `@/*` → `./src/*`
- **Server-only**: Files with `"server-only"` import
- **Components**: "use client" only when needed
- **Inline styles**: Dark theme (#18181B bg, #D4AF37 gold accent)
- **Error codes**: English (MISSING_TOKEN, FORBIDDEN), user messages: Spanish

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (generate with `openssl rand -base64 48`)

## Dependencies

- `jose` for JWT (not jsonwebtoken)
- `bcryptjs` for password hashing
- `zod` for validation
- `tailwindcss` v4 with `@import "tailwindcss"`
- `vitest` for unit tests
- `@playwright/test` for E2E tests
