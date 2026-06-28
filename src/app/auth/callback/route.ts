// Recibe al padre cuando hace clic en el enlace magico del correo.
// Intercambia el "code" por una sesion (cookies) y lo manda al dashboard.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/ninos";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si algo falla, de vuelta al login.
  return NextResponse.redirect(`${origin}/login?error=enlace_invalido`);
}
