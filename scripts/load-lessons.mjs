// Carga las lecciones JSON de content/lessons/ en la tabla public.lessons.
// Hace UPSERT: si la leccion ya existe (mismo id), la actualiza.
// Uso: DATABASE_URL=... node scripts/load-lessons.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const DIR = "content/lessons";
const PAQUETES = ["chispas", "brasas", "llamas"];
const HABILIDADES = ["logica", "critica", "resolucion"];

function validar(l) {
  const e = [];
  if (!l.id) e.push("falta id");
  if (!PAQUETES.includes(l.paquete)) e.push("paquete invalido");
  if (!HABILIDADES.includes(l.habilidad)) e.push("habilidad invalida");
  if (!l.objetivo) e.push("falta objetivo");
  if (!l.lectura?.texto) e.push("falta lectura.texto");
  if (!l.modos || Object.keys(l.modos).length === 0) e.push("sin modos");
  if (!l.recompensa) e.push("falta recompensa");
  return e;
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
let ok = 0;
for (const f of files) {
  const leccion = JSON.parse(readFileSync(join(DIR, f), "utf8"));
  const errores = validar(leccion);
  if (errores.length) {
    console.error(`X ${f}: ${errores.join(", ")}`);
    continue;
  }
  await client.query(
    `insert into public.lessons (id, paquete, habilidad, objetivo, personaje, content)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (id) do update set
       paquete = excluded.paquete,
       habilidad = excluded.habilidad,
       objetivo = excluded.objetivo,
       personaje = excluded.personaje,
       content = excluded.content`,
    [
      leccion.id,
      leccion.paquete,
      leccion.habilidad,
      leccion.objetivo,
      leccion.personaje ?? null,
      leccion,
    ]
  );
  console.log(`OK ${f} -> ${leccion.id}`);
  ok++;
}

console.log(`\n${ok}/${files.length} lecciones cargadas.`);

// Sincronizar: borrar de la base las lecciones que ya no estan en la carpeta.
const idsCarpeta = files.map((f) => f.replace(/\.json$/, ""));
const { rows: enBase } = await client.query("select id from public.lessons");
const huerfanas = enBase.map((r) => r.id).filter((id) => !idsCarpeta.includes(id));
if (huerfanas.length > 0) {
  await client.query("delete from public.lessons where id = any($1)", [huerfanas]);
  console.log(`Eliminadas ${huerfanas.length} lecciones viejas: ${huerfanas.join(", ")}`);
}

await client.end();
