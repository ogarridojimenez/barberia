# Gentleman's Cut - Sistema de Barbería

## Descripción

Aplicación web completa para gestión de barbería con Next.js 15.3.3, Supabase y autenticación JWT.

## Características

- **Autenticación**: Login/Register con JWT y redirección por rol
- **Roles**: Admin, Barbero, Cliente
- **Reservas**: Citas con estados Activa/Cancelada/Completada, validación de horarios
- **Horarios**: Lunes-Viernes, 8:00-12:00 y 14:00-18:00 (último horario mañana 11:30-12:00)
- **Cancelación**: Cliente (2h antes), Barbero, Admin
- **Completar**: Admin/Barbero pueden marcar citas como completadas
- **Diseño**: Tema oscuro premium con acentos dorados, responsive
- **Seguridad**: JWT, CSRF protection, RLS policies, role-based access

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@barberia.com | admin123 |
| Barbero | barbero@barberia.com | barbero123 |
| Cliente | cliente@test.com | password123 |

## Estructura del Proyecto

```
barberia/
├── src/
│   ├── app/                    # Páginas Next.js
│   │   ├── login/              # Login
│   │   ├── register/           # Registro
│   │   ├── dashboard/          # Dashboard cliente
│   │   ├── citas/              # Citas y nueva cita
│   │   ├── perfil/             # Perfil usuario (nombre, teléfono)
│   │   ├── barbero/            # Panel barbero
│   │   ├── admin/              # Panel admin
│   │   └── api/                # Endpoints API
│   │       ├── auth/           # Autenticación
│   │       ├── citas/          # Citas
│   │       ├── barberos/       # Barberos
│   │       ├── admin/          # Admin
│   │       ├── dashboard/      # Dashboard stats
│   │       └── me/             # Perfil usuario
│   ├── components/
│   │   └── ui/                 # Componentes reutilizables
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       ├── Select.tsx
│   │       └── Skeleton.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── jwt.ts          # JWT utils (server)
│   │   │   ├── client.ts       # Client auth helpers
│   │   │   └── middleware.ts    # withAuth wrapper
│   │   ├── supabase/           # Supabase clients
│   │   ├── api-errors.ts       # Error helpers
│   │   ├── constants.ts        # Constantes compartidas
│   │   └── rate-limit.ts       # Rate limiting
│   └── __tests__/              # Tests unitarios
├── e2e/                        # Tests E2E (Playwright)
├── supabase/                   # Migraciones SQL
│   ├── 001_app_users.sql
│   ├── 002_add_password_hash_column.sql
│   ├── 003_add_user_role.sql
│   ├── 004_servicios.sql
│   ├── 005_citas.sql
│   ├── 006_horarios_disponibles.sql
│   ├── 007_barberos.sql
│   ├── 008_update_estado_enum.sql
│   ├── 009_add_completada_estado.sql
│   ├── 010_rls_policies.sql
│   ├── 011_unique_cita_slot.sql
│   └── 012_add_nombre_telefono.sql
└── playwright.config.ts        # Config E2E
```

## Ejecutar el Proyecto

```bash
cd barberia
npm install
npm run dev
```

Abrir http://localhost:3000

## Scripts Disponibles

```bash
npm run dev          # Servidor desarrollo
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # ESLint
npm run test         # Tests unitarios (Vitest)
npm run test:watch   # Tests en modo watch
```

## Tests

### Unit Tests (Vitest)
```bash
npm run test                    # Ejecutar todos
npx vitest run src/__tests__/jwt.test.ts  # Archivo específico
```

### E2E Tests (Playwright)
```bash
npx playwright test                    # Ejecutar todos
npx playwright test e2e/login.spec.ts  # Archivo específico
```

**Tests pasando: 50** ✅

## Tecnologías

- Next.js 15.3.3 (App Router)
- Supabase (PostgreSQL)
- JWT (jose) para autenticación
- Zod para validación
- CSS inline con tema oscuro (#18181B, #D4AF37)
- Vitest para unit tests
- Playwright para E2E tests

## Estado del Proyecto

### Fase 1: Seguridad Crítica ✅
- JWT_SECRET criptográficamente seguro
- Cookie sameSite: "strict" (protección CSRF)
- JWT expira en 1 día (antes 7)
- Validación server-side 2h para cancelar
- Fix bug double-booking
- Helper `internalError()` para no exponer detalles

### Fase 2: Funcionalidad ✅
- Dashboard cliente con datos reales
- Estado "completada" para citas
- Revenue calculado de citas completadas
- Wrapper `withAuth()` para reducir boilerplate

### Fase 3: Tests ✅
- 50 tests unitarios pasando
- Tests E2E con Playwright
- Tests para JWT, login, register, middleware, citas

### Fase 4: Arquitectura ✅
- Componentes UI reutilizables (Button, Card, Modal, Input, Badge, Select, Skeleton)
- Políticas RLS en Supabase
- Constraint unique para evitar doble reserva

### Fase 5: UX ✅
- Diseño responsive (tablet/mobile breakpoints)
- Loading skeletons
- Perfil con campos nombre/teléfono

## Variables de Entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
JWT_SECRET=tu_jwt_secret_seguro
# ALLOW_HTTP=true  # Solo para desarrollo local
```

## Mejoras Pendientes

- Tests unitarios adicionales para admin/barbero endpoints
- Implementar paginación en listados
- Componentes UI con Tailwind en lugar de inline styles
- Sistema de notificaciones por email

## Licencia

MIT
