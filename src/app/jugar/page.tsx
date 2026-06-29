// PANTALLA DE JUEGO (Fase 1) — estructura de MUNDOS por tema/personaje.
//  - Sin parametro: el nino ELIGE un mundo (una habilidad, con su personaje).
//    Fueguito recomienda el mundo menos practicado (equilibrio, PRD 6.2).
//  - Con ?mundo=<habilidad>: muestra el CAMINO de ese mundo, misiones de la
//    mas facil a la mas dificil (orden por unidad y leccion).
//  El mapa respeta el PAQUETE de edad del nino activo (Chispas/Brasas/Llamas).
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { PERSONAJES } from "@/lib/lessons/personajes";
import type { Habilidad, Paquete, Personaje } from "@/lib/lessons/schema";
import { getNinoActivoId, calcularRachaEscudo, COOKIE_PROGRESO_ANON } from "@/lib/ninos";

// Imagen del mundo: si existe el tile de marca en public/mundos/<archivo>.png
// lo usa; si no, usa la imagen del personaje como placeholder.
const ARCHIVO_MUNDO: Record<Habilidad, string> = {
  critica: "misterios",
  logica: "acertijos",
  resolucion: "retos",
};
function imagenMundo(habilidad: Habilidad): { src: string; esTile: boolean } {
  return { src: `/mundos/${ARCHIVO_MUNDO[habilidad]}.png`, esTile: true };
}

// Banner de los 3 personajes (cabecera de "Elige tu aventura").
function imagenBanner(): string {
  return "/fondos/banner.png";
}

// Fondo de escenario por mundo (estilo mapa de videojuego).
const FONDO_MUNDO: Record<Habilidad, string> = {
  critica: "mundo-critica",
  logica: "mundo-logica",
  resolucion: "mundo-resolucion",
};
function imagenFondoMundo(habilidad: Habilidad): string {
  return `/fondos/${FONDO_MUNDO[habilidad]}.png`;
}

// Fondo "hub" (mapa de los 3 mundos) de la pantalla de seleccion.
function imagenFondoHub(): string {
  return "/fondos/hub.png";
}

// Velo color "papel" sobre el fondo para que el texto siga legible.
function estiloFondo(src: string | null) {
  if (!src) return undefined;
  return {
    backgroundImage: `linear-gradient(rgba(255,246,236,0.62), rgba(255,246,236,0.86)), url(${src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };
}

type MundoMeta = {
  habilidad: Habilidad;
  titulo: string;
  subtitulo: string;
  emoji: string;
  personaje: Personaje;
  texto: string;
  ring: string;
  bg: string;
  barra: string;
  borde: string;
};

// Cada mundo = una habilidad, con su personaje "dueño" y su color de marca.
const MUNDOS: MundoMeta[] = [
  {
    habilidad: "critica",
    titulo: "Mundo de los Misterios",
    subtitulo: "Pensamiento crítico",
    emoji: "🔍",
    personaje: "desconocido",
    texto: "text-critica",
    ring: "ring-critica",
    bg: "bg-critica/10",
    barra: "bg-critica",
    borde: "border-critica",
  },
  {
    habilidad: "logica",
    titulo: "Mundo de los Acertijos",
    subtitulo: "Lógica",
    emoji: "🧩",
    personaje: "acidito",
    texto: "text-logica",
    ring: "ring-logica",
    bg: "bg-logica/10",
    barra: "bg-logica",
    borde: "border-logica",
  },
  {
    habilidad: "resolucion",
    titulo: "Mundo de los Retos",
    subtitulo: "Resolución de problemas",
    emoji: "🧭",
    personaje: "fueguito",
    texto: "text-resolucion",
    ring: "ring-resolucion",
    bg: "bg-resolucion/10",
    barra: "bg-resolucion",
    borde: "border-resolucion",
  },
];

// Orden de dificultad dentro de un mundo: por unidad y luego por leccion.
function clavesOrden(id: string) {
  const m = id.match(/-u(\d+)-l(\d+)$/);
  return { unidad: Number(m?.[1] ?? 0), leccion: Number(m?.[2] ?? 0) };
}
function ordenarMisiones<T extends { id: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const ca = clavesOrden(a.id);
    const cb = clavesOrden(b.id);
    return ca.unidad - cb.unidad || ca.leccion - cb.leccion;
  });
}

type LessonRow = { id: string; habilidad: string; objetivo: string; personaje: string };

export default async function JugarPage({
  searchParams,
}: {
  searchParams: Promise<{ mundo?: string }>;
}) {
  const { mundo } = await searchParams;
  const supabase = await createClient();

  // Modo admin (solo para el adulto dueño): desbloquea todas las misiones para
  // poder probar la dificultad de cualquier nivel. Se define por email en
  // ADMIN_EMAILS (.env.local). Para los niños, las misiones van bloqueadas en
  // orden (no puedes la 4 sin hacer la 1, 2 y 3).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const esAdmin = !!user?.email && adminEmails.includes(user.email.toLowerCase());

  // Nino activo: apodo, paquete de edad, racha y lecciones completadas.
  const childId = await getNinoActivoId();
  let apodo: string | null = null;
  let paquete: Paquete = "brasas";
  let racha = 0;
  let escudoActivo = true;
  const completadas = new Set<string>();
  if (childId) {
    const [{ data: nino }, { data: prog }] = await Promise.all([
      supabase.from("children").select("apodo, paquete").eq("id", childId).maybeSingle(),
      supabase
        .from("progress")
        .select("lesson_id, created_at")
        .eq("child_id", childId)
        .eq("completado", true),
    ]);
    apodo = nino?.apodo ?? null;
    if (nino?.paquete) paquete = nino.paquete as Paquete;
    const r = calcularRachaEscudo((prog ?? []).map((p) => p.created_at as string));
    racha = r.dias;
    escudoActivo = r.escudoActivo;
    for (const p of prog ?? []) completadas.add(p.lesson_id as string);
  } else {
    // Juego sin perfil (anonimo): el progreso vive en la cookie del navegador.
    const c = await cookies();
    const anon = c.get(COOKIE_PROGRESO_ANON)?.value ?? "";
    for (const id of anon.split(",").filter(Boolean)) completadas.add(id);
  }

  // Lecciones del paquete de edad del nino (Chispas / Brasas / Llamas).
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, habilidad, objetivo, personaje")
    .eq("paquete", paquete)
    .order("id");
  const todas = (lessons ?? []) as LessonRow[];

  const mundoSel = MUNDOS.find((m) => m.habilidad === mundo);

  // ---------- VISTA 1: camino de un mundo ----------
  if (mundoSel) {
    const misiones = ordenarMisiones(todas.filter((l) => l.habilidad === mundoSel.habilidad));
    const idxActual = misiones.findIndex((l) => !completadas.has(l.id));
    const fondo = imagenFondoMundo(mundoSel.habilidad);
    return (
      <main className="min-h-screen bg-papel px-4 py-6" style={estiloFondo(fondo)}>
        <div className="mx-auto max-w-md">
          <BarraSuperior apodo={apodo} racha={racha} escudoActivo={escudoActivo} esAdmin={esAdmin} volverA="/jugar" volverTexto="← Mundos" />

          <div className="mb-8 text-center">
            {(() => {
              const img = imagenMundo(mundoSel.habilidad);
              return (
                <Image
                  src={img.src}
                  alt={mundoSel.titulo}
                  width={140}
                  height={140}
                  className={`mx-auto h-32 w-32 rounded-3xl object-cover ${
                    img.esTile ? "shadow-md" : `${mundoSel.bg} object-contain p-2`
                  }`}
                />
              );
            })()}
            <h1 className={`mt-2 text-3xl font-extrabold ${mundoSel.texto}`}>
              {mundoSel.emoji} {mundoSel.titulo}
            </h1>
            <p className="text-carbon/60">con {PERSONAJES[mundoSel.personaje].nombre}</p>
          </div>

          {misiones.length === 0 && (
            <p className="text-center text-carbon/45">
              Este mundo aún no tiene misiones para este nivel.
            </p>
          )}

          <div className="relative">
            <div
              className={`absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 border-l-4 border-dashed ${mundoSel.borde} opacity-40`}
            />
            <ol className="relative space-y-8">
              {misiones.map((l, i) => {
                const lado = i % 2 === 0 ? "justify-start" : "justify-end";
                const hecha = completadas.has(l.id);
                const esActual = i === idxActual;
                // Bloqueada si va mas adelante de la actual (salvo modo admin).
                const bloqueada = !esAdmin && idxActual !== -1 && i > idxActual;
                // El personaje del MUNDO manda en el mapa (consistencia visual).
                const info = PERSONAJES[mundoSel.personaje];
                // Dificultad por posicion en el camino: 1 (facil) -> 3 (dificil).
                const tier =
                  i < misiones.length / 3 ? 1 : i < (2 * misiones.length) / 3 ? 2 : 3;

                const circulo = (
                  <div
                    className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md ring-4 ${
                      bloqueada ? "ring-humo" : mundoSel.ring
                    } ${esActual ? "scale-110" : ""} transition group-hover:scale-105 group-active:scale-95`}
                  >
                    {info && (
                      <Image
                        src={info.imagen}
                        alt={info.nombre}
                        width={80}
                        height={80}
                        className={`h-20 w-20 object-contain ${bloqueada ? "opacity-25 grayscale" : ""}`}
                      />
                    )}
                    <span
                      className={`absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold shadow ${
                        bloqueada ? "bg-humo text-carbon/50" : `${mundoSel.barra} text-white`
                      }`}
                    >
                      {i + 1}
                    </span>
                    {hecha && <span className="absolute -bottom-2 right-0 text-xl">✅</span>}
                    {bloqueada && <span className="absolute -bottom-2 right-0 text-xl">🔒</span>}
                  </div>
                );

                const etiqueta = (
                  <>
                    {esActual && (
                      <span className={`mt-2 rounded-full ${mundoSel.bg} px-3 py-0.5 text-xs font-bold ${mundoSel.texto}`}>
                        ¡Aquí vas!
                      </span>
                    )}
                    <p
                      className={`mt-2 text-sm font-bold ${
                        bloqueada ? "text-carbon/40" : "text-carbon/80"
                      }`}
                    >
                      {l.objetivo}
                    </p>
                    {!bloqueada && (
                      <div className="mt-1 flex justify-center gap-1" title={`Dificultad ${tier} de 3`}>
                        {[1, 2, 3].map((n) => (
                          <span
                            key={n}
                            className={`h-1.5 w-1.5 rounded-full ${n <= tier ? mundoSel.barra : "bg-humo"}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                );

                return (
                  <li key={l.id} className={`flex ${lado}`}>
                    {bloqueada ? (
                      <div className="flex w-40 flex-col items-center text-center">
                        {circulo}
                        {etiqueta}
                      </div>
                    ) : (
                      <Link
                        href={`/jugar/${l.id}`}
                        className="group flex w-40 flex-col items-center text-center"
                      >
                        {circulo}
                        {etiqueta}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-10 text-center">
            <Link href="/jugar" className="text-sm font-semibold text-fuego underline">
              Elegir otro mundo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ---------- VISTA 2: seleccion de mundos ----------
  // Progreso por mundo + recomendacion (el menos practicado con misiones pendientes).
  const resumen = MUNDOS.map((m) => {
    const delMundo = todas.filter((l) => l.habilidad === m.habilidad);
    const hechas = delMundo.filter((l) => completadas.has(l.id)).length;
    return { meta: m, total: delMundo.length, hechas };
  });
  let recomendado: Habilidad | null = null;
  const pendientes = resumen.filter((r) => r.total > 0 && r.hechas < r.total);
  if (pendientes.length > 0) {
    recomendado = pendientes.reduce((a, b) => (b.hechas < a.hechas ? b : a)).meta.habilidad;
  }

  return (
    <main className="min-h-screen bg-papel px-4 py-6" style={estiloFondo(imagenFondoHub())}>
      <div className="mx-auto max-w-md">
        <BarraSuperior apodo={apodo} racha={racha} escudoActivo={escudoActivo} esAdmin={esAdmin} />

        {(() => {
          // Banner de los 3 personajes arriba (vuelve como estaba antes).
          // El mapa de los 3 mundos (hub) va como fondo suave de la pantalla.
          const banner = imagenBanner();
          return banner ? (
            <Image
              src={banner}
              alt="Fueguito, Acidito y Desconocido"
              width={1360}
              height={768}
              priority
              className="mb-5 h-auto w-full rounded-2xl shadow-sm"
            />
          ) : null;
        })()}

        {childId && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
            <span className="text-2xl">🔥</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-carbon">
                Racha de {racha} {racha === 1 ? "día" : "días"}
              </p>
              <p className="text-xs text-carbon/60">
                {escudoActivo
                  ? "🛡️ El escudo de Fueguito te cuida si faltas un día."
                  : "🛡️ Tu escudo salvó la racha. ¡Vuelve mañana para recargarlo!"}
              </p>
            </div>
          </div>
        )}

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-llama">Elige tu aventura</h1>
          <p className="mt-1 text-carbon/60">
            ¿Qué quieres entrenar hoy{apodo ? `, ${apodo}` : ""}?
          </p>
        </div>

        {!childId && (
          <Link
            href="/onboarding"
            className="mb-6 block rounded-2xl bg-white p-4 text-center text-sm font-bold text-llama shadow-sm ring-1 ring-chispa/40"
          >
            👉 Crea el perfil de tu peque para guardar su progreso
          </Link>
        )}

        <div className="space-y-4">
          {resumen.map(({ meta, total, hechas }) => {
            const pct = total > 0 ? Math.round((hechas / total) * 100) : 0;
            const esRecomendado = meta.habilidad === recomendado;
            const img = imagenMundo(meta.habilidad);
            return (
              <Link
                key={meta.habilidad}
                href={`/jugar?mundo=${meta.habilidad}`}
                className={`block rounded-3xl bg-white p-4 shadow-md ring-2 transition hover:scale-[1.01] active:scale-[0.99] ${
                  esRecomendado ? meta.ring : "ring-transparent"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${img.esTile ? "" : meta.bg}`}>
                    <Image
                      src={img.src}
                      alt={meta.titulo}
                      width={80}
                      height={80}
                      className={img.esTile ? "h-full w-full object-cover" : "h-16 w-16 object-contain"}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta.emoji}</span>
                      <h2 className={`truncate text-lg font-extrabold ${meta.texto}`}>{meta.titulo}</h2>
                    </div>
                    <p className="text-sm text-carbon/60">{meta.subtitulo}</p>
                    {esRecomendado && (
                      <span className="mt-1 inline-block rounded-full bg-fuego/15 px-2 py-0.5 text-xs font-bold text-fuego">
                        🔥 Fueguito te recomienda este
                      </span>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-humo">
                        <div className={`h-2 rounded-full ${meta.barra}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-carbon/50">
                        {hechas}/{total}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm font-semibold text-fuego underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

function BarraSuperior({
  apodo,
  racha,
  escudoActivo = true,
  esAdmin = false,
  volverA,
  volverTexto,
}: {
  apodo: string | null;
  racha: number;
  escudoActivo?: boolean;
  esAdmin?: boolean;
  volverA?: string;
  volverTexto?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      {volverA ? (
        <Link href={volverA} className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-fuego shadow-sm">
          {volverTexto ?? "← Volver"}
        </Link>
      ) : (
        <Link href="/ninos" className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-llama shadow-sm">
          {apodo ? `👤 ${apodo}` : "Elegir perfil"}
        </Link>
      )}
      <div className="flex items-center gap-2">
        {esAdmin && (
          <span
            title="Modo admin: todas las misiones desbloqueadas para probar"
            className="rounded-full bg-noche px-2 py-1.5 text-xs font-bold text-white shadow-sm"
          >
            🛠️ admin
          </span>
        )}
        <span
          title={
            escudoActivo
              ? "Escudo de Fueguito: te protege si faltas un día"
              : "Tu escudo se usó para salvar la racha"
          }
          className={`rounded-full bg-white px-2 py-1.5 text-sm shadow-sm ${escudoActivo ? "" : "opacity-40 grayscale"}`}
        >
          🛡️
        </span>
        <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-llama shadow-sm">
          🔥 {racha}
        </span>
        <Link href="/padres" className="text-sm font-semibold text-carbon/45">
          Adultos 🔒
        </Link>
      </div>
    </div>
  );
}
