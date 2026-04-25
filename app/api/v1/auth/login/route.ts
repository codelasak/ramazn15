import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../../../lib/db";
import { users } from "../../../../lib/schema";
import { signAccessToken, signRefreshToken } from "../../../../lib/jwt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve sifre zorunlu." },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "E-posta veya sifre hatali." },
        { status: 401 }
      );
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "E-posta veya sifre hatali." },
        { status: 401 }
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

    return NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        className: user.className,
        department: user.department,
        isBoarder: user.isBoarder,
        profileImageUrl: user.profileImageUrl,
        targetUniversity: user.targetUniversity,
        targetNet: user.targetNet,
      },
    });
  } catch (err) {
    console.error("[/api/v1/auth/login] error:", err);
    return NextResponse.json(
      { error: "Giris sirasinda hata olustu." },
      { status: 500 }
    );
  }
}
