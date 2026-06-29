"use client";

// Quiz de perfilado interactivo (PRD 4.2). Se siente como juego, no formulario.
// Al terminar calcula el vector, lo guarda, y muestra una pantalla de RESULTADO
// con el arquetipo CON NOMBRE (El Detective, El Creador...) para motivar al nino.
import { useState } from "react";
import Link from "next/link";
import { PREGUNTAS, calcularPerfil, quienResponde } from "@/lib/onboarding/quiz";
import { guardarPerfil } from "@/app/actions/ninos";
import { arquetipoDe, type Arquetipo } from "@/lib/onboarding/perfiles";
import type { PerfilVector } from "@/lib/engine/motor";

type Fase = "intro" | "quiz" | "guardando" | "resultado";

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
  const [arquetipo, setArquetipo] = useState<Arquetipo | null>(null);

  async function elegir(opcion: 0 | 1) {
    const pregunta = PREGUNTAS[idx];
    const nuevas = { ...respuestas, [pregunta.id]: opcion };
    setRespuestas(nuevas);

    if (idx + 1 < PREGUNTAS.length) {
      setIdx(idx + 1);
    } else {
      setFase("guardando");
      const vector: PerfilVector = calcularPerfil(nuevas);
      setArquetipo(arquetipoDe(vector));
      await guardarPerfil(childId, vector);
      setFase("resultado");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-papel p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        {fase === "intro" && (
          <div className="text-center">
            <p className="text-5xl">🎮</p>
            <h1 className="mt-3 text-2xl font-extrabold text-llama">
              ¡Vamos a conocer a {apodo}!
            </h1>
            <p className="mt-3 text-carbon/70">{quienResponde(edad)}</p>
            <p className="mt-2 text-sm text-carbon/45">
              Son {PREGUNTAS.length} preguntas rapidas. No hay respuestas malas.
            </p>
            <button
              onClick={() => setFase("quiz")}
              className="mt-6 w-full rounded-2xl bg-fuego px-6 py-4 text-lg font-bold text-white transition hover:bg-llama active:scale-[0.98]"
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
                  className={`h-2.5 flex-1 rounded-full ${
                    i <= idx ? "bg-fuego" : "bg-chispa/30"
                  }`}
                />
              ))}
            </div>

            <p className="mb-1 text-sm font-bold text-fuego/70">
              Pregunta {idx + 1} de {PREGUNTAS.length}
            </p>
            <h2 className="mb-6 text-xl font-bold text-carbon">
              {PREGUNTAS[idx].pregunta}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {PREGUNTAS[idx].opciones.map((op, i) => (
                <button
                  key={i}
                  onClick={() => elegir(i as 0 | 1)}
                  className="flex items-center gap-4 rounded-2xl border-2 border-chispa bg-white px-5 py-4 text-left transition hover:border-fuego hover:bg-papel active:scale-[0.98]"
                >
                  <span className="text-4xl">{op.emoji}</span>
                  <span className="text-lg font-bold text-carbon/80">{op.texto}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {fase === "guardando" && (
          <div className="text-center">
            <p className="text-5xl">✨</p>
            <h2 className="mt-3 text-xl font-bold text-llama">
              Fueguito está descubriendo cómo aprende {apodo}...
            </h2>
          </div>
        )}

        {fase === "resultado" && arquetipo && (
          <div className="text-center">
            <p className="text-6xl">{arquetipo.emoji}</p>
            <p className="mt-2 text-sm font-bold uppercase tracking-wide text-carbon/50">
              Fueguito descubrió que {apodo} es...
            </p>
            <h1 className={`mt-1 text-3xl font-extrabold ${arquetipo.color}`}>
              {arquetipo.nombre}
            </h1>
            <p className="mt-1 italic text-carbon/70">“{arquetipo.lema}”</p>
            <p className={`mt-4 rounded-2xl ${arquetipo.bg} p-4 text-carbon/80`}>
              {arquetipo.nino}
            </p>
            <Link
              href="/jugar"
              className="mt-6 block w-full rounded-2xl bg-fuego px-6 py-4 text-lg font-bold text-white transition hover:bg-llama active:scale-[0.98]"
            >
              ¡Empezar a jugar! 🔥
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
