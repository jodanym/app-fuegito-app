// Inicia el checkout de suscripcion con Stripe (PRD 8.5).
// La app NUNCA maneja datos de tarjeta: redirige al checkout alojado por Stripe.
//
// ESTADO: enchufable. Si faltan las claves de Stripe en el entorno, avisamos
// con un mensaje claro. Cuando el dueno del negocio configure su cuenta:
//   1) npm install stripe
//   2) poner en .env.local:  STRIPE_SECRET_KEY=...  y  STRIPE_PRICE_ID=...
//   3) descomentar el bloque de creacion de sesion de abajo.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login`, { status: 303 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secret || !priceId) {
    // Stripe todavia no configurado: volvemos con aviso (no rompe la app).
    return NextResponse.redirect(`${origin}/padres/suscripcion?stripe=falta`, {
      status: 303,
    });
  }

  // --- Cuando Stripe este configurado, descomentar: ---
  // const Stripe = (await import("stripe")).default;
  // const stripe = new Stripe(secret);
  // const session = await stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   line_items: [{ price: priceId, quantity: 1 }],
  //   customer_email: user.email ?? undefined,
  //   success_url: `${origin}/padres/suscripcion?stripe=ok`,
  //   cancel_url: `${origin}/padres/suscripcion?stripe=cancelado`,
  // });
  // return NextResponse.redirect(session.url!, { status: 303 });

  return NextResponse.redirect(`${origin}/padres/suscripcion?stripe=falta`, {
    status: 303,
  });
}
