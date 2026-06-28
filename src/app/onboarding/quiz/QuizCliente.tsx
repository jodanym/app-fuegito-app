"use client";

// Quiz de perfilado interactivo (PRD 4.2). Se siente como juego, no formulario.
// No se muestra la mecanica de ejes al usuario (PRD 4.2). Al terminar, calcula
// el vector y lo guarda; el motor adaptativo lo usara para elegir contenido.
import { useState } from "react";
import { PREGUNTAS, calcularPerfil, quienResponde } from "@/lib/onboarding/quiz";
import { guardarPerfil } from "@/app/actions/ninos";
import type { PerfilVector } from "@/lib/engine/motor";

type Fase = "intro" | "quiz" | "guardando";

export default function QuizCliente({
  childId,
  apodo,
  edad,
}: {
  childId: string;
  apodo: string;
  edad: number;
}) {
  const [fase, setFase] = useState<Fase>("intro");
  const [idx, setIdx] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, 0 | 1>>({});

  async function elegir(opcion: 0 | 1) {
    const pregunta = PREGUNTAS[idx];
    const nuevas = { ...respuestas, [pregunta.id]: opcion };
    setRespuestas(nuevas);

    if (idx + 1 < PREGUNTAS.length) {
      setIdx(idx + 1);
    } else {
      setFase("guardando");
      const vector: PerfilVector = calcularPerfil(nuevas);
      await guardarPerfil(childId, vector); // redirige a /jugar
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        {fase === "intro" && (
          <div className="text-center">
            <p className="text-5xl">🎮</p>
            <h1 className="mt-3 text-2xl font-extrabold text-orange-600">
              ¡Vamos a conocer a {apodo}!
            </h1>
            <p className="mt-3 text-gray-600">{quienResponde(edad)}</p>
            <p className="mt-2 text-sm text-gray-400">
              Son {PREGUNTAS.length} preguntas rapidas. No hay respuestas malas.
            </p>
            <button
              onClick={() => setFase("quiz")}
              className="mt-6 w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
            >
              Empezar
            </button>
          </div>
        )}

        {fase === "quiz" && (
          <div>
            <div className="mb-6 flex gap-2">
              {PREGUNTAS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i <= idx ? "bg-orange-500" : "bg-orange-200"
                  }`}
                />
              ))}
            </div>

            <p className="mb-1 text-sm font-semibold text-orange-400">
              Pregunta {idx + 1} de {PREGUNTAS.length}
            </p>
            <h2 className="mb-6 text-xl font-bold text-gray-800">
              {PREGUNTAS[idx].pregunta}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {PREGUNTAS[idx].opciones.map((op, i) => (
                <button
                  key={i}
                  onClick={() => elegir(i as 0 | 1)}
                  className="flex items-center gap-4 rounded-2xl border-2 border-orange-200 bg-white px-5 py-4 text-left transition hover:border-orange-400 hover:bg-orange-50 active:scale-[0.98]"
                >
                  <span className="text-4xl">{op.emoji}</span>
                  <span className="text-lg font-semibold text-gray-800">{op.texto}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {fase === "guardando" && (
          <div className="text-center">
            <p className="text-5xl">✨</p>
            <h2 className="mt-3 text-xl font-bold text-orange-600">
              Fueguito esta preparando un mundo a la medida de {apodo}...
            </h2>
          </div>
        )}
      </div>
    </main>
  );
}
