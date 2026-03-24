ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'cliente';
