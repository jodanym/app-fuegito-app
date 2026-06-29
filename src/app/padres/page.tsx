// ZONA DEL PADRE (PRD 5.6). Protegida por sesion + PIN.
// Muestra progreso por habilidad, racha y "como aprende mi hijo" en lenguaje
// humano (no tecnico). Gestion de suscripcion enlazada.
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_PIN } from "@/lib/padres";
import { definirPin, verificarPin, salirZonaPadre } from "@/app/actions/padres";
import { calcularRacha } from "@/lib/ninos";
import { arquetipoDe } from "@/lib/onboarding/perfiles";

const HAB_LABEL: Record<string, string> = {
  logica: "Lógica",
  critica: "Pensamiento crítico",
  resolucion: "Resolución de problemas",
};

const HAB_BARRA: Record<string, string> = {
  logica: "bg-logica",
  critica: "bg-critica",
  resolucion: "bg-resolucion",
};

interface Perfil {
  child_id: string;
  modalidad: number;
  entrada: number;
  dinamica: number;
  ritmo: number;
}

function describePerfil(p?: Perfil): string {
  if (!p) return "Aún estamos conociendo cómo aprende.";
  const frases: string[] = [];
  frases.push(p.modalidad < 45 ? "le gustan las actividades con las manos" : p.modalidad > 55 ? "prefiere lo digital e interactivo" : "combina lo manual y lo digital");
  frases.push(p.entrada < 45 ? "aprende mejor escuchando" : p.entrada > 55 ? "disfruta leer por su cuenta" : "mezcla escuchar y leer");
  frases.push(p.dinamica < 45 ? "se engancha con las historias" : p.dinamica > 55 ? "se motiva con retos y puntos" : "le gustan historias y retos");
  frases.push(p.ritmo < 45 ? "va con calma" : p.ritmo > 55 ? "le gusta ir rápido" : "lleva un ritmo equilibrado");
  return "A tu peque " + frases.join(", ") + ".";
}

export default async function PadresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: padre } = await supabase
    .from("parents")
    .select("pin_hash")
    .eq("id", user.id)
    .maybeSingle();

  const c = await cookies();
  const pinOk = c.get(COOKIE_PIN)?.value === "1";

  // --- Caso 1: aun no hay PIN -> definirlo ---
  if (!padre?.pin_hash) {
    return (
      <PinShell titulo="Crea tu PIN de adulto" subtitulo="4 dígitos para entrar a esta zona. Será tu barrera contra manitas curiosas.">
        <form action={definirPin} className="space-y-4">
          <PinInput />
          {error && <p className="text-center text-sm font-medium text-fuego">El PIN debe tener 4 dígitos.</p>}
          <BotonPin>Guardar PIN</BotonPin>
        </form>
      </PinShell>
    );
  }

  // --- Caso 2: hay PIN pero no verificado en esta sesion -> pedirlo ---
  if (!pinOk) {
    return (
      <PinShell titulo="Zona de adultos" subtitulo="Escribe tu PIN para continuar.">
        <form action={verificarPin} className="space-y-4">
          <PinInput />
          {error && <p className="text-center text-sm font-medium text-fuego">PIN incorrecto. Intenta de nuevo.</p>}
          <BotonPin>Entrar</BotonPin>
        </form>
        <div className="mt-4 text-center">
          <Link href="/jugar" className="text-sm text-carbon/45 underline">Volver al juego</Link>
        </div>
      </PinShell>
    );
  }

  // --- Caso 3: acceso concedido -> dashboard ---
  const [{ data: ninos }, { data: perfiles }, { data: maestrias }, { data: progresos }, { data: subs }] =
    await Promise.all([
      supabase.from("children").select("id, apodo, edad, paquete").order("created_at"),
      supabase.from("learner_profiles").select("child_id, modalidad, entrada, dinamica, ritmo"),
      supabase.from("skill_mastery").select("child_id, habilidad, maestria"),
      supabase.from("progress").select("child_id, completado, tiempo_segundos, created_at").eq("completado", true),
      supabase.from("subscriptions").select("tier, estado").limit(1),
    ]);

  const tier = subs?.[0]?.tier ?? "free";

  return (
    <main className="min-h-screen bg-papel px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-carbon">Panel de adultos</h1>
          <form action={salirZonaPadre}>
            <button className="text-sm text-carbon/45 underline">Salir</button>
          </form>
        </div>

        {/* Suscripcion */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm text-carbon/60">Plan actual</p>
            <p className="text-lg font-bold text-carbon">
              {tier === "premium" ? "Premium ✨" : "Gratis"}
            </p>
          </div>
          <Link
            href="/padres/suscripcion"
            className="rounded-xl bg-fuego px-4 py-2 text-sm font-bold text-white hover:bg-llama"
          >
            {tier === "premium" ? "Gestionar" : "Mejorar"}
          </Link>
        </div>

        {/* Por cada nino */}
        <div className="space-y-5">
          {(ninos ?? []).map((n) => {
            const perfil = perfiles?.find((p) => p.child_id === n.id) as Perfil | undefined;
            const arq = perfil ? arquetipoDe(perfil) : null;
            const masDeNino = (maestrias ?? []).filter((m) => m.child_id === n.id);
            const progDeNino = (progresos ?? []).filter((p) => p.child_id === n.id);
            const racha = calcularRacha(progDeNino.map((p) => p.created_at as string));
            const totalLecc = progDeNino.length;
            const totalMin = Math.round(
              progDeNino.reduce((a, p) => a + (p.tiempo_segundos ?? 0), 0) / 60
            );

            return (
              <div key={n.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-carbon">{n.apodo}</p>
                  <span className="text-sm text-carbon/45">{n.edad} años</span>
                </div>

                <div className="mb-4 flex gap-4 text-center">
                  <Stat valor={`🔥 ${racha}`} label="racha (días)" />
                  <Stat valor={`${totalLecc}`} label="lecciones" />
                  <Stat valor={`${totalMin}m`} label="tiempo" />
                </div>

                {/* Barras de maestria por habilidad */}
                <div className="space-y-2">
                  {["logica", "critica", "resolucion"].map((hab) => {
                    const m = masDeNino.find((x) => x.habilidad === hab)?.maestria ?? 0;
                    return (
                      <div key={hab}>
                        <div className="flex justify-between text-xs text-carbon/60">
                          <span>{HAB_LABEL[hab]}</span>
                          <span>{m}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-humo">
                          <div
                            className={`h-2.5 rounded-full ${HAB_BARRA[hab] ?? "bg-fuego"}`}
                            style={{ width: `${m}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {arq ? (
                  <div className={`mt-4 rounded-xl ${arq.bg} p-3`}>
                    <p className={`text-sm font-bold ${arq.color}`}>
                      {arq.emoji} {arq.nombre}
                    </p>
                    <p className="mt-1 text-sm text-carbon/70">{arq.padre}</p>
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl bg-papel p-3 text-sm text-carbon/70">
                    💡 {describePerfil(perfil)}
                  </p>
                )}
              </div>
            );
          })}

          {(!ninos || ninos.length === 0) && (
            <p className="text-center text-carbon/45">
              Aún no hay perfiles de niños. <Link href="/onboarding" className="text-fuego underline">Crear uno</Link>.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function Stat({ valor, label }: { valor: string; label: string }) {
  return (
    <div className="flex-1 rounded-xl bg-papel py-2">
      <p className="text-lg font-bold text-carbon">{valor}</p>
      <p className="text-xs text-carbon/45">{label}</p>
    </div>
  );
}

function PinShell({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-papel p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        <p className="text-center text-4xl">🔒</p>
        <h1 className="mt-2 text-center text-xl font-extrabold text-carbon">{titulo}</h1>
        <p className="mb-6 mt-1 text-center text-sm text-carbon/60">{subtitulo}</p>
        {children}
      </div>
    </main>
  );
}

function PinInput() {
  return (
    <input
      name="pin"
      inputMode="numeric"
      pattern="\d{4}"
      maxLength={4}
      required
      placeholder="••••"
      className="w-full rounded-xl border-2 border-humo px-4 py-3 text-center text-2xl tracking-[0.5em] text-carbon focus:border-fuego focus:outline-none"
    />
  );
}

function BotonPin({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full rounded-xl bg-noche px-4 py-3 font-bold text-white transition hover:opacity-90"
    >
      {children}
    </button>
  );
}
