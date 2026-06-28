import { Client } from "pg";
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

const tables = await client.query(`
  select t.tablename,
         t.rowsecurity as rls,
         (select count(*) from pg_policies p where p.schemaname='public' and p.tablename=t.tablename) as policies
  from pg_tables t
  where t.schemaname='public'
  order by t.tablename;
`);
console.log("TABLAS EN public:");
for (const r of tables.rows) {
  console.log(`  - ${r.tablename.padEnd(18)} RLS=${r.rls ? "ON " : "OFF"} politicas=${r.policies}`);
}

const enums = await client.query(`
  select t.typname, string_agg(e.enumlabel, ', ' order by e.enumsortorder) as valores
  from pg_type t join pg_enum e on e.enumtypid = t.oid
  group by t.typname order by t.typname;
`);
console.log("\nENUMS:");
for (const r of enums.rows) console.log(`  - ${r.typname}: ${r.valores}`);

const trig = await client.query(`
  select tgname from pg_trigger where tgname = 'on_auth_user_created';
`);
console.log("\nTRIGGER auto-crear padre:", trig.rows.length ? "OK (existe)" : "FALTA");

await client.end();
