// Quiz de perfilado inicial (PRD 4.2). Maximo 8 preguntas, ilustradas (emoji),
// se siente como juego. Cada opcion empuja uno o mas ejes del perfil.
// El resultado es un vector {modalidad, entrada, dinamica, ritmo} de 0-100.
import type { PerfilVector } from "../engine/motor";

export interface OpcionQuiz {
  texto: string;
  emoji: string;
  // Cuanto mueve cada eje (delta). Se suma al valor base (50) y se recorta 0-100.
  efectos: Partial<PerfilVector>;
}

export interface PreguntaQuiz {
  id: string;
  pregunta: string;
  opciones: [OpcionQuiz, OpcionQuiz];
}

export const PREGUNTAS: PreguntaQuiz[] = [
  {
    id: "modalidad",
    pregunta: "¿Qué te gusta más?",
    opciones: [
      { texto: "Pintar y recortar", emoji: "✂️", efectos: { modalidad: -25 } },
      { texto: "Jugar en la pantalla", emoji: "📱", efectos: { modalidad: +25 } },
    ],
  },
  {
    id: "entrada",
    pregunta: "Cuando aprendes algo nuevo, prefieres...",
    opciones: [
      { texto: "Que te lo cuenten", emoji: "🎧", efectos: { entrada: -25 } },
      { texto: "Leerlo tú mismo", emoji: "📖", efectos: { entrada: +25 } },
    ],
  },
  {
    id: "dinamica",
    pregunta: "¿Qué prefieres?",
    opciones: [
      { texto: "Una historia con personajes", emoji: "🧸", efectos: { dinamica: -25 } },
      { texto: "Un reto con puntos y tiempo", emoji: "⏱️", efectos: { dinamica: +25 } },
    ],
  },
  {
    id: "ritmo",
    pregunta: "¿Cómo te gusta ir?",
    opciones: [
      { texto: "Con calma, pensando bien", emoji: "🐢", efectos: { ritmo: -25 } },
      { texto: "Rápido, un reto tras otro", emoji: "🐇", efectos: { ritmo: +25 } },
    ],
  },
  {
    id: "mostrar",
    pregunta: "Para mostrar lo que sabes...",
    opciones: [
      { texto: "Hago algo con mis manos", emoji: "🙌", efectos: { modalidad: -15, dinamica: -10 } },
      { texto: "Toco la respuesta correcta", emoji: "👆", efectos: { modalidad: +15, dinamica: +10 } },
    ],
  },
  {
    id: "instrucciones",
    pregunta: "Las instrucciones, mejor...",
    opciones: [
      { texto: "Escuchadas y con calma", emoji: "🔊", efectos: { entrada: -15, ritmo: -10 } },
      { texto: "Leídas y al grano", emoji: "📝", efectos: { entrada: +15, ritmo: +10 } },
    ],
  },
];

function recortar(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// Convierte las respuestas elegidas (indice 0 o 1 por pregunta) en el vector.
export function calcularPerfil(
  respuestas: Record<string, 0 | 1>
): PerfilVector {
  const vector: PerfilVector = { modalidad: 50, entrada: 50, dinamica: 50, ritmo: 50 };
  for (const p of PREGUNTAS) {
    const elegido = respuestas[p.id];
    if (elegido === undefined) continue;
    const efectos = p.opciones[elegido].efectos;
    for (const [eje, delta] of Object.entries(efectos)) {
      const k = eje as keyof PerfilVector;
      vector[k] = recortar(vector[k] + (delta as number));
    }
  }
  return vector;
}

// Mensaje puente segun edad (PRD 4.2): quien responde el quiz.
export function quienResponde(edad: number): string {
  if (edad <= 5) return "Ahora le toca a mamá o papá responder por el peque.";
  if (edad <= 8) return "Respóndelo junto a mamá o papá. ¡Toca lo que más te gusta!";
  return "¡Ahora te toca a ti! Toca lo que más te guste.";
}
