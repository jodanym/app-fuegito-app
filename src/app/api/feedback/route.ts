// Recibe las respuestas de la encuesta y las guarda en la tabla `feedback`.
// La encuesta es publica: cualquiera puede enviar (insert permitido por RLS).
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CAMPOS = [
  "quien",
  "nombre",
  "gusto",
  "mundo",
  "dificultad",
  "entendio",
  "personaje",
  "seguir",
  "edad",
  "ensena",
  "pagaria",
  "recomienda",
  "comentario",
] as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fila: Record<string, string> = {};
    for (const c of CAMPOS) {
      const v = body[c];
      // El comentario libre admite mas texto (es la data mas valiosa).
      const max = c === "comentario" ? 3000 : 600;
      if (typeof v === "string" && v.trim()) fila[c] = v.trim().slice(0, max);
    }

    const supabase = await createClient();
    const { error } = await supabase.from("feedback").insert(fila);
    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
