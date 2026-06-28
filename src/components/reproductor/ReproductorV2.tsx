"use client";

// =====================================================================
// REPRODUCTOR V2 — retos VISUALES de verdad + AUDIO por personaje.
// Cada leccion SIEMPRE muestra desafios en pantalla (no "Listo" vacio).
// Tipos de reto: patron_visual, cual_no_encaja, analogia, clasificar, ordenar.
// La lectura se integra con audio (escucha y lee), no es un paso vacio.
// Refuerzo positivo, sin castigo (PRD 5.1).
// =====================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Leccion, ModoLeccion, Reto } from "@/lib/lessons/schema";
import { PERSONAJES } from "@/lib/lessons/personajes";
import BotonAudio, { hablar } from "@/components/audio/BotonAudio";
import { guardarProgreso } from "@/app/actions/progreso";

interface Opcion {
  emoji: string;
  valor: string;
  texto?: string;
}

type Paso = "gancho" | "retos" | "lectura" | "recompensa";
const ORDEN: Paso[] = ["gancho", "retos", "lectura", "recompensa"];

export default function ReproductorV2({
  leccion,
  modoNombre,
}: {
  leccion: Leccion;
  modoNombre: ModoLeccion;
}) {
  const personaje = PERSONAJES[leccion.personaje];
  const retos = useMemo(
    () => leccion.modos.interactivo?.retos ?? Object.values(leccion.modos)[0]?.retos ?? [],
    [leccion]
  );
  const gancho = leccion.modos.interactivo?.gancho ?? leccion.objetivo;

  const [pasoIdx, setPasoIdx] = useState(0);
  const [retoIdx, setRetoIdx] = useState(0);
  const [buenos, setBuenos] = useState(0);
  const paso = ORDEN[pasoIdx];
  const avanzar = () => setPasoIdx((p) => Math.min(p + 1, ORDEN.length - 1));

  // Audio del gancho al entrar (ayuda a quien no lee).
  useEffect(() => {
    if (paso === "gancho") {
      const t = setTimeout(() => hablar(gancho, leccion.personaje), 400);
      return () => clearTimeout(t);
    }
  }, [paso, gancho, leccion.personaje]);

  function onResuelto(primerIntento: boolean) {
    if (primerIntento) setBuenos((b) => b + 1);
    if (retoIdx + 1 < retos.length) setRetoIdx((i) => i + 1);
    else avanzar();
  }

  // Guardar progreso al llegar a la recompensa.
  const guardado = useRef(false);
  useEffect(() => {
    if (paso === "recompensa" && !guardado.current) {
      guardado.current = true;
      const total = retos.length || 1;
      const resultado = Math.round((buenos / total) * 100);
      guardarProgreso({
        lessonId: leccion.id,
        habilidad: leccion.habilidad,
        modo: modoNombre,
        resultado,
      }).catch(() => {});
    }
  }, [paso, buenos, retos.length, leccion, modoNombre]);

  // barra de progreso: gancho + un punto por reto + lectura + recompensa
  const totalSegmentos = retos.length + 3;
  const segmentoActual =
    paso === "gancho" ? 0 : paso === "retos" ? 1 + retoIdx : paso === "lectura" ? 1 + retos.length : totalSegmentos;

  return (
    <main className="flex min-h-screen flex-col items-center bg-orange-50 px-4 py-6">
      <div className="mb-6 flex w-full max-w-lg gap-1.5">
        {Array.from({ length: totalSegmentos }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${i <= segmentoActual ? "bg-orange-500" : "bg-orange-200"}`}
          />
        ))}
      </div>

      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-lg">
        {paso === "gancho" && (
          <div className="text-center">
            <span className="inline-block rounded-full bg-orange-100 px-4 py-1 text-sm font-bold uppercase tracking-wide text-orange-600">
              🎯 Tu misión
            </span>
            <Image
              src={personaje.imagen}
              alt={personaje.nombre}
              width={150}
              height={150}
              className="mx-auto mt-4 h-36 w-36 object-contain"
              priority
            />
            <div className="mt-3 flex items-center justify-center gap-2">
              <p className="text-xl font-medium text-gray-800">{gancho}</p>
              <BotonAudio texto={gancho} personaje={leccion.personaje} />
            </div>
            <button
              onClick={avanzar}
              className="mt-6 w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-orange-600 active:scale-[0.98]"
            >
              ¡Vamos! 🔥
            </button>
          </div>
        )}

        {paso === "retos" && retos.length > 0 && (
          <RetoVisual
            key={retoIdx}
            reto={retos[retoIdx]}
            numero={retoIdx + 1}
            total={retos.length}
            personaje={leccion.personaje}
            celebra={personaje.celebra}
            onResuelto={onResuelto}
          />
        )}

        {paso === "lectura" && (
          <Lectura
            texto={leccion.lectura.texto}
            personaje={leccion.personaje}
            onNext={avanzar}
          />
        )}

        {paso === "recompensa" && (
          <Recompensa
            personaje={personaje}
            personajeId={leccion.personaje}
            recompensa={leccion.recompensa}
            buenos={buenos}
            total={retos.length}
          />
        )}
      </div>
    </main>
  );
}

// ---------------- Texto bonito ----------------
function bonito(s: string): string {
  const t = s.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// ---------------- Un reto (cualquier tipo) ----------------
function RetoVisual({
  reto,
  numero,
  total,
  personaje,
  celebra,
  onResuelto,
}: {
  reto: Reto;
  numero: number;
  total: number;
  personaje: import("@/lib/lessons/schema").Personaje;
  celebra: string;
  onResuelto: (primerIntento: boolean) => void;
}) {
  const [estado, setEstado] = useState<"jugando" | "bien">("jugando");
  const [huboError, setHuboError] = useState(false);
  const [aviso, setAviso] = useState("");
  const d = (reto.datos ?? {}) as Record<string, unknown>;
  const pista = typeof d.pista === "string" ? d.pista : "";

  function acertar() {
    setEstado("bien");
    hablar("¡Correcto!", personaje);
  }
  function fallar() {
    setHuboError(true);
    setAviso(pista ? `Casi... pista: ${pista}` : "Casi... ¡prueba otra vez! 💪");
  }

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-orange-400">
        Reto {numero} de {total}
      </p>
      <div className="mb-5 flex items-start gap-2">
        <p className="text-lg font-medium text-gray-800">{reto.enunciado}</p>
        <BotonAudio texto={reto.enunciado} personaje={personaje} />
      </div>

      {estado === "jugando" && (
        <>
          <Interaccion reto={reto} onAcierto={acertar} onError={fallar} />
          {aviso && (
            <p className="mt-4 text-center text-sm font-medium text-amber-600">{aviso}</p>
          )}
        </>
      )}

      {estado === "bien" && (
        <div className="text-center">
          <div className="rounded-2xl bg-green-50 p-4 text-green-700">
            <p className="text-2xl font-bold">¡Correcto! ✅</p>
            <p className="mt-1 text-sm">{celebra}</p>
          </div>
          <button
            onClick={() => onResuelto(!huboError)}
            className="mt-6 w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------- Selector por tipo ----------------
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

  switch (reto.tipo as string) {
    case "patron_visual":
      return (
        <PatronVisual
          secuencia={(d.secuencia as string[]) ?? []}
          opciones={(d.opciones as Opcion[]) ?? []}
          correcta={d.correcta as string}
          onAcierto={onAcierto}
          onError={onError}
        />
      );
    case "cual_no_encaja":
      return (
        <Opciones
          opciones={(d.opciones as Opcion[]) ?? []}
          correcta={d.correcta as string}
          onAcierto={onAcierto}
          onError={onError}
        />
      );
    case "analogia":
      return (
        <Analogia
          par1={d.par1 as { a: string; b: string }}
          par2={d.par2 as { a: string; b: string }}
          opciones={(d.opciones as Opcion[]) ?? []}
          correcta={d.correcta as string}
          onAcierto={onAcierto}
          onError={onError}
        />
      );
    case "clasificar":
      return (
        <Clasificar
          items={(d.items as { emoji: string; texto: string; categoria: string }[]) ?? []}
          categorias={(d.categorias as string[]) ?? []}
          onAcierto={onAcierto}
          onError={onError}
        />
      );
    default:
      return (
        <Opciones
          opciones={(d.opciones as Opcion[]) ?? []}
          correcta={d.correcta as string}
          onAcierto={onAcierto}
          onError={onError}
        />
      );
  }
}

// ---------------- Patron visual ----------------
function PatronVisual({
  secuencia,
  opciones,
  correcta,
  onAcierto,
  onError,
}: {
  secuencia: string[];
  opciones: Opcion[];
  correcta: string;
  onAcierto: () => void;
  onError: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-orange-50 p-4">
        {secuencia.map((s, i) => (
          <span
            key={i}
            className={`flex h-14 w-14 items-center justify-center rounded-xl text-3xl ${
              s === "❓" ? "border-2 border-dashed border-orange-400 bg-white" : "bg-white shadow-sm"
            }`}
          >
            {s}
          </span>
        ))}
      </div>
      <Opciones opciones={opciones} correcta={correcta} onAcierto={onAcierto} onError={onError} />
    </div>
  );
}

// ---------------- Opciones (emoji grandes) ----------------
function Opciones({
  opciones,
  correcta,
  onAcierto,
  onError,
}: {
  opciones: Opcion[];
  correcta: string;
  onAcierto: () => void;
  onError: () => void;
}) {
  const [errada, setErrada] = useState<string | null>(null);

  function elegir(op: Opcion) {
    if (op.valor === correcta) onAcierto();
    else {
      setErrada(op.valor);
      onError();
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {opciones.map((op) => (
        <button
          key={op.valor}
          onClick={() => elegir(op)}
          className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-4 transition active:scale-95 ${
            errada === op.valor
              ? "border-amber-400 bg-amber-50"
              : "border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50"
          }`}
        >
          <span className="text-4xl">{op.emoji}</span>
          <span className="text-sm font-semibold text-gray-700">{op.texto ?? bonito(op.valor)}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------- Analogia ----------------
function Analogia({
  par1,
  par2,
  opciones,
  correcta,
  onAcierto,
  onError,
}: {
  par1: { a: string; b: string };
  par2: { a: string; b: string };
  opciones: Opcion[];
  correcta: string;
  onAcierto: () => void;
  onError: () => void;
}) {
  return (
    <div>
      <div className="mb-5 space-y-3 rounded-2xl bg-orange-50 p-4">
        <div className="flex items-center justify-center gap-3 text-3xl">
          <span>{par1.a}</span> <span className="text-orange-400">→</span> <span>{par1.b}</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-3xl">
          <span>{par2.a}</span> <span className="text-orange-400">→</span>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-orange-400 bg-white text-orange-500">
            ❓
          </span>
        </div>
      </div>
      <Opciones opciones={opciones} correcta={correcta} onAcierto={onAcierto} onError={onError} />
    </div>
  );
}

// ---------------- Clasificar (arrastrar = tocar item, luego caja) ----------------
function Clasificar({
  items,
  categorias,
  onAcierto,
  onError,
}: {
  items: { emoji: string; texto: string; categoria: string }[];
  categorias: string[];
  onAcierto: () => void;
  onError: () => void;
}) {
  const [asign, setAsign] = useState<Record<number, string>>({});
  const completo = items.every((_, i) => asign[i]);

  function comprobar() {
    const ok = items.every((it, i) => asign[i] === it.categoria);
    if (ok) onAcierto();
    else onError();
  }

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="flex items-center justify-between rounded-2xl border border-orange-100 p-3">
          <span className="flex items-center gap-2 text-lg">
            <span className="text-3xl">{it.emoji}</span>
            <span className="font-medium text-gray-800">{bonito(it.texto)}</span>
          </span>
          <div className="flex gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setAsign((a) => ({ ...a, [i]: cat }))}
                className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
                  asign[i] === cat
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-orange-200 bg-white text-gray-700 hover:bg-orange-50"
                }`}
              >
                {bonito(cat)}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={comprobar}
        disabled={!completo}
        className="mt-2 w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-orange-600 disabled:opacity-40"
      >
        Comprobar
      </button>
    </div>
  );
}

// ---------------- Lectura (con audio: escucha y lee) ----------------
function Lectura({
  texto,
  personaje,
  onNext,
}: {
  texto: string;
  personaje: import("@/lib/lessons/schema").Personaje;
  onNext: () => void;
}) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-400">
        Escucha y lee
      </p>
      <p className="mt-4 rounded-2xl bg-orange-50 px-4 py-6 text-2xl font-bold text-gray-800">
        {texto}
      </p>
      <div className="mt-3 flex justify-center">
        <BotonAudio texto={texto} personaje={personaje} grande />
      </div>
      <button
        onClick={onNext}
        className="mt-6 w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
      >
        Continuar
      </button>
    </div>
  );
}

// ---------------- Recompensa ----------------
function Recompensa({
  personaje,
  personajeId,
  recompensa,
  buenos,
  total,
}: {
  personaje: (typeof PERSONAJES)[keyof typeof PERSONAJES];
  personajeId: import("@/lib/lessons/schema").Personaje;
  recompensa: string;
  buenos: number;
  total: number;
}) {
  useEffect(() => {
    const t = setTimeout(() => hablar(personaje.celebra, personajeId), 300);
    return () => clearTimeout(t);
  }, [personaje.celebra, personajeId]);

  return (
    <div className="text-center">
      <Image
        src={personaje.imagen}
        alt={personaje.nombre}
        width={140}
        height={140}
        className="mx-auto h-36 w-36 object-contain"
      />
      <p className="mt-2 text-2xl font-extrabold text-orange-600">¡Lo lograste! 🎉</p>
      <p className="mt-1 text-gray-600">{personaje.celebra}</p>
      <div className="mt-5 rounded-2xl bg-orange-50 p-4">
        <p className="text-sm text-gray-500">Ganaste la medalla</p>
        <p className="text-lg font-bold text-orange-600">
          🏅 {bonito(recompensa.replace(/^medalla_/, ""))}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Aciertos al primer intento: {buenos} de {total}
        </p>
      </div>
      <Link
        href="/jugar"
        className="mt-6 block w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
      >
        Volver al mapa
      </Link>
    </div>
  );
}
