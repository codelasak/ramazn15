/**
 * Pano15 dashboard payload tipleri.
 *
 * /api/v1/dashboard endpoint'inin client tarafinda kullandigi sekilleri
 * tek yerde tutar; DashboardScreen ve page.tsx ayni tipi paylasir.
 */

export type MealRow = {
  id: string;
  mealType: "kahvalti" | "ogle" | "aksam";
  date: string;
  items: string;
};

export type AnnouncementRow = {
  id: string;
  category: string;
  title: string;
  content: string;
  createdAt: string | Date;
};

export type StudySessionRow = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject?: string | null;
  location?: string | null;
};

export type ClassScheduleRow = {
  id: string;
  period: number;
  subject: string;
  teacherName?: string | null;
  room?: string | null;
};

export type UpcomingExam = {
  title: string;
  examType: string;
  examDate: string;
  subject: string | null;
};

export interface DashboardData {
  meals: MealRow[];
  announcements: AnnouncementRow[];
  upcomingExam: UpcomingExam | null;
  studySessions: StudySessionRow[];
  schedules: ClassScheduleRow[];
}
