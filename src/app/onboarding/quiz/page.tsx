// Onboarding paso 2: quiz de perfilado. Lee el nino activo y su edad y lanza
// el quiz interactivo.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNinoActivoId } from "@/lib/ninos";
import QuizCliente from "./QuizCliente";

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const childId = await getNinoActivoId();
  if (!childId) redirect("/onboarding");

  const { data: nino } = await supabase
    .from("children")
    .select("apodo, edad")
    .eq("id", childId)
    .maybeSingle();

  if (!nino) redirect("/onboarding");

  return <QuizCliente childId={childId} apodo={nino.apodo} edad={nino.edad} />;
}
