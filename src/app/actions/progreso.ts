"use server";

// Guarda el progreso del nino al terminar una leccion y recalcula su maestria.
// Se llama desde el reproductor. Si no hay sesion o nino activo, no falla:
// simplemente no guarda (permite jugar de demo sin login).
import { createClient } from "@/lib/supabase/server";
import { getNinoActivoId } from "@/lib/ninos";
import type { Habilidad, ModoLeccion } from "@/lib/lessons/schema";

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
  if (!user) return { ok: false, motivo: "sin_sesion" };

  const childId = await getNinoActivoId();
  if (!childId) return { ok: false, motivo: "sin_nino" };

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
