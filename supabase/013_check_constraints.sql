-- Migración: CHECK constraints para validación a nivel de DB
-- Fecha: 2026-03-24
-- Descripción: Agregar constraints para asegurar integridad de datos

-- CHECK constraint para precio de servicios (debe ser positivo)
ALTER TABLE servicios ADD CONSTRAINT check_servicios_precio_positivo 
  CHECK (precio >= 0);

-- CHECK constraint para duración de servicios (mínimo 5 minutos)
ALTER TABLE servicios ADD CONSTRAINT check_servicios_duracion_minima 
  CHECK (duracion_minutos >= 5);

-- CHECK constraint para hora_inicio < hora_fin en citas
ALTER TABLE citas ADD CONSTRAINT check_citas_horario_valido 
  CHECK (hora_inicio < hora_fin);

-- CHECK constraint para email formato válido (básico)
ALTER TABLE app_users ADD CONSTRAINT check_users_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Comentario:
-- Estos constraints previenen datos inválidos a nivel de base de datos,
-- complementando las validaciones de la aplicación.
