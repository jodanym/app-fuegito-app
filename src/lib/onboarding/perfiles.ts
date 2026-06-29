// Arquetipos de aprendizaje (perfiles CON NOMBRE).
// Traducen el vector de 4 ejes del quiz (PRD 4.1) a un personaje-perfil con
// nombre e ilustracion, para el nino (motivacion) y para el padre (reporte
// "como aprende mi hijo", PRD 5.6). El arquetipo se DERIVA del vector, no se
// guarda en la base: misma entrada -> mismo arquetipo (determinista).
import type { PerfilVector } from "@/lib/engine/motor";

export interface Arquetipo {
  id: string;
  nombre: string;
  emoji: string;
  lema: string;
  nino: string; // descripcion para el nino (motivadora)
  padre: string; // descripcion para el padre (clara, no tecnica)
  color: string; // clase de texto de marca
  bg: string; // clase de fondo de marca
}

export const ARQUETIPOS: Record<string, Arquetipo> = {
  creador: {
    id: "creador",
    nombre: "El Creador",
    emoji: "🎨",
    lema: "Aprende creando con sus manos",
    nino: "¡Te encanta crear, dibujar y construir! Aprendes mejor haciendo cosas.",
    padre:
      "Aprende mejor con actividades manuales y creativas: dibujar, recortar, construir.",
    color: "text-fuego",
    bg: "bg-fuego/10",
  },
  oyente: {
    id: "oyente",
    nombre: "El Oyente",
    emoji: "🎧",
    lema: "Aprende escuchando",
    nino: "¡Tus oídos son tu superpoder! Aprendes genial escuchando cuentos y sonidos.",
    padre:
      "Aprende mejor escuchando: las instrucciones y los cuentos por voz le funcionan muy bien.",
    color: "text-critica",
    bg: "bg-critica/10",
  },
  veloz: {
    id: "veloz",
    nombre: "El Veloz",
    emoji: "⚡",
    lema: "Le encantan los retos rápidos",
    nino: "¡Te encantan los retos y la velocidad! Mientras más rápido, más te diviertes.",
    padre:
      "Se motiva con retos, puntos y velocidad. Disfruta los desafíos con tiempo.",
    color: "text-llama",
    bg: "bg-llama/10",
  },
  detective: {
    id: "detective",
    nombre: "El Detective",
    emoji: "🔍",
    lema: "Piensa antes de responder",
    nino: "¡Te encantan los misterios! Observas con calma y piensas antes de decidir.",
    padre:
      "Disfruta los acertijos y misterios; le gusta observar y pensar antes de responder.",
    color: "text-burbuja",
    bg: "bg-burbuja/10",
  },
  explorador: {
    id: "explorador",
    nombre: "El Explorador",
    emoji: "🧭",
    lema: "Descubre con historias y calma",
    nino: "¡Te encanta descubrir cosas nuevas! Aprendes con historias y a tu propio ritmo.",
    padre:
      "Aprende con historias y exploración, a un ritmo tranquilo. Le gusta descubrir.",
    color: "text-resolucion",
    bg: "bg-resolucion/10",
  },
};

// Reglas deterministas: se evalúan en orden y devuelven el primer arquetipo
// que encaje. El eje más marcado define el perfil.
export function arquetipoDe(v: PerfilVector): Arquetipo {
  if (v.modalidad <= 35) return ARQUETIPOS.creador; // muy manual/creativo
  if (v.entrada <= 35) return ARQUETIPOS.oyente; // muy auditivo
  if (v.dinamica >= 65 && v.ritmo >= 60) return ARQUETIPOS.veloz; // reto + rápido
  if (v.dinamica >= 60) return ARQUETIPOS.detective; // reto/curioso
  return ARQUETIPOS.explorador; // narrativo / equilibrado
}
