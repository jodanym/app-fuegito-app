// Pagina protegida: solo se ve con sesion iniciada. Si no hay sesion,
// redirige al login. Sirve para comprobar que el login funciona (Fase 0).
// (El dashboard real de padres con PIN y progreso llega en la Fase 1.)
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function cerrarSesion() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-orange-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-orange-600">Sesion iniciada</h1>
        <p className="mt-2 text-gray-600">
          Hola, <strong>{user.email}</strong>
        </p>
        <p className="mt-4 text-sm text-gray-400">
          (Esta es una pagina de prueba de la Fase 0. El panel real del padre se
          construye en la Fase 1.)
        </p>
        <form action={cerrarSesion} className="mt-6">
          <button
            type="submit"
            className="rounded-lg bg-gray-800 px-4 py-2 font-semibold text-white transition hover:bg-gray-900"
          >
            Cerrar sesion
          </button>
        </form>
      </div>
    </main>
  );
}
