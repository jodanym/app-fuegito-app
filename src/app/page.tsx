// Pagina de inicio (provisional de Fase 1). Entrada simple al juego y al
// acceso de adultos. El onboarding real (bienvenida + quiz) llega mas adelante.
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-papel px-4 text-center">
      <Image
        src="/personajes/fueguito.png"
        alt="Fueguito"
        width={180}
        height={180}
        className="h-44 w-44 object-contain"
        priority
      />
      <h1 className="font-display text-5xl font-extrabold text-llama">Universo de Fueguito</h1>
      <p className="max-w-sm text-lg text-carbon/70">
        Juega, piensa y crece con Fueguito, Desconocido y Acidito.
      </p>

      <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/jugar"
          className="rounded-2xl bg-fuego px-6 py-4 text-lg font-display font-bold text-white shadow-sm transition hover:bg-llama active:scale-[0.98]"
        >
          Empezar a jugar 🔥
        </Link>
        <Link
          href="/login"
          className="rounded-2xl border-2 border-chispa bg-white px-6 py-3 font-display font-semibold text-fuego transition hover:bg-chispa/20"
        >
          Soy adulto / Mi cuenta
        </Link>
      </div>
    </main>
  );
}
