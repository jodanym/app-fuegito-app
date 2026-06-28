"use server";

// Acciones de la zona del padre: definir PIN, verificar PIN, salir.
// El acceso a la zona requiere sesion del padre + PIN correcto (PRD 5.6).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_PIN, hashPin } from "@/lib/padres";

const OCHO_HORAS = 60 * 60 * 8;

export async function definirPin(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const pin = String(formData.get("pin") ?? "").trim();
  if (!/^\d{4}$/.test(pin)) redirect("/padres?error=pin_formato");

  await supabase.from("parents").update({ pin_hash: hashPin(pin) }).eq("id", user.id);

  const c = await cookies();
  c.set(COOKIE_PIN, "1", { httpOnly: true, path: "/", maxAge: OCHO_HORAS });
  redirect("/padres");
}

export async function verificarPin(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const pin = String(formData.get("pin") ?? "").trim();
  const { data } = await supabase
    .from("parents")
    .select("pin_hash")
    .eq("id", user.id)
    .maybeSingle();

  if (data?.pin_hash && data.pin_hash === hashPin(pin)) {
    const c = await cookies();
    c.set(COOKIE_PIN, "1", { httpOnly: true, path: "/", maxAge: OCHO_HORAS });
    redirect("/padres");
  }
  redirect("/padres?error=pin_incorrecto");
}

export async function salirZonaPadre() {
  const c = await cookies();
  c.delete(COOKIE_PIN);
  redirect("/jugar");
}
