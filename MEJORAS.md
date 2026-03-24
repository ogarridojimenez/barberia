# MEJORAS PENDIENTES — Barbería App

## Estado actual: Fase 1 completada ✅

---

## ✅ COMPLETADO (Fase 1)

| # | Problema | Solución implementada |
|---|----------|----------------------|
| CR-1 | Tokens JWT filtrados | JWT_SECRET rotado a clave criptográfica de 64 chars |
| CR-2 | JWT Secret débil | Generado con `openssl rand -base64 48` |
| CR-3 | Sin validación 2h cancelar | Server-side check: `diffHoras < 2 && role !== "admin"` |
| CR-5 | Bug double-booking | Enum corregido: `["activa"]` en horarios |
| AL-6 | Sin protección CSRF | Cookie `sameSite: "strict"` |
| AL-7 | Stats carga todo en memoria | `limit(1000)` agregado |
| ME-14 | Error details expuestos | Helper `internalError()` en src/lib/api-errors.ts |
| ME-15 | JWT 7 días | Reducido a 1 día |
| ME-19 | Login sin `<form>` | `<form onSubmit>` con `type="submit"` |
| ME-22 | Constantes duplicadas | Archivo src/lib/constants.ts creado |
| ME-25 | DELETE hard | Soft delete: `activo = false` |

---

## SIGUIENTES MEJORAS (Prioridad)

### Fase 2 — Funcionalidad rota (ALTO)

| # | Problema | Impacto | Esfuerzo |
|---|----------|---------|----------|
| **AL-9** | Dashboard cliente muestra datos falsos hardcodeados | HIGH | Medio |
| **AL-10** | No existe estado "completada" para citas (revenue siempre $0) | HIGH | Medio |
| **AL-11** | Auth boilerplate repetido en 19 archivos API | Medio | Medio |

### Fase 3 — DRY y Tests (ALTO)

| # | Problema | Impacto | Esfuerzo |
|---|----------|---------|----------|
| **AL-12** | Zero tests unitarios para API routes | HIGH | Grande |
| **AL-13** | Sin tests E2E para flujo de reservas | HIGH | Medio |

### Fase 4 — Arquitectura (MEDIO)

| # | Problema | Impacto | Esfuerzo |
|---|----------|---------|----------|
| **ME-16** | Sin componentes UI reutilizables | Medio | Grande |
| **ME-20** | Sin políticas RLS en Supabase | HIGH | Grande |
| **ME-21** | Sin constraint unique para doble reserva | Medio | Pequeño |

### Fase 5 — UX (MEDIO-BAJO)

| # | Problema | Impacto | Esfuerzo |
|---|----------|---------|----------|
| **ME-17** | Sin diseño responsive | Medio | Grande |
| **ME-23** | Sin loading skeletons | Medio | Medio |
| **ME-24** | Perfil sin nombre/teléfono | Medio | Medio |

### Backlog (BAJO)

| # | Problema |
|---|----------|
| BA-26 | Directorios vacíos sin usar |
| BA-27 | Sin accesibilidad (ARIA) |
| BA-28 | Sin notificaciones email |
| BA-29 | Imagen Unsplash externa |
| BA-30 | Sin tests de componentes |
| BA-31 | Sin ilustraciones en vacíos |
| BA-32 | Sin CHECK constraints DB |
