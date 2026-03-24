# Estado del Proyecto - Barbería App

## ✅ Completado

### Autenticación
- Login (`/login`) con tema oscuro premium
- Register (`/register`) 
- JWT con localStorage
- Redirección por rol (admin → /admin, barbero → /barbero, cliente → /dashboard)
- Logout en todas las páginas

### Roles y Permisos
- **Admin**: Panel completo con estadísticas, gestión de usuarios, barberos, servicios, citas
- **Barbero**: Ver sus citas organizadas por fecha, cancelar reservas
- **Cliente**: Ver sus citas activas y canceladas, crear nuevas reservas, cancelar (+2h antes)

### Reservas
- Estados: **Activa** y **Cancelada** (antes: pendiente, confirmada, completada)
- Validación de horarios: Lun-Vie 8:00-12:00 y 14:00-18:00
- Último horario mañana: 11:30-12:00
- No abre domingos ni sábados
- Grid visual de horarios disponibles/ocupados
- Muestra citas ya reservadas del barbero seleccionado

### Diseño
- Tema oscuro (#1a1a1a) con acentos dorados (#D4AF37)
- Sistema de diseño en `.interface-design/system.md`
- Landing page con imagen de fondo de barbería

### Base de Datos
- Tabla `usuarios` con columna `rol`
- Tabla `citas` con enum `cita_estado` (activa, cancelada)
- Tabla `barberos` y `servicios`
- Migraciones en `/supabase/`

## 📋 Pendiente

- Página de perfil (mejoras)
- Componentes UI reutilizables
- Tests

## Credenciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@barberia.com | admin123 |
| Barbero | barbero@barberia.com | barbero123 |
| Cliente | cliente@test.com | password123 |