import { SignJWT, jwtVerify } from "jose";

/**
 * Pano15 mobile + web icin paylasilan JWT yardimcilari.
 *
 * Sir: NEXTAUTH_SECRET (mevcut) ya da JWT_SECRET. Production'da en az
 * 32 karakter olmali. Algoritma: HS256.
 */

export const JWT_ALG = "HS256" as const;
export const JWT_ISSUER = "pano15";
export const JWT_AUDIENCE_MOBILE = "pano15-mobile";

const ACCESS_TOKEN_TTL = "30d"; // Mobil oturumlar uzun olsun.
const REFRESH_TOKEN_TTL = "180d";

export interface Pano15TokenClaims {
  sub: string; // user.id
  role: "student" | "admin";
  email: string;
  name: string;
  className?: string | null;
  department?: "teknoloji_fen" | "fen_sosyal" | "hazirlik" | null;
  isBoarder?: boolean;
  profileImageUrl?: string | null;
  typ?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}

function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!raw) {
    throw new Error(
      "JWT_SECRET (veya NEXTAUTH_SECRET) ortam degiskeni tanimli degil."
    );
  }
  if (raw.length < 16) {
    throw new Error("JWT secret cok kisa, en az 16 karakter olmali.");
  }
  return new TextEncoder().encode(raw);
}

export async function signAccessToken(
  claims: Omit<Pano15TokenClaims, "iat" | "exp" | "iss" | "aud">
): Promise<string> {
  const secret = getSecret();
  const payload: Record<string, unknown> = { ...claims };
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE_MOBILE)
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .setSubject(claims.sub)
    .sign(secret);
}

export async function signRefreshToken(userId: string): Promise<string> {
  const secret = getSecret();
  return await new SignJWT({ typ: "refresh" })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE_MOBILE)
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .setSubject(userId)
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<Pano15TokenClaims> {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE_MOBILE,
  });
  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Token sub claim eksik veya gecersiz.");
  }
  return payload as unknown as Pano15TokenClaims;
}
