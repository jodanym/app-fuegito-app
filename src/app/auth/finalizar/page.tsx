"use client";

// Pagina a la que llega el enlace magico (flujo implicito). El navegador trae
// la sesion en el propio enlace; el cliente de Supabase la detecta sola, la
// guarda en cookies y de ahi pasamos a elegir perfil. Funciona ENTRE
// dispositivos (no necesita el mismo navegador que pidio el enlace).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FinalizarPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Al crear el cliente, detecta la sesion del enlace automaticamente.
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (session) router.replace("/ninos");
    });

    // Por si la sesion ya quedo lista al cargar.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/ninos");
      } else {
        // Damos un margen; si no aparece, el enlace no era valido.
        const t = setTimeout(() => setError(true), 4000);
        return () => clearTimeout(t);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-papel p-6 text-center">
      <p className="text-5xl">🔥</p>
      {error ? (
        <>
          <p className="text-lg font-bold text-llama">Ese enlace no funcionó.</p>
          <p className="max-w-xs text-carbon/70">
            Puede que ya se haya usado o vencido. Pide uno nuevo.
          </p>
          <a href="/login" className="font-semibold text-fuego underline">
            Volver a intentar
          </a>
        </>
      ) : (
        <p className="text-lg font-bold text-carbon/70">Entrando a tu cuenta...</p>
      )}
    </main>
  );
}
