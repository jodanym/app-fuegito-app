"use client";

// Pantalla de login del PADRE (adulto). Pide el email y envia un enlace magico.
// El nino nunca inicia sesion ni introduce datos: la cuenta es del adulto.
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado" | "error">("idle");
  const [mensaje, setMensaje] = useState("");
  const [avisoEnlace, setAvisoEnlace] = useState("");

  // Si el padre llega aqui desde un enlace vencido o invalido, el error viene
  // en la direccion (ya sea como ?error=... o como #error=...). Lo detectamos
  // para mostrar un aviso claro en vez de dejarlo con la duda.
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hayError =
      query.get("error") ||
      hash.get("error") ||
      hash.get("error_code");
    if (hayError) {
      setAvisoEnlace(
        "Ese enlace ya expiro o no es valido (caducan en ~1 hora y son de un solo uso). Pide uno nuevo aqui abajo."
      );
      // Limpiamos la direccion para que el aviso no quede pegado al recargar.
      window.history.replaceState(null, "", "/login");
    }
  }, []);

  async function enviarEnlace(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    setMensaje("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setEstado("error");
      setMensaje(error.message);
    } else {
      setEstado("enviado");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-orange-600">
          Universo de Fueguito
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Acceso para adultos. Te enviaremos un enlace a tu correo.
        </p>

        {estado === "enviado" ? (
          <div className="rounded-lg bg-green-50 p-4 text-center text-green-700">
            <p className="font-semibold">Revisa tu correo</p>
            <p className="mt-1 text-sm">
              Te enviamos un enlace a <strong>{email}</strong>. Ábrelo para entrar.
            </p>
          </div>
        ) : (
          <form onSubmit={enviarEnlace} className="space-y-4">
            {avisoEnlace && (
              <p className="rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-700">
                {avisoEnlace}
              </p>
            )}
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-orange-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={estado === "enviando"}
              className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {estado === "enviando" ? "Enviando..." : "Enviar enlace de acceso"}
            </button>
            {estado === "error" && (
              <p className="text-center text-sm text-red-600">{mensaje}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
