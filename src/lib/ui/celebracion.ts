"use client";

// Sonidos de celebracion generados en el navegador (Web Audio API).
// No necesitan archivos: son tonos suaves y alegres. Refuerzo positivo (PRD 5.1).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// Toca una nota corta tipo campanita.
function tono(freq: number, startEn: number, dur: number, vol = 0.18) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(c.destination);
  const t = c.currentTime + startEn;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur);
}

// Acierto: dos notas que suben (¡ding-ding!).
export function sonarAcierto() {
  tono(660, 0, 0.15);
  tono(880, 0.09, 0.2);
}

// Logro/recompensa: arpegio alegre (do-mi-sol-do).
export function sonarLogro() {
  [523, 659, 784, 1047].forEach((f, i) => tono(f, i * 0.12, 0.28, 0.16));
}
