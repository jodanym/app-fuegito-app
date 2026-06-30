// Acceso de adultos — TEMPORALMENTE sin envio de correos.
// Se quito el login por enlace magico para no enviar correos transaccionales
// (evitar rebotes que ponen en riesgo el plan gratis de Supabase). El juego
// funciona sin cuenta: el progreso se guarda en el navegador. El acceso de
// padres volvera mas adelante con un proveedor de correo propio.
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-papel p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lg">
        <p className="text-5xl">🔥</p>
        <h1 className="mt-2 text-2xl font-extrabold text-llama">Cuentas de adulto</h1>
        <p className="mt-3 text-carbon/70">
          Estamos preparando el acceso para padres (guardar progreso entre
          dispositivos, reportes y suscripción). ¡Muy pronto!
        </p>
        <p className="mt-4 rounded-2xl bg-papel p-3 text-sm text-carbon/70">
          Mientras tanto, los niños pueden <b>jugar y avanzar sin cuenta</b> — el
          progreso se guarda en este dispositivo. 🎮
        </p>
        <Link
          href="/jugar"
          className="mt-6 inline-block rounded-2xl bg-fuego px-6 py-3 font-display font-bold text-white transition hover:bg-llama"
        >
          Ir a jugar
        </Link>
      </div>
    </main>
  );
}
