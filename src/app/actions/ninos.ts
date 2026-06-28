"use server";

// Acciones de servidor para ninos: crear, seleccionar, guardar perfil.
// Corren con la sesion del padre (RLS garantiza que solo toca SUS datos).
// PRIVACIDAD (PRD 10): del nino solo apodo y edad.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { paqueteParaEdad, COOKIE_NINO } from "@/lib/ninos";
import type { PerfilVector } from "@/lib/engine/motor";

export async function crearNino(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const apodo = String(formData.get("apodo") ?? "").trim();
  const edad = Number(formData.get("edad"));

  if (!apodo || apodo.length > 30 || !Number.isInteger(edad) || edad < 0 || edad > 12) {
    redirect("/onboarding?error=datos");
  }

  const { data: nino, error } = await supabase
    .from("children")
    .insert({ parent_id: user.id, apodo, edad, paquete: paqueteParaEdad(edad) })
    .select("id")
    .single();

  if (error || !nino) {
    redirect("/onboarding?error=guardar");
  }

  // Perfil inicial neutro (50 en cada eje); el quiz lo ajustara.
  await supabase.from("learner_profiles").insert({ child_id: nino.id });

  const c = await cookies();
  c.set(COOKIE_NINO, nino.id, { httpOnly: false, path: "/", maxAge: 60 * 60 * 24 * 365 });

  redirect("/onboarding/quiz");
}

export async function seleccionarNino(childId: string) {
  const c = await cookies();
  c.set(COOKIE_NINO, childId, { httpOnly: false, path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/jugar");
}

export async function guardarPerfil(childId: string, vector: PerfilVector) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("learner_profiles")
    .update({
      modalidad: vector.modalidad,
      entrada: vector.entrada,
      dinamica: vector.dinamica,
      ritmo: vector.ritmo,
      updated_at: new Date().toISOString(),
    })
    .eq("child_id", childId);

  redirect("/jugar");
}
