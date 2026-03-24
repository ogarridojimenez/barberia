-- Tabla mínima para el endpoint POST /api/register.
-- (Luego, cuando implementemos RLS, ajustaremos políticas sobre esta tabla.)

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists app_users_email_lower_ux
  on public.app_users (lower(email));

