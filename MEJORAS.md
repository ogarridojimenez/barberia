# PLAN DE PROPUESTAS DE MEJORAS — Barbería App

## Última actualización: 2026-03-24
## Revisión: Senior Developer (20+ años de experiencia)
## Enfoque: Optimización, Rendimiento y Usabilidad

---

## Estado Actual

✅ **Completado:**
- Fase 1: Seguridad Crítica
- Fase 2: Funcionalidad
- Fase 3: Tests (50 pasando)
- Fase 4: Arquitectura (Componentes UI)
- Fase 5: UX (Responsive, Skeletons, Perfil)
- Mejoras de Impacto Medio (Paginación)
- Mejoras de Impacto Bajo (ARIA, Empty States, CHECK constraints)
- Registro con nombre, apellidos y foto

---

## 🔴 CRÍTICO (Implementar Inmediatamente)

| # | Problema | Ubicación | Solución | Impacto | Esfuerzo |
|---|----------|-----------|----------|---------|----------|
| C-1 | **Race Condition en Booking** - Dos requests simultáneos pueden reservar el mismo horario (TOCTOU) | `src/app/api/citas/route.ts` L109-124 | Atrapar error de unique constraint en insert y retornar error amigable | Integridad datos | Bajo |
| C-2 | **Admin Stats OOM** - Carga TODAS las citas completadas en memoria para calcular revenue | `src/app/api/admin/stats/route.ts` | Crear función SQL que calcule revenue directamente en DB | Performance | Medio |
| C-3 | **Bcrypt Rounds Insuficiente** - Hardcoded a 10, producción requiere 12+ | `src/app/api/auth/register/route.ts` | Variable de entorno `BCRYPT_ROUNDS` con default 12 | Seguridad | Bajo |
| C-4 | **Sin Validación Longitud Inputs** - String fields sin `.max()` permite DoS con payloads gigantes | `src/app/api/me/route.ts`, `register/route.ts` | Agregar `.max(255)` a todos los campos string | Seguridad/Performance | Bajo |

---

## 🟠 ALTO (Próximo Sprint)

| # | Problema | Ubicación | Solución | Impacto | Esfuerzo |
|---|----------|-----------|----------|---------|----------|
| A-1 | **Índice DB Faltante** - No existe índice compuesto `(estado, fecha)` para query más común | `supabase/` | `CREATE INDEX idx_citas_estado_fecha ON citas(estado, fecha);` | Performance queries | Bajo |
| A-2 | **Rate Limiting Falla sin Redis** - Cuando Redis está caído, NO hay rate limiting | `src/lib/rate-limit.ts` | Fallback a rate limiting en memoria | Seguridad | Medio |
| A-3 | **Citas Completadas No Visibles** - Usuarios solo ven activas/canceladas, no historial | `src/app/citas/page.tsx` | Agregar sección "Historial" con citas completadas | Usabilidad | Bajo |
| A-4 | **Error Handling Inconsistente** - Algunos endpoints exponen `err.message` al cliente | Todos los endpoints | Usar `internalError()` uniformemente | Seguridad | Bajo |
| A-5 | **Paginación en Citas GET** - Endpoint `/api/citas` retorna TODAS sin paginación | `src/app/api/citas/route.ts` | Agregar parámetros `page` y `limit` | Performance | Medio |

---

## 🟡 MEDIO (Sprints Siguientes)

| # | Problema | Ubicación | Solución | Impacto | Esfuerzo |
|---|----------|-----------|----------|---------|----------|
| M-1 | **Caching para Datos Estáticos** - Servicios y barberos se consultan en cada request | `src/app/api/servicios/`, `barberos/` | Headers de cache o `unstable_cache` de Next.js | Performance | Bajo |
| M-2 | **Loading States en Formularios** - Formulario de reservas no muestra loading al enviar | `src/app/citas/nueva/page.tsx` | Agregar spinner y deshabilitar botón durante submit | Usabilidad | Bajo |
| M-3 | **Indicador Fortaleza Contraseña** - Usuario no ve requisitos hasta que falla | `src/app/register/page.tsx` | Indicador en tiempo real | Usabilidad | Bajo |
| M-4 | **Tablas No Responsive en Mobile** - Tablas admin no scrollean horizontalmente | `src/app/admin/*/page.tsx` | Wrapper con scroll horizontal o cards en mobile | Usabilidad | Medio |
| M-5 | **Deduplicación de Requests** - Múltiples llamadas a misma API sin deduplicación | Todos los clientes | Considerar SWR o React Query | Performance | Medio |

---

## 🟢 BAJO (Backlog)

| # | Problema | Solución | Impacto |
|---|----------|----------|---------|
| B-1 | Sistema de Mensajes de Error Unificado | Crear archivo de constantes para mensajes | i18n |
| B-2 | Tests de Integración | Agregar Vitest + Playwright E2E | Mantenibilidad |
| B-3 | Accesibilidad en Tablas | Agregar `aria-label` a botones de acción | Accesibilidad |
| B-4 | Validación Email Desechable | Librería de validación o verificación por email | Seguridad |
| B-5 | Lazy Loading de Imágenes | `next/image` con `loading="lazy"` | Performance |
| B-6 | Code Splitting por Ruta | Dynamic imports para páginas pesadas | Performance |

---

## 📊 Resumen por Categoría

| Categoría | Cantidad | Prioridad |
|-----------|----------|-----------|
| Crítico | 4 | Implementar YA |
| Alto | 5 | Próximo sprint |
| Medio | 5 | Sprints siguientes |
| Bajo | 6 | Backlog |

**Total: 20 mejoras identificadas**

---

## 🎯 Top 3 Acciones Inmediatas

1. **C-1: Fix Race Condition** - Integridad de datos comprometida
2. **C-2: Fix Admin Stats OOM** - Explotará en producción con datos reales
3. **C-3: Bcrypt 12+ rounds** - Seguridad básica del hashing

---

## 📈 Métricas Actuales del Proyecto

| Métrica | Valor |
|---------|-------|
| Tests pasando | 50 ✅ |
| Componentes UI | 10 |
| Migraciones SQL | 14 |
| API Endpoints | 18 |
| Páginas | 12 |

---

## 📝 Notas de la Revisión Senior

1. **Arquitectura sólida**: Buena separación de concerns, uso correcto de Supabase clients
2. **Autenticación bien implementada**: JWT con httpOnly cookies, roles bien definidos
3. **Pendiente crítico**: Race condition en booking debe resolverse antes de producción
4. **Performance**: Admin stats necesita función SQL para escalar
5. **Testing**: 50 tests es buen inicio, pero falta cobertura en API routes
