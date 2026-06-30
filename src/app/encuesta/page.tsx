"use client";

// Encuesta de feedback del MVP. Al enviar, guarda las respuestas en Supabase
// (via /api/feedback) y termina con un agradecimiento. Es publica (sin login).
import { useState } from "react";
import Image from "next/image";

type Pregunta = { id: string; publico: "nino" | "padre"; q: string; opts: string[] };

const QUIEN = ["👦 El niño", "👩 Papá o mamá", "👨‍👩‍👧 Juntos"];

const PREGUNTAS: Pregunta[] = [
  { id: "gusto", publico: "nino", q: "¿Le gustó jugar?", opts: ["¡Le encantó! 😍", "Le gustó 🙂", "Más o menos 😐", "No mucho 😞"] },
  { id: "mundo", publico: "nino", q: "¿Qué mundo le gustó más?", opts: ["🔍 Misterios", "🧩 Acertijos", "🧭 Retos", "Todos / no sé"] },
  { id: "dificultad", publico: "nino", q: "¿Cómo fueron las misiones?", opts: ["Muy fáciles", "Justas 👍", "Muy difíciles"] },
  { id: "entendio", publico: "nino", q: "¿Entendió qué tenía que hacer en cada reto?", opts: ["Sí, siempre", "A veces", "No, le costó"] },
  { id: "personaje", publico: "nino", q: "¿Personaje favorito?", opts: ["🔥 Fueguito", "🟢 Acidito", "🌑 Desconocido", "Ninguno"] },
  { id: "seguir", publico: "nino", q: "¿Le gustaría seguir jugando?", opts: ["¡Sí, mucho!", "Más o menos", "No"] },
  { id: "edad", publico: "padre", q: "¿Para qué edad te pareció ideal?", opts: ["3-5 años", "6-8 años", "9-12 años"] },
  { id: "ensena", publico: "padre", q: "¿Sentiste que ayuda a pensar (lógica, criterio, resolución)?", opts: ["Sí, bastante", "Algo", "Poco"] },
  { id: "pagaria", publico: "padre", q: "¿Pagarías una suscripción mensual accesible por esto?", opts: ["Sí", "Tal vez", "No"] },
  { id: "recomienda", publico: "padre", q: "¿La recomendarías a otros padres?", opts: ["Sí", "Tal vez", "No"] },
];

export default function EncuestaPage() {
  const [resp, setResp] = useState<Record<string, string>>({});
  const [quien, setQuien] = useState("");
  const [nombre, setNombre] = useState("");
  const [comentario, setComentario] = useState("");
  const [estado, setEstado] = useState<"form" | "enviando" | "ok" | "error">("form");
  const [aviso, setAviso] = useState("");

  async function enviar() {
    const faltan = PREGUNTAS.map((p, i) => ({ p, i }))
      .filter((x) => !resp[x.p.id])
      .map((x) => x.i + 1);
    if (faltan.length) {
      setAviso("Falta responder la(s) pregunta(s): " + faltan.join(", "));
      return;
    }
    setAviso("");
    setEstado("enviando");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quien, nombre, comentario, ...resp }),
      });
      setEstado(r.ok ? "ok" : "error");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-papel p-6 text-center">
        <p className="text-6xl">🎉</p>
        <h1 className="text-3xl font-extrabold text-llama">¡Gracias!</h1>
        <p className="max-w-sm text-carbon/70">
          Tus respuestas se enviaron. Nos ayudan muchísimo a mejorar el Universo de Fueguito.
        </p>
        <a
          href="https://app-fuegito-app.vercel.app"
          className="mt-2 rounded-2xl bg-fuego px-6 py-3 font-display font-bold text-white"
        >
          Volver a jugar 🔥
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-papel px-4 py-6">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <Image
            src="/fondos/banner.png"
            alt="Fueguito, Acidito y Desconocido"
            width={1360}
            height={768}
            priority
            className="h-auto w-full rounded-2xl shadow-sm"
          />
          <h1 className="mt-4 text-3xl font-extrabold text-llama">Ayúdanos a mejorar 🔥</h1>
          <p className="mt-2 text-carbon/70">
            Gracias por probar el <b>Universo de Fueguito</b>. Tus respuestas nos ayudan a
            hacerlo mejor para los niños.
          </p>
          <a
            href="https://app-fuegito-app.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-2xl bg-fuego px-6 py-3 font-display font-bold text-white shadow-sm"
          >
            ▶ Primero juega aquí
          </a>
          <p className="mt-2 text-sm text-carbon/45">
            Juega un rato y luego responde estas 10 preguntitas (2 minutos).
          </p>
        </div>

        <div className="mt-6 space-y-4 rounded-3xl bg-white p-5 shadow-sm">
          <div>
            <p className="mb-2 font-bold">¿Quién responde?</p>
            <div className="flex flex-wrap gap-2">
              {QUIEN.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setQuien(t)}
                  className={`min-w-[110px] flex-1 rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${
                    quien === t ? "border-fuego bg-papel text-fuego" : "border-humo"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block font-bold">Tu nombre (o el del peque) — opcional</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={40}
              placeholder="Ej: Irene / Mateo"
              className="w-full rounded-xl border-2 border-humo px-4 py-3 text-carbon focus:border-fuego focus:outline-none"
            />
          </div>
        </div>

        {PREGUNTAS.map((p, idx) => (
          <div key={p.id} className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-fuego">
              Pregunta {idx + 1} de 10{" "}
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                  p.publico === "nino" ? "bg-chispa/30 text-llama" : "bg-critica/15 text-critica"
                }`}
              >
                {p.publico === "nino" ? "para el niño" : "para el adulto"}
              </span>
            </p>
            <p className="mb-3 mt-1 text-lg font-bold text-carbon">{p.q}</p>
            <div className="grid gap-2">
              {p.opts.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setResp({ ...resp, [p.id]: o })}
                  className={`rounded-xl border-2 px-4 py-3 text-left font-bold transition ${
                    resp[p.id] === o ? "border-fuego bg-papel" : "border-humo hover:border-chispa"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-lg font-bold text-carbon">
            ✍️ ¿Qué mejorarías o qué no te funcionó?{" "}
            <span className="text-sm font-semibold text-carbon/45">(opcional)</span>
          </p>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="Lo que sea: algo que no se entendió, una idea, un error..."
            className="mt-2 w-full rounded-xl border-2 border-humo px-4 py-3 text-carbon focus:border-fuego focus:outline-none"
          />
        </div>

        {aviso && <p className="mt-3 text-center font-bold text-llama">{aviso}</p>}
        {estado === "error" && (
          <p className="mt-3 text-center font-bold text-llama">
            No se pudo enviar. Revisa tu internet e intenta de nuevo.
          </p>
        )}

        <button
          onClick={enviar}
          disabled={estado === "enviando"}
          className="mt-5 w-full rounded-2xl bg-fuego px-6 py-4 font-display text-xl font-extrabold text-white shadow-sm transition hover:bg-llama disabled:opacity-60"
        >
          {estado === "enviando" ? "Enviando..." : "Enviar mis respuestas"}
        </button>

        <p className="mb-10 mt-6 text-center text-sm text-carbon/45">Universo de Fueguito</p>
      </div>
    </main>
  );
}
