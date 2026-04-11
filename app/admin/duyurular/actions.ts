"use server";

import { db } from "@/app/lib/db";
import { announcements } from "@/app/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addAnnouncement(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as "genel" | "pansiyon" | "sinav" | "etkinlik";
  const isPinned = formData.get("isPinned") === "on";

  if (!title || !content) {
    throw new Error("Başlık ve içerik zorunludur.");
  }

  await db.insert(announcements).values({
    title,
    content,
    category,
    isPinned,
    createdBy: session.user.id,
  });

  revalidatePath("/admin/duyurular");
  revalidatePath("/duyurular");
  revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath("/admin/duyurular");
  revalidatePath("/duyurular");
  revalidatePath("/");
}

export async function updateAnnouncement(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as "genel" | "pansiyon" | "sinav" | "etkinlik";
  const isPinned = formData.get("isPinned") === "on";

  await db.update(announcements).set({
    title,
    content,
    category,
    isPinned,
    updatedAt: new Date(),
  }).where(eq(announcements.id, id));

  revalidatePath("/admin/duyurular");
  revalidatePath("/duyurular");
  revalidatePath("/");
}
