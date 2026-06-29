// Pagina que JUEGA una leccion. Trae el contenido (JSON) de la base de datos.
// - El MODO de presentacion lo elige el MOTOR ADAPTATIVO segun el perfil del nino.
// - Si el plan es gratis, se respeta el LIMITE DIARIO (freemium, PRD 9.1).
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReproductorLeccion from "@/components/reproductor/ReproductorLeccion";
import ReproductorV2 from "@/components/reproductor/ReproductorV2";
import { validarLeccion, type Leccion, type ModoLeccion } from "@/lib/lessons/schema";
import { elegirModo, type PerfilVector } from "@/lib/engine/motor";
import { getNinoActivoId, LIMITE_DIARIO_FREE } from "@/lib/ninos";

const PERFIL_NEUTRO: PerfilVector = { modalidad: 50, entrada: 50, dinamica: 50, ritmo: 50 };

// Medalla por habilidad (logica/critica/resolucion).
function imagenMedalla(habilidad: string): string {
  return `/medallas/${habilidad}.png`;
}

export default async function JugarLeccionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("lessons")
    .select("content")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const leccion = data.content as Leccion;
  // El personaje DUEÑO del mundo manda en la presentacion, para que cada mundo
  // sea consistente: Acertijos=Acidito, Misterios=Desconocido, Retos=Fueguito.
  const DUENO_MUNDO = {
    logica: "acidito",
    critica: "desconocido",
    resolucion: "fueguito",
  } as const;
  leccion.personaje = DUENO_MUNDO[leccion.habilidad];
  const errores = validarLeccion(leccion);
  if (errores.length > 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-papel p-6 text-center">
        <p className="text-lg font-bold text-llama">
          Esta leccion tiene datos incompletos.
        </p>
        <ul className="text-sm text-carbon/60">
          {errores.map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
        <Link href="/jugar" className="font-semibold text-fuego underline">Volver</Link>
      </main>
    );
  }

  const modosDisponibles = Object.keys(leccion.modos) as ModoLeccion[];
  const childId = await getNinoActivoId();

  // Perfil del nino activo (si hay) para que el motor elija el modo.
  let perfil = PERFIL_NEUTRO;
  if (childId) {
    const { data: p } = await supabase
      .from("learner_profiles")
      .select("modalidad, entrada, dinamica, ritmo")
      .eq("child_id", childId)
      .maybeSingle();
    if (p) perfil = p as PerfilVector;

    // Limite diario en plan gratis.
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("tier")
      .limit(1);
    const tier = subs?.[0]?.tier ?? "free";
    if (tier === "free") {
      const hoy = new Date().toISOString().slice(0, 10);
      const { data: hechasHoy } = await supabase
        .from("progress")
        .select("id")
        .eq("child_id", childId)
        .eq("completado", true)
        .gte("created_at", `${hoy}T00:00:00.000Z`);
      if ((hechasHoy?.length ?? 0) >= LIMITE_DIARIO_FREE) {
        return <MuroDiario />;
      }
    }
  }

  const modoNombre = elegirModo(perfil, modosDisponibles);

  const medalla = imagenMedalla(leccion.habilidad);

  // Lecciones nuevas (version 2) usan el reproductor visual con audio.
  if (leccion.version === 2) {
    return <ReproductorV2 leccion={leccion} modoNombre={modoNombre} medalla={medalla} />;
  }
  return <ReproductorLeccion leccion={leccion} modoNombre={modoNombre} />;
}

function MuroDiario() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-papel p-6 text-center">
      <p className="text-5xl">🔥</p>
      <h1 className="text-2xl font-extrabold text-llama">
        ¡Ya jugaste mucho hoy!
      </h1>
      <p className="max-w-xs text-carbon/70">
        En el plan gratis puedes hacer {LIMITE_DIARIO_FREE} lecciones por día.
        Fueguito quiere seguir contigo... ¡desbloquea más con Premium!
      </p>
      <Link
        href="/padres/suscripcion"
        className="mt-2 rounded-2xl bg-fuego px-6 py-3 font-bold text-white hover:bg-llama"
      >
        Ver Premium
      </Link>
      <Link href="/jugar" className="text-sm font-semibold text-carbon/45 underline">
        Volver al mapa
      </Link>
    </main>
  );
}
