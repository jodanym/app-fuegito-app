"use client";

// =====================================================================
// REPRODUCTOR DE LECCIONES (generico) — Fase 1.
// Recibe una leccion (datos JSON) y la juega en los 5 momentos:
//   1) Gancho  2) Explicacion  3) Practica  4) Lectura  5) Recompensa
// Refuerzo positivo, sin castigo (PRD 5.1). Botones grandes (PRD 5.1).
// Esta version soporta el modo "interactivo" con retos de:
//   seleccion, arrastrar_soltar, ordenar_secuencia, y confirmacion (voz/manual).
// =====================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Leccion, ModoContenido, ModoLeccion, Reto } from "@/lib/lessons/schema";
import { PERSONAJES } from "@/lib/lessons/personajes";
import { guardarProgreso } from "@/app/actions/progreso";

// Texto bonito: "tres_puntos" -> "Tres puntos"
function bonito(s: string): string {
  const t = s.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

type Momento = "gancho" | "explicacion" | "practica" | "lectura" | "recompensa";
const ORDEN: Momento[] = ["gancho", "explicacion", "practica", "lectura", "recompensa"];

export default function ReproductorLeccion({
  leccion,
  modoNombre,
}: {
  leccion: Leccion;
  modoNombre: ModoLeccion;
}) {
  const personaje = PERSONAJES[leccion.personaje];

  // El MODO lo eligio el motor adaptativo segun el perfil del nino (prop).
  // Si esa leccion no tuviera ese modo, usamos el primero disponible.
  const modo: ModoContenido = useMemo(() => {
    return (
      leccion.modos[modoNombre] ??
      Object.values(leccion.modos)[0] ?? { retos: [] }
    );
  }, [leccion, modoNombre]);

  const totalRetos = modo.retos.length;

  const [paso, setPaso] = useState(0); // indice en ORDEN
  const [retoIdx, setRetoIdx] = useState(0);
  const [buenos, setBuenos] = useState(0); // aciertos al primer intento

  const momento = ORDEN[paso];
  const avanzar = () => setPaso((p) => Math.min(p + 1, ORDEN.length - 1));

  function onRetoResuelto(primerIntento: boolean) {
    if (primerIntento) setBuenos((b) => b + 1);
    if (retoIdx + 1 < modo.retos.length) {
      setRetoIdx((i) => i + 1);
    } else {
      avanzar(); // termino la practica -> lectura
    }
  }

  // Al llegar a la recompensa, guardamos el progreso UNA vez. Si no hay sesion
  // o nino activo, la accion simplemente no guarda (no rompe el juego de demo).
  const guardadoRef = useRef(false);
  useEffect(() => {
    if (momento === "recompensa" && !guardadoRef.current) {
      guardadoRef.current = true;
      const resultado = totalRetos > 0 ? Math.round((buenos / totalRetos) * 100) : 100;
      guardarProgreso({
        lessonId: leccion.id,
        habilidad: leccion.habilidad,
        modo: modoNombre,
        resultado,
      }).catch(() => {});
    }
  }, [momento, buenos, totalRetos, leccion, modoNombre]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-papel px-4 py-6">
      {/* Barra de progreso de los 5 momentos */}
      <div className="mb-6 flex w-full max-w-lg gap-2">
        {ORDEN.map((m, i) => (
          <div
            key={m}
            className={`h-2.5 flex-1 rounded-full ${
              i <= paso ? "bg-fuego" : "bg-chispa/30"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-lg">
        {momento === "gancho" && (
          <Gancho personaje={personaje} texto={modo.gancho ?? leccion.objetivo} onNext={avanzar} />
        )}

        {momento === "explicacion" && (
          <Explicacion objetivo={leccion.objetivo} onNext={avanzar} />
        )}

        {momento === "practica" && modo.retos.length > 0 && (
          <Practica
            key={retoIdx}
            reto={modo.retos[retoIdx]}
            numero={retoIdx + 1}
            total={modo.retos.length}
            personaje={personaje}
            onResuelto={onRetoResuelto}
          />
        )}
        {momento === "practica" && modo.retos.length === 0 && (
          <div className="text-center">
            <p className="text-carbon/70">Esta leccion aun no tiene retos cargados.</p>
            <BotonPrimario onClick={avanzar}>Continuar</BotonPrimario>
          </div>
        )}

        {momento === "lectura" && (
          <Lectura dosis={leccion.lectura.dosis} texto={leccion.lectura.texto} onNext={avanzar} />
        )}

        {momento === "recompensa" && (
          <Recompensa
            personaje={personaje}
            recompensa={leccion.recompensa}
            buenos={buenos}
            total={totalRetos}
          />
        )}
      </div>
    </main>
  );
}

// ---------- Botones reutilizables ----------
function BotonPrimario({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 w-full rounded-2xl bg-fuego px-6 py-4 text-lg font-bold text-white transition hover:bg-llama active:scale-[0.98] disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// ---------- Momento 1: Gancho ----------
function Gancho({
  personaje,
  texto,
  onNext,
}: {
  personaje: (typeof PERSONAJES)[keyof typeof PERSONAJES];
  texto: string;
  onNext: () => void;
}) {
  return (
    <div className="text-center">
      <span className="inline-block rounded-full bg-chispa/25 px-4 py-1 text-sm font-bold uppercase tracking-wide text-llama">
        🎯 Tu mision
      </span>
      <Image
        src={personaje.imagen}
        alt={personaje.nombre}
        width={160}
        height={160}
        className="mx-auto mt-4 h-40 w-40 object-contain"
        priority
      />
      <p className="mt-2 text-sm font-bold uppercase tracking-wide text-fuego/70">
        {personaje.nombre} te propone un reto
      </p>
      <p className="mt-3 text-xl font-medium text-carbon">{texto}</p>
      <BotonPrimario onClick={onNext}>¡Vamos! 🔥</BotonPrimario>
    </div>
  );
}

// ---------- Momento 2: Explicacion ----------
function Explicacion({ objetivo, onNext }: { objetivo: string; onNext: () => void }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-fuego/70">
        Hoy vas a aprender a
      </p>
      <p className="mt-3 text-2xl font-bold text-carbon">{objetivo}</p>
      <p className="mt-4 text-carbon/60">Observa con atencion y luego practicamos.</p>
      <BotonPrimario onClick={onNext}>Entendido</BotonPrimario>
    </div>
  );
}

// ---------- Momento 3: Practica (un reto a la vez) ----------
function Practica({
  reto,
  numero,
  total,
  personaje,
  onResuelto,
}: {
  reto: Reto;
  numero: number;
  total: number;
  personaje: (typeof PERSONAJES)[keyof typeof PERSONAJES];
  onResuelto: (primerIntento: boolean) => void;
}) {
  const [estado, setEstado] = useState<"jugando" | "bien">("jugando");
  const [mensajeError, setMensajeError] = useState("");
  const [huboError, setHuboError] = useState(false);

  function acertar() {
    setEstado("bien");
  }
  function fallar() {
    setHuboError(true);
    setMensajeError("Casi... vuelve a intentarlo. ¡Tu puedes! 💪");
  }

  return (
    <div>
      <p className="mb-1 text-sm font-bold text-fuego/70">
        Reto {numero} de {total}
      </p>
      <p className="mb-5 text-lg font-medium text-carbon">{reto.enunciado}</p>

      <ContextoSecuencia reto={reto} />

      {estado === "jugando" && (
        <>
          <Interaccion reto={reto} onAcierto={acertar} onError={fallar} />
          {mensajeError && (
            <p className="mt-4 text-center text-sm font-bold text-fuego">
              {mensajeError}
            </p>
          )}
        </>
      )}

      {estado === "bien" && (
        <div className="text-center">
          <div className="rounded-2xl bg-resolucion/10 p-4 text-resolucion">
            <p className="text-lg font-bold">¡Correcto! ✅</p>
            <p className="mt-1 text-sm text-carbon/70">{personaje.celebra}</p>
          </div>
          <BotonPrimario onClick={() => onResuelto(!huboError)}>Siguiente</BotonPrimario>
        </div>
      )}
    </div>
  );
}

// Muestra la secuencia/patron del reto (si existe) para que el nino NO tenga
// que adivinar. El hueco "?" se resalta.
function ContextoSecuencia({ reto }: { reto: Reto }) {
  const d = (reto.datos ?? {}) as Record<string, unknown>;
  const secuencia = d.secuencia;
  if (!Array.isArray(secuencia) || secuencia.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="mb-2 text-sm text-carbon/60">El patron va asi:</p>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-papel p-3">
        {(secuencia as string[]).map((item, i) => {
          const esHueco = item === "?";
          return (
            <span
              key={i}
              className={`rounded-xl px-3 py-2 text-base font-semibold ${
                esHueco
                  ? "border-2 border-dashed border-fuego bg-white text-fuego"
                  : "bg-white text-carbon shadow-sm"
              }`}
            >
              {esHueco ? "?" : bonito(item)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Selector de interaccion segun el tipo/forma del reto ----------
function Interaccion({
  reto,
  onAcierto,
  onError,
}: {
  reto: Reto;
  onAcierto: () => void;
  onError: () => void;
}) {
  const d = (reto.datos ?? {}) as Record<string, unknown>;

  // Opcion unica: opciones + correcta  (cubre 'seleccion')
  if (Array.isArray(d.opciones) && typeof d.correcta === "string") {
    return (
      <OpcionUnica
        opciones={d.opciones as string[]}
        correcta={d.correcta as string}
        onAcierto={onAcierto}
        onError={onError}
      />
    );
  }

  // Arrastrar (simplificado a tocar la pieza correcta): piezas + correcta
  if (Array.isArray(d.piezas) && typeof d.correcta === "string") {
    return (
      <OpcionUnica
        opciones={d.piezas as string[]}
        correcta={d.correcta as string}
        onAcierto={onAcierto}
        onError={onError}
      />
    );
  }

  // Ordenar secuencia: elementos + orden_correcto
  if (Array.isArray(d.elementos) && Array.isArray(d.orden_correcto)) {
    return (
      <Ordenar
        elementos={d.elementos as string[]}
        ordenCorrecto={d.orden_correcto as string[]}
        onAcierto={onAcierto}
        onError={onError}
      />
    );
  }

  // Clasificar: frases [{texto, categoria}] + categorias
  if (Array.isArray(d.frases) && Array.isArray(d.categorias)) {
    return (
      <Clasificar
        frases={d.frases as { texto: string; categoria: string }[]}
        categorias={d.categorias as string[]}
        onAcierto={onAcierto}
        onError={onError}
      />
    );
  }

  // Por defecto: autoconfirmacion (voz / manual). Sin reconocimiento real en MVP.
  return (
    <div className="text-center">
      <p className="text-carbon/60">
        Hazlo en el mundo real (o en voz alta) y confirma cuando termines.
      </p>
      <BotonPrimario onClick={onAcierto}>¡Listo! ✔️</BotonPrimario>
    </div>
  );
}

function OpcionUnica({
  opciones,
  correcta,
  onAcierto,
  onError,
}: {
  opciones: string[];
  correcta: string;
  onAcierto: () => void;
  onError: () => void;
}) {
  const [elegida, setElegida] = useState<string | null>(null);

  function elegir(op: string) {
    setElegida(op);
    if (op === correcta) onAcierto();
    else onError();
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {opciones.map((op) => {
        const esElegida = elegida === op;
        const esError = esElegida && op !== correcta;
        return (
          <button
            key={op}
            onClick={() => elegir(op)}
            className={`rounded-2xl border-2 px-5 py-4 text-lg font-semibold transition active:scale-[0.98] ${
              esError
                ? "border-fuego bg-chispa/25 text-fuego"
                : "border-chispa bg-white text-carbon hover:border-fuego hover:bg-papel"
            }`}
          >
            {bonito(op)}
          </button>
        );
      })}
    </div>
  );
}

function Ordenar({
  elementos,
  ordenCorrecto,
  onAcierto,
  onError,
}: {
  elementos: string[];
  ordenCorrecto: string[];
  onAcierto: () => void;
  onError: () => void;
}) {
  const [secuencia, setSecuencia] = useState<string[]>([]);

  function tocar(el: string) {
    const nueva = [...secuencia, el];
    setSecuencia(nueva);
    if (nueva.length === ordenCorrecto.length) {
      const ok = nueva.every((v, i) => v === ordenCorrecto[i]);
      if (ok) onAcierto();
      else {
        onError();
        setSecuencia([]); // reiniciar para reintentar
      }
    }
  }

  const disponibles = elementos.filter(
    (el) => secuencia.filter((s) => s === el).length < elementos.filter((e) => e === el).length
  );

  return (
    <div>
      <p className="mb-2 text-sm text-carbon/60">Toca en orden:</p>
      <div className="mb-4 flex min-h-[3rem] flex-wrap gap-2 rounded-xl bg-papel p-3">
        {secuencia.length === 0 && (
          <span className="text-sm text-fuego/40">(vacio)</span>
        )}
        {secuencia.map((s, i) => (
          <span
            key={i}
            className="rounded-lg bg-fuego px-3 py-1 text-sm font-semibold text-white"
          >
            {i + 1}. {bonito(s)}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {disponibles.map((el, i) => (
          <button
            key={`${el}-${i}`}
            onClick={() => tocar(el)}
            className="rounded-2xl border-2 border-chispa bg-white px-4 py-3 font-semibold text-carbon transition hover:border-fuego hover:bg-papel active:scale-[0.98]"
          >
            {bonito(el)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Clasificar({
  frases,
  categorias,
  onAcierto,
  onError,
}: {
  frases: { texto: string; categoria: string }[];
  categorias: string[];
  onAcierto: () => void;
  onError: () => void;
}) {
  const [elecciones, setElecciones] = useState<Record<number, string>>({});
  const completo = frases.every((_, i) => elecciones[i]);

  function comprobar() {
    const ok = frases.every((f, i) => elecciones[i] === f.categoria);
    if (ok) onAcierto();
    else onError();
  }

  return (
    <div className="space-y-4">
      {frases.map((f, i) => (
        <div key={i} className="rounded-2xl border border-chispa/50 p-3">
          <p className="mb-2 font-medium text-carbon">{f.texto}</p>
          <div className="flex gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setElecciones((e) => ({ ...e, [i]: cat }))}
                className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
                  elecciones[i] === cat
                    ? "border-fuego bg-fuego text-white"
                    : "border-chispa bg-white text-carbon/80 hover:bg-papel"
                }`}
              >
                {bonito(cat)}
              </button>
            ))}
          </div>
        </div>
      ))}
      <BotonPrimario onClick={comprobar} disabled={!completo}>
        Comprobar
      </BotonPrimario>
    </div>
  );
}

// ---------- Momento 4: Lectura (obligatoria, protegida) ----------
function Lectura({
  dosis,
  texto,
  onNext,
}: {
  dosis: string;
  texto: string;
  onNext: () => void;
}) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-fuego/70">
        Momento de lectura
      </p>
      <p className="mt-4 rounded-2xl bg-papel px-4 py-6 text-2xl font-bold text-carbon">
        {texto}
      </p>
      <p className="mt-2 text-xs text-carbon/45">Dosis: {dosis}</p>
      <BotonPrimario onClick={onNext}>Lo lei 📖</BotonPrimario>
    </div>
  );
}

// ---------- Momento 5: Recompensa ----------
function Recompensa({
  personaje,
  recompensa,
  buenos,
  total,
}: {
  personaje: (typeof PERSONAJES)[keyof typeof PERSONAJES];
  recompensa: string;
  buenos: number;
  total: number;
}) {
  return (
    <div className="text-center">
      <Image
        src={personaje.imagen}
        alt={personaje.nombre}
        width={140}
        height={140}
        className="mx-auto h-36 w-36 object-contain"
      />
      <p className="mt-2 text-2xl font-extrabold text-llama">¡Lo lograste! 🎉</p>
      <p className="mt-1 text-carbon/70">{personaje.celebra}</p>

      <div className="mt-5 rounded-2xl bg-papel p-4">
        <p className="text-sm text-carbon/60">Ganaste la medalla</p>
        <p className="text-lg font-bold text-llama">🏅 {bonito(recompensa.replace(/^medalla_/, ""))}</p>
        <p className="mt-2 text-sm text-carbon/60">
          Aciertos al primer intento: {buenos} de {total}
        </p>
      </div>

      <Link
        href="/jugar"
        className="mt-6 block w-full rounded-2xl bg-fuego px-6 py-4 text-lg font-bold text-white transition hover:bg-llama"
      >
        Volver a las lecciones
      </Link>
    </div>
  );
}
