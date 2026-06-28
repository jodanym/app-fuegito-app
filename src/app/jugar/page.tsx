// MAPA DE MUNDO (Fase 1): camino serpenteante de lecciones, estilo Duolingo.
// Muestra al nino activo, su racha, y marca las lecciones ya completadas.
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { PERSONAJES } from "@/lib/lessons/personajes";
import type { Personaje } from "@/lib/lessons/schema";
import { getNinoActivoId, calcularRacha } from "@/lib/ninos";

const RING_HABILIDAD: Record<string, string> = {
  logica: "ring-blue-300",
  critica: "ring-purple-300",
  resolucion: "ring-green-300",
};
const EMOJI_HABILIDAD: Record<string, string> = {
  logica: "🧩",
  critica: "🔍",
  resolucion: "🧭",
};

export default async function MapaPage() {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, paquete, habilidad, objetivo, personaje")
    .order("id");

  // Intercalar habilidades (PRD 6.2): el camino mezcla logica/critica/resolucion.
  // Ordenamos por numero de leccion (l1, l2, ...) y luego por habilidad.
  const ORDEN_HAB: Record<string, number> = { logica: 0, critica: 1, resolucion: 2 };
  const numLeccion = (id: string) => Number(id.match(/-l(\d+)$/)?.[1] ?? 0);
  const paradas = [...(lessons ?? [])].sort((a, b) => {
    const d = numLeccion(a.id) - numLeccion(b.id);
    return d !== 0 ? d : (ORDEN_HAB[a.habilidad] ?? 9) - (ORDEN_HAB[b.habilidad] ?? 9);
  });

  // Nino activo (si hay): nombre, racha y lecciones completadas.
  const childId = await getNinoActivoId();
  let apodo: string | null = null;
  let racha = 0;
  const completadas = new Set<string>();
  if (childId) {
    const [{ data: nino }, { data: prog }] = await Promise.all([
      supabase.from("children").select("apodo").eq("id", childId).maybeSingle(),
      supabase
        .from("progress")
        .select("lesson_id, created_at")
        .eq("child_id", childId)
        .eq("completado", true),
    ]);
    apodo = nino?.apodo ?? null;
    racha = calcularRacha((prog ?? []).map((p) => p.created_at as string));
    for (const p of prog ?? []) completadas.add(p.lesson_id as string);
  }

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-6">
      <div className="mx-auto max-w-md">
        {/* Barra superior */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/ninos" className="text-sm font-semibold text-orange-600">
            {apodo ? `👤 ${apodo}` : "Elegir perfil"}
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-orange-600 shadow-sm">
              🔥 {racha}
            </span>
            <Link href="/padres" className="text-sm text-gray-400">
              Adultos 🔒
            </Link>
          </div>
        </div>

        <h1 className="text-center text-3xl font-extrabold text-orange-600">
          Tu camino
        </h1>
        <p className="mb-8 mt-1 text-center text-gray-500">
          Avanza parada por parada. ¡Toca para jugar!
        </p>

        {!childId && (
          <Link
            href="/onboarding"
            className="mb-6 block rounded-2xl bg-white p-4 text-center text-sm font-semibold text-orange-600 shadow-sm"
          >
            👉 Crea el perfil de tu peque para guardar su progreso
          </Link>
        )}

        <div className="relative">
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 border-l-4 border-dashed border-orange-200" />
          <ol className="relative space-y-8">
            {paradas.map((l, i) => {
              const info = PERSONAJES[l.personaje as Personaje];
              const lado = i % 2 === 0 ? "justify-start" : "justify-end";
              const hecha = completadas.has(l.id);
              return (
                <li key={l.id} className={`flex ${lado}`}>
                  <Link
                    href={`/jugar/${l.id}`}
                    className="group flex w-40 flex-col items-center text-center"
                  >
                    <div
                      className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md ring-4 ${
                        RING_HABILIDAD[l.habilidad] ?? "ring-orange-300"
                      } transition group-hover:scale-105 group-active:scale-95`}
                    >
                      {info && (
                        <Image
                          src={info.imagen}
                          alt={info.nombre}
                          width={80}
                          height={80}
                          className="h-20 w-20 object-contain"
                        />
                      )}
                      <span className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shadow">
                        {i + 1}
                      </span>
                      <span className="absolute -bottom-2 right-0 text-xl">
                        {hecha ? "✅" : EMOJI_HABILIDAD[l.habilidad] ?? "⭐"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-700">
                      {l.objetivo}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        {paradas.length === 0 && (
          <p className="text-center text-gray-400">No hay lecciones cargadas todavia.</p>
        )}

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-orange-500 underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
