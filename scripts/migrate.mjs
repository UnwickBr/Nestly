// Applies sql/schema.sql to the database at DATABASE_URL.
// Usage: DATABASE_URL=... node scripts/migrate.mjs
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '..', 'sql', 'schema.sql');

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(schemaPath, 'utf-8')
  .split('\n')
  .filter(line => !line.trim().startsWith('--'))
  .join('\n');

const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

for (const stmt of statements) {
  console.log('Running:', stmt.slice(0, 70).replace(/\s+/g, ' '), '...');
  await sql.query(stmt);
}

const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`;
console.log('Tables now in public schema:', tables.map(t => t.table_name));
