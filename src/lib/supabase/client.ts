// Cliente de Supabase para el NAVEGADOR (lado del usuario).
// Se usa en componentes "use client". Lee las claves publicas del .env.local.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Flujo "implicito": el enlace magico trae la sesion en el propio enlace
    // (no requiere el mismo navegador). Permite login ENTRE dispositivos sin
    // personalizar el correo (necesario en el plan gratis de Supabase).
    { auth: { flowType: "implicit" } }
  );
}
