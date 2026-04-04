"use server";

import { db } from "@/app/lib/db";
import { studySessions } from "@/app/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addStudySession(formData: FormData) {
  const dayOfWeek = parseInt(formData.get("dayOfWeek") as string, 10);
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const subject = formData.get("subject") as string;
  const location = formData.get("location") as string;

  await db.insert(studySessions).values({
    dayOfWeek,
    startTime: startTime + ":00", // Postgres time format requires seconds
    endTime: endTime + ":00",
    subject: subject || null,
    location: location || null,
  });

  revalidatePath("/admin/etut");
  revalidatePath("/");
}

export async function deleteStudySession(id: string) {
  await db.delete(studySessions).where(eq(studySessions.id, id));
  revalidatePath("/admin/etut");
  revalidatePath("/");
}
