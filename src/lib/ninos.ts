// Helpers de ninos: paquete por edad, nino activo (cookie) y racha diaria.
import { cookies } from "next/headers";
import type { Paquete } from "./lessons/schema";

export const COOKIE_NINO = "fueguito_nino";
// Progreso de quien juega SIN perfil (anonimo): lista de ids de lecciones
// completadas, guardada en el navegador para que el camino avance sin registro.
export const COOKIE_PROGRESO_ANON = "fueguito_progreso_anon";
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

// Racha de dias consecutivos con al menos una leccion completada, CON el
// "Escudo de Fueguito": perdona UN dia faltante para no castigar un descuido
// (estilo Streak Freeze de Duolingo, reduce el abandono). Si se falla un
// segundo dia, ahi si se corta.
//   dias        -> numero de la racha
//   escudoActivo-> true si el escudo aun esta disponible; false si ya se uso
//                  para salvar la racha (se "recarga" al mantener la racha)
export function calcularRachaEscudo(
  fechasISO: string[]
): { dias: number; escudoActivo: boolean } {
  const dias = new Set(fechasISO.map((f) => f.slice(0, 10)));
  const hoy = new Date();
  let racha = 0;
  let escudoActivo = true;
  for (let i = 0; ; i++) {
    const d = new Date(hoy);
    d.setUTCDate(hoy.getUTCDate() - i);
    const clave = d.toISOString().slice(0, 10);
    if (dias.has(clave)) {
      racha++;
    } else if (i === 0) {
      continue; // hoy aun sin actividad: miramos ayer
    } else if (escudoActivo) {
      escudoActivo = false; // el escudo cubre este dia faltante
      continue;
    } else {
      break; // segundo dia faltante: la racha termina
    }
  }
  return { dias: racha, escudoActivo };
}

// Solo el numero de la racha (usa el mismo calculo con escudo).
export function calcularRacha(fechasISO: string[]): number {
  return calcularRachaEscudo(fechasISO).dias;
}
