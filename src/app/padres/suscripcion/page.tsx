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
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-sm">
        <Link href="/padres" className="text-sm text-gray-400 underline">
          ← Volver al panel
        </Link>

        <h1 className="mt-4 text-2xl font-extrabold text-gray-800">Tu plan</h1>

        {stripe === "falta" && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            Los pagos aún no están conectados. Falta configurar Stripe (claves del
            adulto dueño del negocio). El código ya está listo para enchufarlo.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {/* Plan gratis */}
          <div className={`rounded-2xl border-2 p-5 ${tier === "free" ? "border-orange-400 bg-white" : "border-gray-200 bg-white"}`}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-800">Gratis</p>
              {tier === "free" && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                  Plan actual
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              <li>• Onboarding y perfilado</li>
              <li>• 5 lecciones por día</li>
              <li>• 1 perfil de niño</li>
            </ul>
          </div>

          {/* Plan premium */}
          <div className={`rounded-2xl border-2 p-5 ${tier === "premium" ? "border-orange-400 bg-white" : "border-gray-200 bg-white"}`}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-800">Premium ✨</p>
              {tier === "premium" && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                  Plan actual
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              <li>• Todo el contenido, sin límite diario</li>
              <li>• Todos los modos de cada lección</li>
              <li>• Varios niños y reportes para padres</li>
            </ul>

            {tier !== "premium" && (
              <form action="/api/stripe/checkout" method="post" className="mt-4">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600"
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
