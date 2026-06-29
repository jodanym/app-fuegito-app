// Muestra estadisticas de uso reales desde la base de datos (Supabase).
// Uso (en Windows PowerShell):
//   $env:DATABASE_URL="...="; node scripts/estadisticas.mjs
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

async function uno(sql) {
  const { rows } = await client.query(sql);
  return rows[0] ? Object.values(rows[0])[0] : 0;
}

const padres = await uno("select count(*) from public.parents");
const ninos = await uno("select count(*) from public.children");
const completadas = await uno("select count(*) from public.progress where completado = true");
const ninosActivos = await uno("select count(distinct child_id) from public.progress where completado = true");
const hoy = await uno("select count(*) from public.progress where completado = true and created_at >= now() - interval '1 day'");
const semana = await uno("select count(*) from public.progress where completado = true and created_at >= now() - interval '7 days'");
const ultima = await uno("select coalesce(to_char(max(created_at), 'YYYY-MM-DD HH24:MI'), 'sin actividad') from public.progress where completado = true");

console.log("\n=== Uso del Universo de Fueguito ===");
console.log(`Padres registrados:        ${padres}`);
console.log(`Perfiles de ninos:         ${ninos}`);
console.log(`Ninos que han jugado:      ${ninosActivos}`);
console.log(`Lecciones completadas:     ${completadas}`);
console.log(`  - en las ultimas 24h:    ${hoy}`);
console.log(`  - en los ultimos 7 dias: ${semana}`);
console.log(`Ultima actividad:          ${ultima}`);

// Top: lecciones mas jugadas
const { rows: top } = await client.query(
  "select lesson_id, count(*)::int as veces from public.progress where completado = true group by lesson_id order by veces desc limit 5"
);
if (top.length) {
  console.log("\nLecciones mas completadas:");
  for (const t of top) console.log(`  ${t.veces}x  ${t.lesson_id}`);
}

await client.end();
