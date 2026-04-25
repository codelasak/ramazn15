import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Pano15 CORS proxy (sadece /api/v1/* uzerinde calisir).
 *
 * Next.js 16 ile middleware.ts -> proxy.ts olarak yeniden adlandirildi.
 * Capacitor mobil app tipik olarak iki originden istek atar:
 *   - iOS: capacitor://localhost
 *   - Android: https://localhost (server.androidScheme=https sayesinde)
 *
 * Web tarafindaki ayni-origin cagrilarda CORS zaten gerekmiyor; bu
 * proxy sadece /api/v1/* yolundaki yanitlara ek header ekler ve
 * preflight (OPTIONS) isteklerini cevaplar. NextAuth (/api/auth/*)
 * dokunulmaz.
 */

const ALLOWED_ORIGINS = new Set<string>([
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
  "https://localhost",
]);

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Requested-With,Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return headers;
}

export function proxy(req: NextRequest) {
  const origin = req.headers.get("origin");
  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const res = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders)) {
    res.headers.set(key, value);
  }
  return res;
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
