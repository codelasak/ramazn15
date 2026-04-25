import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../lib/db";
import { users } from "../../../../lib/schema";
import { signAccessToken, signRefreshToken, verifyToken } from "../../../../lib/jwt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body.refreshToken === "string" ? body.refreshToken : "";

    if (!token) {
      return NextResponse.json(
        { error: "refreshToken zorunlu." },
        { status: 400 }
      );
    }

    let claims;
    try {
      claims = await verifyToken(token);
    } catch {
      return NextResponse.json(
        { error: "Refresh token gecersiz veya suresi dolmus." },
        { status: 401 }
      );
    }

    if (claims.typ !== "refresh") {
      return NextResponse.json(
        { error: "Bu token refresh icin uygun degil." },
        { status: 401 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, claims.sub))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Kullanici bulunamadi." },
        { status: 404 }
      );
    }

    const accessToken = await signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      className: user.className,
      department: user.department,
      isBoarder: user.isBoarder,
      profileImageUrl: user.profileImageUrl,
    });
    const refreshToken = await signRefreshToken(user.id);

    return NextResponse.json({ accessToken, refreshToken });
  } catch (err) {
    console.error("[/api/v1/auth/refresh] error:", err);
    return NextResponse.json(
      { error: "Refresh sirasinda hata olustu." },
      { status: 500 }
    );
  }
}
