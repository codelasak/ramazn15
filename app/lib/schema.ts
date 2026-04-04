import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  time,
  integer,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ── Enums ─────────────────────────────────────────── */

export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);

export const departmentEnum = pgEnum("department", [
  "teknoloji_fen",
  "fen_sosyal",
  "hazirlik",
]);

export const announcementCategoryEnum = pgEnum("announcement_category", [
  "genel",
  "pansiyon",
  "sinav",
  "etkinlik",
]);

export const mealTypeEnum = pgEnum("meal_type", [
  "kahvalti",
  "ogle",
  "aksam",
]);

export const examTypeEnum = pgEnum("exam_type", [
  "yazili",
  "deneme",
  "yks",
  "lgs",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "gezi",
  "seminer",
  "sportif",
  "kulturel",
  "proje",
]);

/* ── Users ─────────────────────────────────────────── */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  className: varchar("class_name", { length: 10 }),
  department: departmentEnum("department"),
  isBoarder: boolean("is_boarder").notNull().default(false),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ── Announcements ─────────────────────────────────── */

export const announcements = pgTable("announcements", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  category: announcementCategoryEnum("category").notNull().default("genel"),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ── Meal Menus ────────────────────────────────────── */

export const mealMenus = pgTable("meal_menus", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  mealType: mealTypeEnum("meal_type").notNull(),
  items: text("items").notNull(), // JSON string of food items
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ── Class Schedules ───────────────────────────────── */

export const classSchedules = pgTable("class_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  className: varchar("class_name", { length: 10 }).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 1=Pazartesi ... 5=Cuma
  period: integer("period").notNull(), // 1-8 (ders saati)
  subject: varchar("subject", { length: 255 }).notNull(),
  teacherName: varchar("teacher_name", { length: 255 }),
  room: varchar("room", { length: 50 }),
  createdBy: uuid("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ── Exams ─────────────────────────────────────────── */

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  examType: examTypeEnum("exam_type").notNull(),
  className: varchar("class_name", { length: 10 }), // null = tüm sınıflar
  examDate: timestamp("exam_date").notNull(),
  subject: varchar("subject", { length: 255 }),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ── Mock Exam Results ─────────────────────────────── */

export const mockExamResults = pgTable("mock_exam_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  examName: varchar("exam_name", { length: 255 }).notNull(),
  examDate: date("exam_date").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  correctCount: integer("correct_count").notNull().default(0),
  wrongCount: integer("wrong_count").notNull().default(0),
  emptyCount: integer("empty_count").notNull().default(0),
  netScore: decimal("net_score", { precision: 6, scale: 2 }).notNull().default("0"),
  targetNet: decimal("target_net", { precision: 6, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ── Events ────────────────────────────────────────── */

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  eventType: eventTypeEnum("event_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: varchar("location", { length: 255 }),
  targetClass: varchar("target_class", { length: 10 }),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ── Study Sessions (Etüt - Pansiyon) ──────────────── */

export const studySessions = pgTable("study_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 1=Pazartesi ... 7=Pazar
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  subject: varchar("subject", { length: 255 }),
  location: varchar("location", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
