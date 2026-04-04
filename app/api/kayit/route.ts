import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "../../lib/db";
import { users } from "../../lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, className, department, isBoarder } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "İsim, e-posta ve şifre gereklidir." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "student",
        className: className || null,
        department: department || null,
        isBoarder: isBoarder ?? false,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    return NextResponse.json(
      { message: "Kayıt başarılı!", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
