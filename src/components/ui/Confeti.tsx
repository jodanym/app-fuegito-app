"use client";

// Confeti de celebracion: piezas de colores de marca que caen. Puro CSS, sin
// librerias. Se coloca dentro de un contenedor con position relative.
import { useMemo } from "react";

const COLORES = ["#FF7A1A", "#F23A1E", "#FFC22E", "#5BB561", "#7A6BD4", "#2E9BDA"];

export default function Confeti({ cantidad = 26 }: { cantidad?: number }) {
  const piezas = useMemo(
    () =>
      Array.from({ length: cantidad }).map((_, i) => ({
        left: Math.round(Math.random() * 100),
        delay: Math.round(Math.random() * 300) / 1000,
        dur: Math.round((900 + Math.random() * 800)) / 1000,
        color: COLORES[i % COLORES.length],
        size: 6 + Math.round(Math.random() * 6),
      })),
    [cantidad]
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {piezas.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: "-12px",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: "2px",
            animation: `confeti-caida ${p.dur}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
