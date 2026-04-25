import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../lib/db";
import {
  users,
  announcements,
  mealMenus,
  classSchedules,
  exams,
  events,
} from "../../../../lib/schema";
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

// Apple App Store Guideline 5.1.1(v) — kullanici, hesabini ve iliskili
// verilerini app icinden kalici olarak silebilmeli.
//
// Akis:
//   1) Bu kullanicinin createdBy referansi olan tablolarda createdBy=null
//      yap (admin hesabi silindiginde foreign key blocku olmasin).
//   2) users tablosundan satiri sil. mock_exam_results.userId ON DELETE
//      CASCADE oldugu icin bu kullanicinin tum deneme sonuclari da silinir.
export async function DELETE(req: Request) {
  try {
    const me = await requireUser(req);

    await db
      .update(announcements)
      .set({ createdBy: null })
      .where(eq(announcements.createdBy, me.id));
    await db
      .update(mealMenus)
      .set({ createdBy: null })
      .where(eq(mealMenus.createdBy, me.id));
    await db
      .update(classSchedules)
      .set({ createdBy: null })
      .where(eq(classSchedules.createdBy, me.id));
    await db.update(exams).set({ createdBy: null }).where(eq(exams.createdBy, me.id));
    await db.update(events).set({ createdBy: null }).where(eq(events.createdBy, me.id));

    await db.delete(users).where(eq(users.id, me.id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
