import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function mustGetEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta variable de entorno requerida: ${name}`);
  }
  return value;
}

export function createSupabaseServerClient() {
  const supabaseUrl = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // En Next.js 16 `cookies()` puede tiparse como async en algunos contextos.
        // @supabase/ssr permite que `get` devuelva Promise.
        return cookies().then((cookieStore) => cookieStore.get(name)?.value);
      },
      set(name: string, value: string, options: CookieOptions) {
        // Next cookies API acepta un objeto con opciones (path, maxAge, secure, etc.).
        return cookies().then((cookieStore) => {
          // `ReadonlyRequestCookies` no expone `set` en tipos, pero en runtime
          // en contextos server actions sí existe. Usamos type assertion segura.
          const writableStore = cookieStore as unknown as {
            set: (cookie: { name: string; value: string } & CookieOptions) => void;
          };
          writableStore.set({ name, value, ...options });
        });
      },
      remove(name: string) {
        return cookies().then((cookieStore) => {
          const writableStore = cookieStore as unknown as {
            delete: (cookieName: string) => void;
          };
          writableStore.delete(name);
        });
      },
    },
  });
}

