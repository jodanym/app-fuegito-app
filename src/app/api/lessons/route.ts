// Endpoint: GET /api/lessons
// Devuelve la lista de lecciones (metadatos). Filtros opcionales:
//   ?paquete=brasas   ?habilidad=logica
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paquete = searchParams.get("paquete");
  const habilidad = searchParams.get("habilidad");

  const supabase = await createClient();
  let query = supabase
    .from("lessons")
    .select("id, paquete, habilidad, objetivo, personaje")
    .order("id");

  if (paquete) query = query.eq("paquete", paquete);
  if (habilidad) query = query.eq("habilidad", habilidad);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ total: data.length, lessons: data });
}
