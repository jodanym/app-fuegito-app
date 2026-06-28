// Endpoint: GET /api/lessons/[id]
// Devuelve UNA leccion completa, incluyendo su contenido (los 5 momentos y modos).
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, paquete, habilidad, objetivo, personaje, content")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Leccion no encontrada" }, { status: 404 });
  }

  return NextResponse.json(data);
}
