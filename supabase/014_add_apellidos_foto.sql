-- Migración: Agregar campos apellidos y foto_url a app_users
-- Fecha: 2026-03-24
-- Descripción: Permitir que los usuarios registren apellidos y foto de perfil

-- Agregar columnas
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS apellidos TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Comentario:
-- - apellidos: apellidos del usuario (opcional)
-- - foto_url: URL de la foto de perfil (opcional, almacenada en Supabase Storage o URL externa)
