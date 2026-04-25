import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Stateless JWT auth: server-side logout no-op. Mobil tarafta
 * Capacitor Preferences'tan token silinir. Ileride blacklist eklenirse
 * burasi ele alir.
 */
export async function POST() {
  return NextResponse.json({ ok: true });
}
