# Modelo de Datos - Barbería

## Diagrama de Entidades y Relaciones

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BARBERÍA DATA MODEL                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐     ┌─────────────────────────────────────────┐
│           app_users             │     │              barberos                  │
├─────────────────────────────────┤     ├─────────────────────────────────────────┤
│ id              UUID (PK)       │     │ id                  UUID (PK)          │
│ email           TEXT (unique)  │     │ nombre              TEXT                │
│ password_hash   TEXT             │────▶│ user_id             UUID (FK) ────────┼──┐
│ user_role       USER_ROLE enum  │     │ especialidad         TEXT               │  │
│ nombre          TEXT             │     │ telefono            TEXT                │  │
│ apellidos       TEXT             │     │ foto_url            TEXT                │  │
│ telefono        TEXT             │     │ activo              BOOLEAN             │  │
│ foto_url        TEXT             │     │ created_at          TIMESTAMP            │  │
│ especialidad    TEXT             │     │ horario_atencion    JSONB               │  │
│ created_at      TIMESTAMP        │◀─── │                     ▲                  │  │
│ updated_at      TIMESTAMP        │     │                     │ FK                │  │
└─────────────────────────────────┘     │                     └──────────────────┘  │
                      ▲                  └─────────────────────────────────────────┘
                      │ FK
        ┌─────────────┴───────────────┐
        │                             │
        ▼                             ▼
┌─────────────────────┐     ┌─────────────────────┐
│        citas        │     │      servicios       │
├─────────────────────┤     ├─────────────────────┤
│ id                  │     │ id                  │
│ usuario_id (FK) ────│────▶│ nombre              │
│ barbero_id (FK) ────│────▶│ descripcion         │
│ servicio_id (FK) ───│────▶│ duracion_minutos    │
│ fecha               │     │ precio              │
│ hora_inicio         │     │ activo              │
│ hora_fin            │     │ created_at          │
│ estado (enum)       │     └─────────────────────┘
│ notas               │
│ created_at          │     ┌─────────────────────┐
│ updated_at          │     │ horarios_disponibles│
└─────────────────────┘     ├─────────────────────┤
        │                   │ id                  │
        │ FK                │ barbero_id (FK) ─────│──▶
        ▼                   │ fecha               │
┌─────────────────────┐     │ hora_inicio         │
│                     │     │ hora_fin            │
│                     │     │ disponible          │
│                     │     │ cita_id (FK) ───────│──▶
│                     │     │ created_at          │
└─────────────────────┘     └─────────────────────┘
```

## Relaciones

| Tabla 1       | Relación | Tabla 2              | Descripción                           |
|---------------|----------|----------------------|---------------------------------------|
| app_users     | →        | barberos             | 1:1 via user_id                       |
| app_users     | →        | citas                | 1:N (usuario_id)                       |
| barberos      | →        | citas                | 1:N (barbero_id)                       |
| servicios     | →        | citas                | 1:N (servicio_id)                     |
| barberos      | →        | horarios_disponibles | 1:N (barbero_id)                       |
| citas         | →        | horarios_disponibles | 1:N (cita_id)                          |

## Enum Valores

### user_role
- `admin` - Administrador con acceso completo al panel de admin
- `barbero` - Barbero que atiende citas y gestiona su perfil
- `cliente` - Cliente que puede reservar citas

### estado (citas)
- `activa` - Cita pendiente/progamada
- `cancelada` - Cita cancelada
- `completada` - Cita completada (solo admin/barbero pueden marcar)

## Notas Importantes

1. **Usuarios centralizados**: Todas las entidades de usuario (admin, barbero, cliente) están almacenadas en `app_users`. No hay tablas separadas para cada rol.

2. **Tabla barberos**: Existe para compatibilidad histórica. Los datos principales del barbero están en `app_users` (especialidad, foto, teléfono). La relación es via `user_id`.

3. **Soft delete**: 
   - `barberos.activo` - para desactivar un barbero sin eliminar
   - `servicios.activo` - para desactivar un servicio sin eliminar
   - `citas.estado` - para cambiar estado de una cita

4. **Campos de app_users**:
   - `nombre`, `apellidos`, `telefono`, `foto_url` - datos del perfil
   - `especialidad` - solo para role='barbero' (corte, barba, etc.)
   - `user_role` - determina permisos y acceso

## Índices Útiles

```sql
-- Prevenir doble reserva en el mismo horario
CREATE UNIQUE INDEX idx_citas_unique_slot 
  ON citas (barbero_id, fecha, hora_inicio) 
  WHERE estado = 'activa';
```

## Migraciones Relacionadas

- `012_add_nombre_telefono.sql` - Agrega campos de perfil
- `013_add_especialidad.sql` - Agrega especialidad a app_users
- `014_add_user_id_to_barberos.sql` - Agrega FK a barberos
