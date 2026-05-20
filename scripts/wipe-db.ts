import "dotenv/config";
import { Pool } from "pg";

async function wipeDB() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  console.log("Dropping all tables and types...");

  await pool.query("DROP SCHEMA public CASCADE");
  await pool.query("CREATE SCHEMA public");
  await pool.query("GRANT ALL ON SCHEMA public TO public");

  await pool.end();
  console.log("Database wiped successfully!");
}

wipeDB().catch(console.error);
