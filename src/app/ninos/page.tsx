// Eleccion de nino activo (un padre puede tener varios hijos, PRD 5.6).
// Al elegir uno se guarda como "nino activo" y se va al mapa.
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { seleccionarNino } from "@/app/actions/ninos";

export default async function NinosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ninos } = await supabase
    .from("children")
    .select("id, apodo, edad, paquete")
    .order("created_at");

  const lista = ninos ?? [];

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="mx-auto max-w-sm">
        <h1 className="text-center text-2xl font-extrabold text-orange-600">
          ¿Quién juega hoy?
        </h1>
        <p className="mb-6 mt-1 text-center text-sm text-gray-500">
          Elige un perfil o crea uno nuevo.
        </p>

        <div className="space-y-3">
          {lista.map((n) => (
            <form key={n.id} action={seleccionarNino.bind(null, n.id)}>
              <button
                type="submit"
                className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 shadow transition hover:shadow-lg active:scale-[0.99]"
              >
                <span className="text-lg font-bold text-gray-800">{n.apodo}</span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                  {n.edad} años · {n.paquete}
                </span>
              </button>
            </form>
          ))}

          {lista.length === 0 && (
            <p className="text-center text-sm text-gray-400">
              Aún no hay perfiles. Crea el primero.
            </p>
          )}
        </div>

        <Link
          href="/onboarding"
          className="mt-6 block rounded-2xl border-2 border-dashed border-orange-300 px-5 py-4 text-center font-semibold text-orange-600 transition hover:bg-orange-100"
        >
          + Crear nuevo perfil
        </Link>

        <div className="mt-8 text-center">
          <Link href="/padres" className="text-sm text-gray-400 underline">
            Zona de adultos 🔒
          </Link>
        </div>
      </div>
    </main>
  );
}
