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
import BotonAudio from "@/components/audio/BotonAudio";
import { guardarProgreso } from "@/app/actions/progreso";
import Confeti from "@/components/ui/Confeti";
import { sonarAcierto, sonarLogro } from "@/lib/ui/celebracion";

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
  medalla = null,
}: {
  leccion: Leccion;
  modoNombre: ModoLeccion;
  medalla?: string | null;
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

  // El audio SOLO suena al tocar la bocina (feedback de testers: nada de voz
  // automatica). Al cambiar de paso o reto se corta cualquier voz pendiente.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [pasoIdx, retoIdx]);

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
    <main className="flex min-h-screen flex-col items-center bg-papel px-4 py-6">
      <div className="mb-6 flex w-full max-w-lg gap-1.5">
        {Array.from({ length: totalSegmentos }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 rounded-full ${i <= segmentoActual ? "bg-fuego" : "bg-chispa/30"}`}
          />
        ))}
      </div>

      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-lg">
        {paso === "gancho" && (
          <div className="text-center">
            <span className="inline-block rounded-full bg-chispa/25 px-4 py-1 text-sm font-bold uppercase tracking-wide text-llama">
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
              <p className="text-xl font-medium text-carbon">{gancho}</p>
              <BotonAudio texto={gancho} personaje={leccion.personaje} />
            </div>
            <button
              onClick={avanzar}
              className="mt-6 w-full rounded-2xl bg-fuego px-6 py-4 text-lg font-bold text-white transition hover:bg-llama active:scale-[0.98]"
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
            medalla={medalla}
            habilidad={leccion.habilidad}
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

// Baraja un arreglo (Fisher-Yates). Evita que la respuesta correcta siga un
// patron predecible (feedback de testers: "siempre era la primera opcion").
function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
    sonarAcierto(); // campanita corta; sin voz automatica
  }
  function fallar() {
    setHuboError(true);
    setAviso(pista ? `Casi... pista: ${pista}` : "Casi... ¡prueba otra vez! 💪");
  }

  return (
    <div>
      <p className="mb-1 text-sm font-bold text-fuego/70">
        Reto {numero} de {total}
      </p>
      <div className="mb-5 flex items-start gap-2">
        <p className="text-lg font-medium text-carbon">{reto.enunciado}</p>
        <BotonAudio texto={reto.enunciado} personaje={personaje} />
      </div>

      {estado === "jugando" && (
        <>
          <Interaccion reto={reto} onAcierto={acertar} onError={fallar} />
          {aviso && (
            <p className="mt-4 text-center text-sm font-bold text-fuego">{aviso}</p>
          )}
        </>
      )}

      {estado === "bien" && (
        <div className="relative text-center">
          <Confeti />
          <div className="rounded-2xl bg-resolucion/10 p-4 text-resolucion">
            <p className="text-2xl font-bold">¡Correcto! ✅</p>
            <p className="mt-1 text-sm text-carbon/70">{celebra}</p>
          </div>
          <button
            onClick={() => onResuelto(!huboError)}
            className="mt-6 w-full rounded-2xl bg-fuego px-6 py-4 text-lg font-bold text-white transition hover:bg-llama"
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
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-papel p-4">
        {secuencia.map((s, i) => (
          <span
            key={i}
            className={`flex h-14 w-14 items-center justify-center rounded-xl text-3xl ${
              s === "❓" ? "border-2 border-dashed border-fuego bg-white" : "bg-white shadow-sm"
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
  // Orden aleatorio, estable mientras dura el reto.
  const barajadas = useMemo(() => mezclar(opciones), [opciones]);

  function elegir(op: Opcion) {
    if (op.valor === correcta) onAcierto();
    else {
      setErrada(op.valor);
      onError();
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {barajadas.map((op) => (
        <button
          key={op.valor}
          onClick={() => elegir(op)}
          className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-4 transition active:scale-95 ${
            errada === op.valor
              ? "border-fuego bg-chispa/25"
              : "border-chispa bg-white hover:border-fuego hover:bg-papel"
          }`}
        >
          <span className="text-4xl">{op.emoji}</span>
          <span className="text-sm font-semibold text-carbon/80">{op.texto ?? bonito(op.valor)}</span>
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
      <div className="mb-5 space-y-3 rounded-2xl bg-papel p-4">
        <div className="flex items-center justify-center gap-3 text-3xl">
          <span>{par1.a}</span> <span className="text-fuego/70">→</span> <span>{par1.b}</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-3xl">
          <span>{par2.a}</span> <span className="text-fuego/70">→</span>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-fuego bg-white text-fuego">
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
  // Orden aleatorio de los items (evita el patron hecho/opinion alternado).
  const barajados = useMemo(() => mezclar(items), [items]);
  const completo = barajados.every((_, i) => asign[i]);

  function comprobar() {
    const ok = barajados.every((it, i) => asign[i] === it.categoria);
    if (ok) onAcierto();
    else onError();
  }

  return (
    <div className="space-y-3">
      {barajados.map((it, i) => (
        <div key={i} className="flex items-center justify-between rounded-2xl border border-chispa/50 p-3">
          <span className="flex items-center gap-2 text-lg">
            <span className="text-3xl">{it.emoji}</span>
            <span className="font-medium text-carbon">{bonito(it.texto)}</span>
          </span>
          <div className="flex gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setAsign((a) => ({ ...a, [i]: cat }))}
                className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
                  asign[i] === cat
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
      <button
        onClick={comprobar}
        disabled={!completo}
        className="mt-2 w-full rounded-2xl bg-fuego px-6 py-4 text-lg font-bold text-white transition hover:bg-llama disabled:opacity-40"
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
      <p className="text-sm font-bold uppercase tracking-wide text-fuego/70">
        Escucha y lee
      </p>
      <p className="mt-4 rounded-2xl bg-papel px-4 py-6 text-2xl font-bold text-carbon">
        {texto}
      </p>
      <div className="mt-3 flex justify-center">
        <BotonAudio texto={texto} personaje={personaje} grande />
      </div>
      <button
        onClick={onNext}
        className="mt-6 w-full rounded-2xl bg-fuego px-6 py-4 text-lg font-bold text-white transition hover:bg-llama"
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
  medalla,
  habilidad,
  buenos,
  total,
}: {
  personaje: (typeof PERSONAJES)[keyof typeof PERSONAJES];
  personajeId: import("@/lib/lessons/schema").Personaje;
  recompensa: string;
  medalla?: string | null;
  habilidad: string;
  buenos: number;
  total: number;
}) {
  useEffect(() => {
    sonarLogro(); // arpegio corto; la voz solo con la bocina
  }, []);

  return (
    <div className="relative text-center">
      <Confeti cantidad={44} />
      <Image
        src={personaje.imagen}
        alt={personaje.nombre}
        width={140}
        height={140}
        className="mx-auto h-36 w-36 object-contain"
      />
      <p className="mt-2 text-2xl font-extrabold text-llama">¡Lo lograste! 🎉</p>
      <div className="mt-1 flex items-center justify-center gap-2">
        <p className="text-carbon/70">{personaje.celebra}</p>
        <BotonAudio texto={personaje.celebra} personaje={personajeId} />
      </div>
      <div className="mt-5 rounded-2xl bg-papel p-4">
        <p className="text-sm text-carbon/60">Ganaste la medalla</p>
        {medalla ? (
          <Image
            src={medalla}
            alt={bonito(recompensa.replace(/^medalla_/, ""))}
            width={96}
            height={96}
            className="mx-auto mt-1 h-20 w-20 object-contain"
          />
        ) : null}
        <p className="text-lg font-bold text-llama">
          {medalla ? "" : "🏅 "}
          {bonito(recompensa.replace(/^medalla_/, ""))}
        </p>
        <p className="mt-2 text-sm text-carbon/60">
          Aciertos al primer intento: {buenos} de {total}
        </p>
      </div>
      <Link
        href={`/jugar?mundo=${habilidad}`}
        className="mt-6 block w-full rounded-2xl bg-fuego px-6 py-4 text-lg font-bold text-white transition hover:bg-llama"
      >
        Siguiente misión 🔥
      </Link>
      <Link href="/jugar" className="mt-3 block text-sm font-semibold text-carbon/45 underline">
        Elegir otro mundo
      </Link>
    </div>
  );
}
