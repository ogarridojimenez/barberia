-- Asegura que exista la columna `password_hash` en `public.app_users`.
-- Tu registro falla porque Supabase indica que `password_hash` no existe.

alter table public.app_users
add column if not exists password_hash text;

