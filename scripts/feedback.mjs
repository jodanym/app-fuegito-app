// Muestra las respuestas de la encuesta de feedback (tabla `feedback`).
// Uso (PowerShell):  $env:DATABASE_URL="..."; node scripts/feedback.mjs
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const total = (await client.query("select count(*)::int as n from public.feedback")).rows[0].n;
console.log(`\n=== Encuesta de feedback: ${total} respuesta(s) ===`);

async function dist(col, label) {
  const { rows } = await client.query(
    `select ${col} as v, count(*)::int as n from public.feedback where ${col} is not null and ${col} <> '' group by ${col} order by n desc`
  );
  if (!rows.length) return;
  console.log(`\n${label}:`);
  for (const r of rows) console.log(`  ${String(r.n).padStart(3)}x  ${r.v}`);
}

await dist("quien", "¿Quién respondió?");
await dist("gusto", "¿Le gustó jugar?");
await dist("mundo", "Mundo favorito");
await dist("dificultad", "Dificultad de las misiones");
await dist("personaje", "Personaje favorito");
await dist("seguir", "¿Seguiría jugando?");
await dist("edad", "Edad ideal");
await dist("ensena", "¿Ayuda a pensar?");
await dist("pagaria", "¿Pagaría suscripción?");
await dist("recomienda", "¿Recomendaría?");

const com = await client.query(
  "select nombre, comentario, to_char(created_at,'MM-DD HH24:MI') as cuando from public.feedback where comentario is not null and comentario <> '' order by created_at desc"
);
if (com.rows.length) {
  console.log("\n=== Comentarios ===");
  for (const r of com.rows) console.log(`  [${r.cuando}] (${r.nombre || "anónimo"}) ${r.comentario}`);
}

await client.end();
