import { NextResponse } from "next/server";
import { asc, eq, or } from "drizzle-orm";
import { db } from "../../../lib/db";
import { classSchedules } from "../../../lib/schema";
import { apiAuthErrorResponse, requireUser } from "../../../lib/api-auth";

export const runtime = "nodejs";

// Admin tarafi sinif adlarini bazen "12-A" bazen "12A" formatinda saklayabilir.
// Bu fonksiyon her iki varyanti da uretip query'de OR ile arar.
function classNameVariants(name: string | null): string[] {
  if (!name) return [];
  const stripped = name.replace(/[\s-]/g, "");
  const m = stripped.match(/^(\d+)([A-Za-z])$/);
  const variants = new Set<string>();
  variants.add(name);
  variants.add(stripped);
  if (m) {
    variants.add(`${m[1]}-${m[2].toUpperCase()}`);
    variants.add(`${m[1]}${m[2].toUpperCase()}`);
  }
  return Array.from(variants);
}

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const variants = classNameVariants(user.className);

    if (variants.length === 0) {
      return NextResponse.json({ className: null, schedules: [] });
    }

    const conditions = variants.map((v) => eq(classSchedules.className, v));
    const where = conditions.length === 1 ? conditions[0] : or(...conditions);

    const rows = await db
      .select()
      .from(classSchedules)
      .where(where)
      .orderBy(asc(classSchedules.dayOfWeek), asc(classSchedules.period));

    return NextResponse.json({
      className: user.className,
      schedules: rows.map((r) => ({
        id: r.id,
        dayOfWeek: r.dayOfWeek,
        period: r.period,
        subject: r.subject,
        teacherName: r.teacherName,
        room: r.room,
      })),
    });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
