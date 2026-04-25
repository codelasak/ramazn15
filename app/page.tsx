import AppShell from "./shell/AppShell";
import DashboardScreen from "./screens/DashboardScreen";
import { db } from "./lib/db";
import { mealMenus, announcements, exams, users, studySessions, classSchedules } from "./lib/schema";
import { desc, eq, asc, or, isNull, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  let userClassName: string | null = null;
  let isBoarder = false;
  
  if (session?.user?.id) {
    const [dbUser] = await db.select().from(users).where(eq(users.id, session.user.id));
    if (dbUser) {
      userClassName = dbUser.className?.replace(/\D/g, "") || null;
      isBoarder = dbUser.isBoarder;
    }
  }
  
  const now = new Date();
  const todayDayOfWeek = now.getDay() || 7; // 1-7 (Mon-Sun)
  
  // Fetch today's class schedules if user has a class
  let todaysSchedules: any[] = [];
  const fullClassName = session?.user?.id ? (await db.select({ className: users.className }).from(users).where(eq(users.id, session.user.id)))[0]?.className : null;
  if (fullClassName) {
    todaysSchedules = await db.select()
      .from(classSchedules)
      .where(
        and(
          eq(classSchedules.dayOfWeek, todayDayOfWeek),
          eq(classSchedules.className, fullClassName)
        )
      )
      .orderBy(asc(classSchedules.period));
  }
  
  const meals = await db.select().from(mealMenus).orderBy(desc(mealMenus.date)).limit(3);
  const latestAnnouncements = await db.select().from(announcements).orderBy(desc(announcements.createdAt)).limit(3);

  // Fetch all study sessions (weekly schedule)
  const allStudySessions = await db.select()
    .from(studySessions)
    .orderBy(asc(studySessions.dayOfWeek), asc(studySessions.startTime));
  
  // Serialize to avoid Date serialization issues with client components
  const todaysStudySessions = allStudySessions.map(s => ({
    ...s,
    updatedAt: s.updatedAt.toISOString(),
  }));
  const upcomingExams = await db
    .select()
    .from(exams)
    .where(
      or(
        isNull(exams.className),
        userClassName ? eq(exams.className, userClassName) : undefined
      )
    )
    .orderBy(asc(exams.examDate));

  // Find the closest one in the future
  const dbUpcomingExam = upcomingExams.find(e => e.examDate.getTime() > now.getTime()) || null;
  const upcomingExam = dbUpcomingExam ? {
    title: dbUpcomingExam.title,
    examType: dbUpcomingExam.examType,
    examDate: dbUpcomingExam.examDate.toISOString(),
    subject: dbUpcomingExam.subject ?? null,
  } : null;

  return (
    <AppShell>
      <DashboardScreen 
        meals={meals} 
        announcements={latestAnnouncements} 
        upcomingExam={upcomingExam} 
        studySessions={todaysStudySessions} 
        schedules={todaysSchedules}
      />
    </AppShell>
  );
}
