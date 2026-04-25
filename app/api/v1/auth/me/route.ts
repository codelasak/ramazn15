import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../lib/db";
import { users } from "../../../../lib/schema";
import { apiAuthErrorResponse, requireUser } from "../../../../lib/api-auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    return NextResponse.json({ user });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}

interface PatchBody {
  name?: string;
  isBoarder?: boolean;
  targetUniversity?: string | null;
  targetNet?: number | string | null;
  profileImageUrl?: string | null;
}

export async function PATCH(req: Request) {
  try {
    const me = await requireUser(req);
    const body = (await req.json().catch(() => ({}))) as PatchBody;

    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (body.name !== undefined) {
      const trimmed = String(body.name).trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Isim bos olamaz." }, { status: 400 });
      }
      update.name = trimmed;
    }

    if (body.isBoarder !== undefined) {
      update.isBoarder = body.isBoarder === true;
    }

    if (body.targetUniversity !== undefined) {
      const t = body.targetUniversity == null ? null : String(body.targetUniversity).trim();
      update.targetUniversity = t || null;
    }

    if (body.targetNet !== undefined) {
      if (body.targetNet === null || body.targetNet === "") {
        update.targetNet = null;
      } else {
        const parsed = typeof body.targetNet === "number"
          ? body.targetNet
          : parseFloat(String(body.targetNet));
        if (Number.isNaN(parsed)) {
          return NextResponse.json({ error: "targetNet sayi olmali." }, { status: 400 });
        }
        const capped = Math.min(Math.max(parsed, 0), 560);
        update.targetNet = capped.toFixed(2);
      }
    }

    if (body.profileImageUrl !== undefined) {
      update.profileImageUrl = body.profileImageUrl || null;
    }

    const [updated] = await db
      .update(users)
      .set(update)
      .where(eq(users.id, me.id))
      .returning();

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        className: updated.className,
        department: updated.department,
        isBoarder: updated.isBoarder,
        profileImageUrl: updated.profileImageUrl,
        targetUniversity: updated.targetUniversity,
        targetNet: updated.targetNet,
      },
    });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
