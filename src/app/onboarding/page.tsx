// Onboarding paso 1: crear el perfil del nino. Solo apodo y edad (PRD 10).
// Requiere que el adulto haya iniciado sesion.
import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { crearNino } from "@/app/actions/ninos";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-papel p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        <Image
          src="/personajes/fueguito.png"
          alt="Fueguito"
          width={96}
          height={96}
          className="mx-auto h-24 w-24 object-contain"
        />
        <h1 className="mt-2 text-center text-2xl font-extrabold text-llama">
          ¿Quién va a aprender?
        </h1>
        <p className="mb-6 mt-1 text-center text-sm text-carbon/60">
          Solo necesitamos un apodo y la edad. Nada más.
        </p>

        <form action={crearNino} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-carbon/70">
              Apodo del peque
            </label>
            <input
              name="apodo"
              required
              maxLength={30}
              placeholder="Ej: Lucas, Estrellita..."
              className="w-full rounded-xl border-2 border-humo px-4 py-3 text-carbon focus:border-fuego focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-carbon/70">
              Edad
            </label>
            <input
              name="edad"
              type="number"
              min={0}
              max={12}
              required
              placeholder="De 0 a 12"
              className="w-full rounded-xl border-2 border-humo px-4 py-3 text-carbon focus:border-fuego focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-center text-sm font-medium text-fuego">
              Revisa los datos: apodo y edad (0 a 12).
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-fuego px-4 py-3 font-bold text-white transition hover:bg-llama"
          >
            Crear mundo 🔥
          </button>
        </form>
      </div>
    </main>
  );
}
