// =====================================================================
// Molde (tipo) de una LECCION — Seccion 7.2 del PRD.
// El contenido vive como DATOS (JSON), no programado a mano. Este tipo
// describe la forma de ese JSON para que el codigo lo entienda y valide.
// El "reproductor de lecciones" generico (Fase 1) leera estos datos.
// =====================================================================

export type Paquete = "chispas" | "brasas" | "llamas";
export type Habilidad = "logica" | "critica" | "resolucion";
export type ModoLeccion = "interactivo" | "audio_narrativo" | "manual";
export type Personaje = "fueguito" | "desconocido" | "acidito";

// Dosis de lectura obligatoria, dosificada por edad (Seccion 4.4).
export type DosisLectura = "palabra" | "frase" | "parrafo";

// Tipos de reto soportados en el MVP (Seccion 8.4).
export type TipoReto =
  | "seleccion"
  | "arrastrar_soltar"
  | "ordenar_secuencia"
  | "respuesta_voz"
  | "manual_autoconfirmado";

export interface Reto {
  tipo: TipoReto;
  enunciado: string;
  // Estructura flexible segun el tipo de reto (opciones, pares, orden, etc.).
  // Se detallara por tipo cuando se construya el reproductor (Fase 1).
  datos?: Record<string, unknown>;
}

// El micro-momento de lectura obligatorio (siempre presente).
export interface Lectura {
  dosis: DosisLectura;
  texto: string;
}

// Cada "modo" es una forma distinta de presentar la MISMA leccion.
export interface ModoContenido {
  gancho?: string; // frase de enganche del personaje
  gancho_audio?: string; // ruta a audio (modo audio_narrativo)
  instruccion?: string; // instruccion (modo manual)
  ficha_pdf?: string; // ficha imprimible (modo manual)
  assets?: string[]; // clips/imagenes asociados
  retos: Reto[];
}

// La leccion completa, tal como se guarda en la columna content (jsonb).
export interface Leccion {
  id: string; // ej: "brasas-logica-u1-l3"
  version?: number; // 2 = nuevo formato con retos visuales + audio
  paquete: Paquete;
  habilidad: Habilidad;
  objetivo: string;
  lectura: Lectura;
  modos: Partial<Record<ModoLeccion, ModoContenido>>;
  personaje: Personaje;
  recompensa: string;
}

// Validacion minima en tiempo de ejecucion: comprueba que un objeto
// desconocido (ej. un JSON cargado) cumpla la forma basica de Leccion.
// Devuelve la lista de problemas; vacia = valido.
export function validarLeccion(x: unknown): string[] {
  const errores: string[] = [];
  const paquetes: Paquete[] = ["chispas", "brasas", "llamas"];
  const habilidades: Habilidad[] = ["logica", "critica", "resolucion"];
  const dosis: DosisLectura[] = ["palabra", "frase", "parrafo"];

  if (typeof x !== "object" || x === null) return ["No es un objeto"];
  const l = x as Record<string, unknown>;

  if (typeof l.id !== "string" || l.id.length === 0) errores.push("Falta 'id'");
  if (!paquetes.includes(l.paquete as Paquete)) errores.push("'paquete' invalido");
  if (!habilidades.includes(l.habilidad as Habilidad)) errores.push("'habilidad' invalida");
  if (typeof l.objetivo !== "string") errores.push("Falta 'objetivo'");

  const lectura = l.lectura as Lectura | undefined;
  if (!lectura || !dosis.includes(lectura.dosis) || typeof lectura.texto !== "string") {
    errores.push("'lectura' invalida (requiere dosis + texto)");
  }

  const modos = l.modos as Record<string, ModoContenido> | undefined;
  if (!modos || Object.keys(modos).length === 0) {
    errores.push("Debe tener al menos un modo");
  } else {
    for (const [nombre, modo] of Object.entries(modos)) {
      if (!Array.isArray(modo.retos) || modo.retos.length === 0) {
        errores.push(`El modo '${nombre}' no tiene retos`);
      }
    }
  }

  if (typeof l.recompensa !== "string") errores.push("Falta 'recompensa'");

  return errores;
}
