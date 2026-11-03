import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('ℹ No DATABASE_URL found in environment.');
    console.log('Using persistent local JSON database (server/data/db.json).');
    console.log('To migrate to Supabase / PostgreSQL, set DATABASE_URL in .env and run this script.');
    return;
  }

  console.log('Connecting to PostgreSQL database...');
  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log('Connected successfully!');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Executing schema DDL migrations...');
    await client.query(sql);

    console.log('Tables, indexes, and constraints successfully created in PostgreSQL!');
    client.release();
  } catch (err: any) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
