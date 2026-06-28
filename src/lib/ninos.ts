// Helpers de ninos: paquete por edad, nino activo (cookie) y racha diaria.
import { cookies } from "next/headers";
import type { Paquete } from "./lessons/schema";

export const COOKIE_NINO = "fueguito_nino";
export const LIMITE_DIARIO_FREE = 5; // lecciones/dia en el tier gratis (PRD 9.1)

// Asigna el paquete de edad segun PRD 3.1.
export function paqueteParaEdad(edad: number): Paquete {
  if (edad <= 5) return "chispas";
  if (edad <= 8) return "brasas";
  return "llamas";
}

// Lee el id del nino activo desde la cookie (o null).
export async function getNinoActivoId(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE_NINO)?.value ?? null;
}

// Calcula la racha de dias consecutivos con al menos una leccion completada.
// Recibe fechas ISO (created_at). Si hoy no hay actividad, la racha puede
// venir de ayer (no se pierde hasta fallar un dia completo).
export function calcularRacha(fechasISO: string[]): number {
  const dias = new Set(fechasISO.map((f) => f.slice(0, 10)));
  const hoy = new Date();
  let racha = 0;
  for (let i = 0; ; i++) {
    const d = new Date(hoy);
    d.setUTCDate(hoy.getUTCDate() - i);
    const clave = d.toISOString().slice(0, 10);
    if (dias.has(clave)) {
      racha++;
    } else if (i === 0) {
      continue; // hoy sin actividad: seguimos mirando ayer
    } else {
      break;
    }
  }
  return racha;
}
