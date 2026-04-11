"use server";

import { db } from "@/app/lib/db";
import { exams } from "@/app/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addExam(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  const title = formData.get("title") as string;
  const examType = formData.get("examType") as "yazili" | "deneme" | "yks" | "lgs";
  const className = formData.get("className") as string; // Optional
  const examDateStr = formData.get("examDate") as string;
  const subject = formData.get("subject") as string;

  if (!title || !examType || !examDateStr) {
    throw new Error("Lütfen zorunlu alanları doldurun.");
  }

  const examDate = new Date(examDateStr);

  await db.insert(exams).values({
    title,
    examType,
    className: className || null,
    examDate,
    subject: subject || null,
    createdBy: session.user.id,
  });

  revalidatePath("/");
  revalidatePath("/admin/sinavlar");
}

export async function deleteExam(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  await db.delete(exams).where(eq(exams.id, id));
  revalidatePath("/");
  revalidatePath("/admin/sinavlar");
}

export async function updateExam(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const examType = formData.get("examType") as "yazili" | "deneme" | "yks" | "lgs";
  const className = formData.get("className") as string;
  const examDateStr = formData.get("examDate") as string;
  const subject = formData.get("subject") as string;

  const examDate = new Date(examDateStr);

  await db.update(exams).set({
    title,
    examType,
    className: className || null,
    examDate,
    subject: subject || null,
  }).where(eq(exams.id, id));

  revalidatePath("/");
  revalidatePath("/admin/sinavlar");
}
