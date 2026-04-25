import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "../../../../lib/db";
import { mockExamResults } from "../../../../lib/schema";
import { apiAuthErrorResponse, requireUser } from "../../../../lib/api-auth";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "id zorunlu." }, { status: 400 });
    }
    await db
      .delete(mockExamResults)
      .where(
        and(
          eq(mockExamResults.id, id),
          eq(mockExamResults.userId, user.id)
        )
      );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
