import { createBrowserClient } from "@supabase/ssr";

function mustGetEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta variable de entorno requerida: ${name}`);
  }
  return value;
}

export function createSupabaseBrowserClient() {
  const supabaseUrl = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

