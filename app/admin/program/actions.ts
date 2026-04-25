"use server";

import { db } from "@/app/lib/db";
import { classSchedules } from "@/app/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addSchedule(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  const className = formData.get("className") as string;
  const dayOfWeek = parseInt(formData.get("dayOfWeek") as string, 10);
  const period = parseInt(formData.get("period") as string, 10);
  const subject = formData.get("subject") as string;
  const teacherName = formData.get("teacherName") as string;
  const room = formData.get("room") as string;

  if (!className || !subject || !dayOfWeek || !period) {
    throw new Error("Lütfen zorunlu alanları doldurun.");
  }

  await db.insert(classSchedules).values({
    className,
    dayOfWeek,
    period,
    subject,
    teacherName: teacherName || null,
    room: room || null,
    createdBy: session.user.id,
  });

  revalidatePath("/admin/program");
  revalidatePath("/");
}

export async function deleteSchedule(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  await db.delete(classSchedules).where(eq(classSchedules.id, id));
  revalidatePath("/admin/program");
  revalidatePath("/");
}

export async function updateSchedule(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  const id = formData.get("id") as string;
  const className = formData.get("className") as string;
  const dayOfWeek = parseInt(formData.get("dayOfWeek") as string, 10);
  const period = parseInt(formData.get("period") as string, 10);
  const subject = formData.get("subject") as string;
  const teacherName = formData.get("teacherName") as string;
  const room = formData.get("room") as string;

  await db.update(classSchedules).set({
    className,
    dayOfWeek,
    period,
    subject,
    teacherName: teacherName || null,
    room: room || null,
    updatedAt: new Date(),
  }).where(eq(classSchedules.id, id));

  revalidatePath("/admin/program");
  revalidatePath("/");
}
