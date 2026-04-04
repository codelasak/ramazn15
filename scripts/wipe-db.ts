import { neon } from "@neondatabase/serverless";
import "dotenv/config";

async function wipeDB() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Dropping all tables and types...");

  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
  await sql`GRANT ALL ON SCHEMA public TO neondb_owner`;
  await sql`GRANT ALL ON SCHEMA public TO public`;

  console.log("Database wiped successfully!");
}

wipeDB().catch(console.error);
