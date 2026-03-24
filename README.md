# Gentleman&apos;s Cut - Sistema de Barbería

## Descripción

Aplicación web completa para gestión de barbería con Next.js 16, Supabase y autenticación JWT.

## Características

- **Autenticación**: Login/Register con JWT y redirección por rol
- **Roles**: Admin, Barbero, Cliente
- **Reservas**: Citas con estados Activa/Cancelada, validación de horarios
- **Horarios**: Lunes-Viernes, 8:00-12:00 y 14:00-18:00 (último horario mañana 11:30-12:00)
- **Cancelación**: Cliente (2h antes), Barbero, Admin
- **Diseño**: Tema oscuro premium con acentos dorados

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
│   │   ├── dashboard/         # Dashboard cliente
│   │   ├── citas/              # Citas y nueva cita
│   │   ├── perfil/             # Perfil usuario
│   │   ├── barbero/            # Panel barbero
│   │   ├── admin/              # Panel admin
│   │   └── api/                # Endpoints API
│   │       ├── auth/           # Autenticación
│   │       ├── citas/          # Citas
│   │       ├── barberos/       # Barberos
│   │       └── admin/          # Admin
│   └── lib/                    # Utilidades
│       ├── auth/               # JWT y client auth
│       └── supabase/            # Cliente Supabase
├── supabase/                   # Migraciones SQL
└── .interface-design/          # Sistema de diseño
```

## Ejecutar el Proyecto

```bash
cd barberia
npm run dev
```

Abrir http://localhost:3000

## Tecnologías

- Next.js 16 (App Router)
- Supabase (PostgreSQL)
- JWT para autenticación
- Zod para validación
- CSS inline con tema oscuro

## Estado del Proyecto

### Completado
- ✅ Sistema de autenticación JWT
- ✅ Login/Register con tema oscuro
- ✅ Dashboard cliente, barbero y admin
- ✅ Reservas con estado Activa/Cancelada
- ✅ Validación de horarios (8:00-12:00, 14:00-18:00)
- ✅ Cancelación por cliente (+2h), barbero y admin
- ✅ Filtro por barbero en admin
- ✅ Landing page con diseño profesional
- ✅ Sistema de diseño documentado

### Pendiente
- Mejoras en página de perfil
- Componentes UI reutilizables
- Tests

## Variables de Entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
JWT_SECRET=tu_jwt_secret
```

## Licencia

MIT