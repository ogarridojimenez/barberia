-- Migración: Agregar campos nombre y teléfono a app_users
-- Fecha: 2026-03-24
-- Descripción: Permitir que los usuarios guarden su nombre y teléfono

-- Agregar columnas
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS telefono TEXT;

-- Comentario:
-- - nombre: nombre completo del usuario (opcional)
-- - telefono: número de teléfono (opcional, formato libre)
