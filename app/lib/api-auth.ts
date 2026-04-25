import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./schema";
import { verifyToken, type Pano15TokenClaims } from "./jwt";

/**
 * Pano15 REST endpoint'leri icin Authorization header'dan JWT okuyan
 * yardimcilar. NextAuth ile karistirma; bu layer sadece /api/v1/* altindaki
 * yeni mobil-uyumlu endpoint'ler icin kullaniliyor.
 */

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  className: string | null;
  department: "teknoloji_fen" | "fen_sosyal" | "hazirlik" | null;
  isBoarder: boolean;
  profileImageUrl: string | null;
};

export class ApiAuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
    this.name = "ApiAuthError";
  }
}

function readBearer(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export async function requireUser(req: Request): Promise<ApiUser> {
  const token = readBearer(req);
  if (!token) throw new ApiAuthError("Authorization header eksik.");

  let claims: Pano15TokenClaims;
  try {
    claims = await verifyToken(token);
  } catch {
    throw new ApiAuthError("Token gecersiz veya suresi dolmus.");
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, claims.sub))
    .limit(1);

  if (!dbUser) {
    throw new ApiAuthError("Kullanici bulunamadi.", 404);
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    className: dbUser.className,
    department: dbUser.department,
    isBoarder: dbUser.isBoarder,
    profileImageUrl: dbUser.profileImageUrl,
  };
}

export async function requireRole(
  req: Request,
  role: "student" | "admin"
): Promise<ApiUser> {
  const user = await requireUser(req);
  if (role === "admin" && user.role !== "admin") {
    throw new ApiAuthError("Bu islem icin yetkiniz yok.", 403);
  }
  return user;
}

export function apiAuthErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[api-auth] unexpected error:", err);
  return NextResponse.json(
    { error: "Sunucu hatasi olustu." },
    { status: 500 }
  );
}
