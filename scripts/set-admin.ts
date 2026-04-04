import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { db } from "../app/lib/db";
import { users } from "../app/lib/schema";
import { eq } from "drizzle-orm";

async function main() {
  await db.update(users).set({ role: "admin" }).where(eq(users.email, "eshagh@fennaver.com"));
  console.log("Admin role set!");
  process.exit(0);
}
main();
