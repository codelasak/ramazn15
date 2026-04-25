import { NextResponse } from "next/server";
import { and, asc, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "../../../lib/db";
import {
  announcements,
  classSchedules,
  exams,
  mealMenus,
  studySessions,
} from "../../../lib/schema";
import { apiAuthErrorResponse, requireUser } from "../../../lib/api-auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);

    const now = new Date();
    const todayDow = now.getDay() || 7; // 1-7 (Mon-Sun)

    const userClassDigits = user.className?.replace(/\D/g, "") || null;

    const todaysSchedules = user.className
      ? await db
          .select()
          .from(classSchedules)
          .where(
            and(
              eq(classSchedules.dayOfWeek, todayDow),
              eq(classSchedules.className, user.className)
            )
          )
          .orderBy(asc(classSchedules.period))
      : [];

    const meals = await db
      .select()
      .from(mealMenus)
      .orderBy(desc(mealMenus.date))
      .limit(3);

    const latestAnnouncements = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt))
      .limit(3);

    const allStudySessions = await db
      .select()
      .from(studySessions)
      .orderBy(asc(studySessions.dayOfWeek), asc(studySessions.startTime));

    const upcomingExams = await db
      .select()
      .from(exams)
      .where(
        or(
          isNull(exams.className),
          userClassDigits ? eq(exams.className, userClassDigits) : undefined
        )
      )
      .orderBy(asc(exams.examDate));

    const dbUpcomingExam =
      upcomingExams.find((e) => e.examDate.getTime() > now.getTime()) ?? null;
    const upcomingExam = dbUpcomingExam
      ? {
          title: dbUpcomingExam.title,
          examType: dbUpcomingExam.examType,
          examDate: dbUpcomingExam.examDate.toISOString(),
          subject: dbUpcomingExam.subject ?? null,
        }
      : null;

    return NextResponse.json({
      meals,
      announcements: latestAnnouncements,
      upcomingExam,
      studySessions: allStudySessions.map((s) => ({
        ...s,
        updatedAt: s.updatedAt.toISOString(),
      })),
      schedules: todaysSchedules,
    });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
