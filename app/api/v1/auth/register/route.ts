import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../../../lib/db";
import { users } from "../../../../lib/schema";
import { signAccessToken, signRefreshToken } from "../../../../lib/jwt";

export const runtime = "nodejs";

const DEPARTMENTS = ["teknoloji_fen", "fen_sosyal", "hazirlik"] as const;
type Department = typeof DEPARTMENTS[number];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const className = typeof body.className === "string" ? body.className.trim() : null;
    const department: Department | null = DEPARTMENTS.includes(body.department)
      ? body.department
      : null;
    const isBoarder = body.isBoarder === true;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Isim, e-posta ve sifre zorunlu." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Sifre en az 6 karakter olmali." },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta zaten kayitli." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "student",
        className,
        department,
        isBoarder,
      })
      .returning();

    const accessToken = await signAccessToken({
      sub: created.id,
      role: created.role,
      email: created.email,
      name: created.name,
      className: created.className,
      department: created.department,
      isBoarder: created.isBoarder,
      profileImageUrl: created.profileImageUrl,
    });
    const refreshToken = await signRefreshToken(created.id);

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: {
          id: created.id,
          name: created.name,
          email: created.email,
          role: created.role,
          className: created.className,
          department: created.department,
          isBoarder: created.isBoarder,
          profileImageUrl: created.profileImageUrl,
          targetUniversity: created.targetUniversity,
          targetNet: created.targetNet,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/v1/auth/register] error:", err);
    return NextResponse.json(
      { error: "Kayit sirasinda hata olustu." },
      { status: 500 }
    );
  }
}
