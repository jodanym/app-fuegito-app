// Verifica el enlace magico por TOKEN_HASH. A diferencia del flujo PKCE, este
// funciona ENTRE DISPOSITIVOS (pedir en la compu, abrir en el telefono) y
// resiste el escaneo de enlaces de Gmail. La plantilla de correo de Supabase
// apunta a esta ruta con ?token_hash=...&type=email.
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "email") as EmailOtpType;
  const next = searchParams.get("next") ?? "/ninos";

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si el enlace no es valido, de vuelta al login con aviso.
  return NextResponse.redirect(`${origin}/login?error=enlace_invalido`);
}
