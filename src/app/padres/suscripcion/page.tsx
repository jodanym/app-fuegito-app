// Suscripcion (PRD 9). Muestra el plan y permite mejorar a Premium.
// El cobro real lo hace Stripe (la app NUNCA toca datos de tarjeta, PRD 8.5).
// Mientras Stripe no este configurado, el boton avisa que falta conectarlo.
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ stripe?: string }>;
}) {
  const { stripe } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("tier, estado")
    .limit(1);
  const tier = subs?.[0]?.tier ?? "free";

  return (
    <main className="min-h-screen bg-papel px-4 py-10">
      <div className="mx-auto max-w-sm">
        <Link href="/padres" className="text-sm text-carbon/45 underline">
          ← Volver al panel
        </Link>

        <h1 className="mt-4 text-2xl font-extrabold text-carbon">Tu plan</h1>

        {stripe === "falta" && (
          <p className="mt-4 rounded-xl bg-chispa/25 p-3 text-sm text-llama">
            Los pagos aún no están conectados. Falta configurar Stripe (claves del
            adulto dueño del negocio). El código ya está listo para enchufarlo.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {/* Plan gratis */}
          <div className={`rounded-2xl border-2 p-5 ${tier === "free" ? "border-fuego bg-white" : "border-humo bg-white"}`}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-carbon">Gratis</p>
              {tier === "free" && (
                <span className="rounded-full bg-chispa/25 px-3 py-1 text-xs font-bold text-llama">
                  Plan actual
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-1 text-sm text-carbon/70">
              <li>• Onboarding y perfilado</li>
              <li>• 5 lecciones por día</li>
              <li>• 1 perfil de niño</li>
            </ul>
          </div>

          {/* Plan premium */}
          <div className={`rounded-2xl border-2 p-5 ${tier === "premium" ? "border-fuego bg-white" : "border-humo bg-white"}`}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-carbon">Premium ✨</p>
              {tier === "premium" && (
                <span className="rounded-full bg-chispa/25 px-3 py-1 text-xs font-bold text-llama">
                  Plan actual
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-1 text-sm text-carbon/70">
              <li>• Todo el contenido, sin límite diario</li>
              <li>• Todos los modos de cada lección</li>
              <li>• Varios niños y reportes para padres</li>
            </ul>

            {tier !== "premium" && (
              <form action="/api/stripe/checkout" method="post" className="mt-4">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-fuego px-4 py-3 font-bold text-white transition hover:bg-llama"
                >
                  Mejorar a Premium
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
