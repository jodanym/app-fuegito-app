"use client";

// Boton de audio: el personaje "habla" usando la voz del navegador (Web Speech
// API). Cada personaje tiene su personalidad (tono y velocidad). Es gratis e
// instantaneo; mas adelante se puede cambiar por voces reales (ElevenLabs).
import type { Personaje } from "@/lib/lessons/schema";

const VOZ: Record<Personaje, { rate: number; pitch: number }> = {
  fueguito: { rate: 1.0, pitch: 1.15 }, // cálido
  desconocido: { rate: 0.85, pitch: 0.7 }, // grave y misterioso
  acidito: { rate: 1.2, pitch: 1.45 }, // agudo y pícaro
};

export function hablar(texto: string, personaje: Personaje) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  const cfg = VOZ[personaje] ?? { rate: 1, pitch: 1 };
  u.rate = cfg.rate;
  u.pitch = cfg.pitch;
  u.lang = "es-ES";
  const voces = window.speechSynthesis.getVoices();
  const es = voces.find((v) => v.lang?.toLowerCase().startsWith("es"));
  if (es) u.voice = es;
  window.speechSynthesis.speak(u);
}

export default function BotonAudio({
  texto,
  personaje,
  grande = false,
}: {
  texto: string;
  personaje: Personaje;
  grande?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => hablar(texto, personaje)}
      aria-label="Escuchar"
      className={`inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-600 transition hover:bg-orange-200 active:scale-95 ${
        grande ? "h-14 w-14 text-2xl" : "h-10 w-10 text-lg"
      }`}
    >
      🔊
    </button>
  );
}
