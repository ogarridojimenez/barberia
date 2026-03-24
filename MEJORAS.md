# MEJORAS PENDIENTES — Barbería App

## Estado actual: Implementando mejoras críticas

---

## CRÍTICO (Fase 1 — Implementando)

| # | Problema | Ubicación | Estado |
|---|----------|-----------|--------|
| CR-1 | Tokens JWT filtrados en archivos commiteados | cookies.txt en historial | ✅ Rotando secret |
| CR-2 | JWT Secret débil: `un_secreto_largo_y_seguro` | .env.local:4 | ✅ Generando nuevo |
| CR-3 | Sin validación server-side de 2h para cancelar | api/citas/[id]/route.ts | ⏳ Pendiente |
| CR-4 | Service role key en todas las rutas (sin RLS) | Todas las API routes | 📋 Planificar |
| CR-5 | Bug double-booking: enum `'pendiente'` no existe | api/barberos/[id]/horarios | ⏳ Pendiente |

## ALTO (Fase 2)

| # | Problema | Ubicación | Estado |
|---|----------|-----------|--------|
| AL-6 | Sin protección CSRF | Login cookie | ⏳ Pendiente |
| AL-7 | Stats admin carga todo en memoria | api/admin/stats | ⏳ Pendiente |
| AL-8 | Sin paginación en listados | Todos los endpoints | 📋 Planificar |
| AL-9 | Dashboard cliente con datos falsos | dashboard/page.tsx | 📋 Planificar |
| AL-10 | Sin estado "completada" | supabase/008 | 📋 Planificar |
| AL-11 | Auth boilerplate repetido (19 archivos) | Todas las API routes | 📋 Planificar |
| AL-12 | Zero tests para API routes | src/__tests__/ | 📋 Planificar |
| AL-13 | Sin tests E2E para reservas | e2e/ | 📋 Planificar |

## MEDIO (Fase 3)

| # | Problema | Ubicación | Estado |
|---|----------|-----------|--------|
| ME-14 | Error details expuestos en catch blocks | Todas las API routes | ⏳ Pendiente |
| ME-15 | JWT expira en 7 días sin revocación | lib/auth/jwt.ts | ⏳ Pendiente |
| ME-16 | Sin componentes UI reutilizables | src/components/ | 📋 Planificar |
| ME-17 | Sin diseño responsive | Todas las páginas | 📋 Planificar |
| ME-18 | CSS inconsistente (variables vs hardcoded) | Múltiples páginas | ⏳ Pendiente |
| ME-19 | Login form sin `<form>` element | login/login-form.tsx | ⏳ Pendiente |
| ME-20 | Sin políticas RLS en Supabase | Todas las tablas | 📋 Planificar |
| ME-21 | Sin constraint unique para doble reserva | supabase/005 | 📋 Planificar |
| ME-22 | estadoMap/roleMap/logout duplicados | 3+ archivos | ⏳ Pendiente |
| ME-23 | Sin loading skeletons | Todas las páginas | 📋 Planificar |
| ME-24 | Perfil sin campos nombre/teléfono | perfil/page.tsx | 📋 Planificar |
| ME-25 | DELETE hard en vez de soft delete | admin/barberos, servicios | ⏳ Pendiente |

## BAJO (Backlog)

| # | Problema | Ubicación | Estado |
|---|----------|-----------|--------|
| BA-26 | Directorios vacíos sin usar | src/components/, src/lib/db/ | 📋 Planificar |
| BA-27 | Sin accesibilidad (ARIA) | Todas las páginas | 📋 Planificar |
| BA-28 | Sin notificaciones por email | N/A | 📋 Planificar |
| BA-29 | Imagen externa Unsplash en landing | page.tsx | 📋 Planificar |
| BA-30 | Sin tests de componentes | src/__tests__/ | 📋 Planificar |
| BA-31 | Sin ilustraciones en estados vacíos | Múltiples páginas | 📋 Planificar |
| BA-32 | Sin CHECK constraints en DB | supabase/*.sql | 📋 Planificar |
