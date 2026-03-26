# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Build for production (recommended)
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests (Vitest)
npm run test:watch   # Run tests in watch mode
```

### Run Single Test
```bash
npx vitest run src/__tests__/jwt.test.ts
```

### E2E Tests (Playwright)
```bash
npx playwright test                                    # All tests
npx playwright test e2e/login.spec.ts                  # Single file
npx playwright test --grep "Create User"              # Tests matching pattern
```

**E2E test files:**
- `e2e/admin-users.spec.ts` - Admin user management (create, edit, delete, filters)
- `e2e/admin.spec.ts` - Admin dashboard
- `e2e/auth.spec.ts` - Authentication flows
- `e2e/barber.spec.ts` - Barber functionality
- `e2e/login.spec.ts` - Login page
- `e2e/register.spec.ts` - Registration page
- `e2e/appointments.spec.ts` - Appointment booking

**E2E Setup:** Uses `e2e/global-setup.ts` for auth state. Tests use `storageState: ".auth/admin.json"` for admin authentication.

## Project Overview

A barbershop management application built with Next.js 15.3.3, React, TypeScript, and Supabase. Uses JWT-based authentication with bcrypt password hashing. Three roles: Admin, Barbero (barber), Cliente (client).

All users (including barbers) are stored in `app_users` table with these additional fields:
- **Admin users**: Full access to admin panel
- **Barbero users**: Have `especialidad` field, profile with photo, manage their appointments
- **Cliente users**: Can book appointments, view their dashboard

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
│   │   │   ├── barberos/route.ts # CRUD barberos
│   │   │   ├── barberos/[id]/route.ts # PUT/DELETE barbero (hard delete)
│   │   │   ├── servicios/route.ts # CRUD servicios
│   │   │   ├── servicios/[id]/route.ts # PUT/DELETE servicio (hard delete)
│   │   │   ├── usuarios/route.ts  # GET users with filters (search by email/name, filter by role)
│   │   │   └── usuarios/create/route.ts # POST create user
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
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── citas/page.ts         # Manage appointments
│   │   ├── barberos/page.ts      # Manage barbers (create/edit with photo upload)
│   │   ├── servicios/page.ts     # Manage services
│   │   └── usuarios/page.ts       # Manage users (create/change role/delete)
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
│       ├── Modal.tsx              # Modal with optional onClose, scroll support
│       ├── Input.tsx              # Input with label/error, autocomplete fix
│       ├── Badge.tsx              # 5 variants
│       ├── Select.tsx             # Select with label
│       ├── Skeleton.tsx           # Loading skeletons
│       ├── PasswordStrength.tsx   # Password strength indicator
│       └── Pagination.tsx         # Pagination controls
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

**app_users**: id, email, password_hash, user_role, nombre, apellidos, telefono, foto_url, especialidad, created_at, updated_at
**barberos**: id, nombre, especialidad, telefono, foto_url, activo, user_id (FK to app_users)
**servicios**: id, nombre, descripcion, duracion_minutos, precio, activo
**citas**: id, usuario_id, barbero_id, servicio_id, fecha, hora_inicio, hora_fin, estado, notas
**horarios_disponibles**: id, barbero_id, fecha, hora_inicio, hora_fin, disponible, cita_id

**Note**: Barberos are primarily stored in `app_users` with role "barbero". The `barberos` table exists for backwards compatibility but all user data (including specialty) is now stored in `app_users.especialidad`.

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
- `013_add_especialidad.sql`: Add especialidad field to app_users
- `014_add_user_id_to_barberos.sql`: Add user_id FK to barberos table

### Recent Changes

- **Hard delete**: Servicios and barberos now use hard delete (DELETE from DB) instead of soft delete. Checks for related active appointments before allowing delete.
- **Admin usuarios**: Filter by email or name, show user photo and name in list. Barberos show their specialty from `barberos` table via `user_id` relation.
- **Admin modals**: All admin create/edit modals have scroll (`maxHeight: "70vh"`). Create user modal doesn't close with X, only Cancel button or successful creation.

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

## Admin User Management Features

### Admin Usuarios Page (`/admin/usuarios`)
- **List**: Shows all users with photo, name, email, role badge, and registration date
- **Search**: Filter by email or nombre
- **Filter by role**: Filter by Admin, Barbero, or Cliente
- **Create user**: Modal with fields (nombre, apellidos, email, password, telefono, rol, especialidad for barberos). Password strength indicator included.
- **Change role**: Modal to change user role (admin cannot change their own role)
- **Delete user**: Confirmation modal before deletion (admin cannot delete themselves)
- **Pagination**: 20 users per page

### Admin Barberos Page (`/admin/barberos`)
- **List**: Shows barberos with photo, name, specialty, phone, and status
- **Create/Edit**: Modal with file upload for photo (drag & drop style)
- **Toggle active**: Soft deactivate/reactivate barbers
- **Delete**: Hard delete (checks for related active appointments first)

### Admin Servicios Page (`/admin/servicios`)
- **List**: Shows services with name, description, duration, price, status
- **Create/Edit**: Modal with service details
- **Toggle active**: Soft deactivate/reactivate
- **Delete**: Hard delete (checks for related active appointments first)
