// Cliente de Supabase para el SERVIDOR (Server Components, Route Handlers, etc.).
// Maneja las cookies de sesion para mantener el login del padre de forma segura.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Llamado desde un Server Component: se puede ignorar si hay
            // un middleware refrescando la sesion del usuario.
          }
        },
      },
    }
  );
}
