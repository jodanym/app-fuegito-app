"use server";

// Guarda el progreso del nino al terminar una leccion y recalcula su maestria.
// Se llama desde el reproductor. Si no hay sesion o nino activo, no falla:
// simplemente no guarda (permite jugar de demo sin login).
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getNinoActivoId, COOKIE_PROGRESO_ANON } from "@/lib/ninos";
import type { Habilidad, ModoLeccion } from "@/lib/lessons/schema";

// Guarda una leccion completada en la cookie del navegador (juego sin perfil).
async function guardarProgresoAnonimo(lessonId: string) {
  const c = await cookies();
  const previo = c.get(COOKIE_PROGRESO_ANON)?.value ?? "";
  const hechas = new Set(previo.split(",").filter(Boolean));
  hechas.add(lessonId);
  c.set(COOKIE_PROGRESO_ANON, Array.from(hechas).join(","), {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function guardarProgreso(input: {
  lessonId: string;
  habilidad: Habilidad;
  modo: ModoLeccion;
  resultado: number; // 0-100
  tiempoSegundos?: number;
  pistasUsadas?: number;
}): Promise<{ ok: boolean; motivo?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const childId = user ? await getNinoActivoId() : null;

  // Sin perfil (anonimo): el progreso vive en el navegador para que el camino
  // avance y se desbloqueen las misiones sin necesidad de registrarse.
  if (!user || !childId) {
    await guardarProgresoAnonimo(input.lessonId);
    return { ok: true, motivo: "anonimo" };
  }

  const { error } = await supabase.from("progress").insert({
    child_id: childId,
    lesson_id: input.lessonId,
    modo: input.modo,
    completado: true,
    resultado: input.resultado,
    tiempo_segundos: input.tiempoSegundos ?? null,
    pistas_usadas: input.pistasUsadas ?? 0,
  });
  if (error) return { ok: false, motivo: error.message };

  // Recalcular maestria = promedio de resultados completados de esa habilidad.
  const { data: filas } = await supabase
    .from("progress")
    .select("resultado, lessons(habilidad)")
    .eq("child_id", childId)
    .eq("completado", true);

  const resultadosHab = (filas ?? [])
    .filter((f) => {
      const l = f.lessons as unknown as { habilidad: Habilidad } | null;
      return l?.habilidad === input.habilidad && typeof f.resultado === "number";
    })
    .map((f) => f.resultado as number);

  if (resultadosHab.length > 0) {
    const maestria = Math.round(
      resultadosHab.reduce((a, b) => a + b, 0) / resultadosHab.length
    );
    await supabase
      .from("skill_mastery")
      .upsert(
        { child_id: childId, habilidad: input.habilidad, maestria, updated_at: new Date().toISOString() },
        { onConflict: "child_id,habilidad" }
      );
  }

  return { ok: true };
}
