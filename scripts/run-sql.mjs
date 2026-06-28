// Ejecuta un archivo .sql contra la base de datos de Supabase.
// Uso: node scripts/run-sql.mjs <ruta-al-sql>
// Lee la conexion desde la variable de entorno DATABASE_URL (en .env.local).
import { readFileSync } from "node:fs";
import { Client } from "pg";

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("Falta la ruta al archivo .sql");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Falta DATABASE_URL en el entorno (.env.local)");
  process.exit(1);
}

const sql = readFileSync(sqlPath, "utf8");

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Supabase usa SSL
});

try {
  await client.connect();
  await client.query(sql);
  console.log("OK: SQL ejecutado correctamente.");
} catch (err) {
  console.error("ERROR al ejecutar SQL:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
