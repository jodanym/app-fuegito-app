// =====================================================================
// MOTOR ADAPTATIVO POR REGLAS (Fase 1) — PRD 4.3 y 8.3.
// Servicio PURO y DETERMINISTA: mismas entradas -> misma salida.
// Entradas: perfil del nino + lecciones + historial + maestria.
// Salida: siguiente leccion + modo de presentacion + dificultad.
// NO usa IA. Son reglas explicitas y testeables. Aislado tras esta interfaz
// para poder pasar a "aprende" (Fase 2) sin tocar la UI.
// =====================================================================

import type { Habilidad, ModoLeccion } from "../lessons/schema";

// Vector de perfil. Cada eje 0-100 (ver PRD 4.1):
//  modalidad: 0 = manual/creativo   ... 100 = digital/interactivo
//  entrada:   0 = auditivo          ... 100 = lector
//  dinamica:  0 = narrativo         ... 100 = reto/competitivo
//  ritmo:     0 = reflexivo         ... 100 = rapido
export interface PerfilVector {
  modalidad: number;
  entrada: number;
  dinamica: number;
  ritmo: number;
}

export interface LeccionResumen {
  id: string;
  habilidad: Habilidad;
  modos: ModoLeccion[]; // modos disponibles en esa leccion
}

export interface ProgresoResumen {
  lesson_id: string;
  habilidad: Habilidad;
  completado: boolean;
  resultado: number | null; // 0-100
}

export interface MaestriaResumen {
  habilidad: Habilidad;
  maestria: number; // 0-100
}

export interface Recomendacion {
  leccion: LeccionResumen;
  modo: ModoLeccion;
  dificultad: 1 | 2 | 3;
}

const HABILIDADES: Habilidad[] = ["logica", "critica", "resolucion"];
// Orden de respaldo al elegir modo si el preferido no esta disponible.
const RESPALDO_MODOS: ModoLeccion[] = ["interactivo", "audio_narrativo", "manual"];

// --- 1) Elegir el MODO de presentacion segun el perfil ---
// Mismo objetivo de aprendizaje, distinta presentacion (PRD 4).
export function elegirModo(
  perfil: PerfilVector,
  modosDisponibles: ModoLeccion[]
): ModoLeccion {
  if (modosDisponibles.length === 0) return "interactivo";

  let preferido: ModoLeccion;
  if (perfil.modalidad <= 35) {
    preferido = "manual"; // muy manual/creativo
  } else if (perfil.entrada <= 35) {
    preferido = "audio_narrativo"; // muy auditivo
  } else {
    preferido = "interactivo";
  }

  if (modosDisponibles.includes(preferido)) return preferido;

  // Respaldo: primer modo disponible segun orden de preferencia general.
  for (const m of RESPALDO_MODOS) {
    if (modosDisponibles.includes(m)) return m;
  }
  return modosDisponibles[0];
}

// --- 2) Habilidad menos reforzada (la de menor maestria) ---
// Se intercalan las tres habilidades atacando siempre la mas floja (PRD 6.2).
export function habilidadMenosReforzada(maestria: MaestriaResumen[]): Habilidad {
  const mapa = new Map<Habilidad, number>();
  for (const h of HABILIDADES) mapa.set(h, 0); // ausente = 0
  for (const m of maestria) mapa.set(m.habilidad, m.maestria);

  // Menor maestria; empate -> orden fijo (determinista).
  let elegida: Habilidad = HABILIDADES[0];
  let min = Infinity;
  for (const h of HABILIDADES) {
    const v = mapa.get(h)!;
    if (v < min) {
      min = v;
      elegida = h;
    }
  }
  return elegida;
}

// --- 3) Dificultad segun desempeno reciente (modelo simple de maestria) ---
// Sube con rachas de aciertos, baja si cuesta (PRD 4.3).
export function elegirDificultad(historial: ProgresoResumen[]): 1 | 2 | 3 {
  const resultados = historial
    .filter((h) => h.completado && typeof h.resultado === "number")
    .slice(-5)
    .map((h) => h.resultado as number);

  if (resultados.length === 0) return 1;
  const promedio =
    resultados.reduce((a, b) => a + b, 0) / resultados.length;

  if (promedio >= 80) return 3;
  if (promedio >= 50) return 2;
  return 1;
}

// --- 4) Siguiente leccion recomendada ---
// Cola priorizada por habilidad menos reforzada + perfil (PRD 4.3).
export function siguienteLeccion(
  perfil: PerfilVector,
  lecciones: LeccionResumen[],
  historial: ProgresoResumen[],
  maestria: MaestriaResumen[]
): Recomendacion | null {
  const completadas = new Set(
    historial.filter((h) => h.completado).map((h) => h.lesson_id)
  );
  const pendientes = lecciones
    .filter((l) => !completadas.has(l.id))
    .sort((a, b) => a.id.localeCompare(b.id)); // orden estable

  if (pendientes.length === 0) return null;

  const objetivo = habilidadMenosReforzada(maestria);
  const deObjetivo = pendientes.filter((l) => l.habilidad === objetivo);
  const candidata = (deObjetivo.length > 0 ? deObjetivo : pendientes)[0];

  return {
    leccion: candidata,
    modo: elegirModo(perfil, candidata.modos),
    dificultad: elegirDificultad(historial),
  };
}
