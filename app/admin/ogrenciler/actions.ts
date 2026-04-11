"use server";

import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function toggleAdminRole(userId: string, currentRole: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  // Don't allow removing own admin role
  if (userId === session.user.id) {
    throw new Error("Kendi admin rolünüzü kaldıramazsınız!");
  }

  const newRole = currentRole === "admin" ? "student" : "admin";

  await db.update(users).set({
    role: newRole,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));

  revalidatePath("/admin/ogrenciler");
}

export async function updateStudent(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const className = formData.get("className") as string;
  const department = formData.get("department") as "teknoloji_fen" | "fen_sosyal" | "hazirlik" | "";
  const isBoarder = formData.get("isBoarder") === "on";

  await db.update(users).set({
    name,
    className: className || null,
    department: department || null,
    isBoarder,
    updatedAt: new Date(),
  }).where(eq(users.id, id));

  revalidatePath("/admin/ogrenciler");
}

export async function deleteStudent(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  // Don't allow deleting self
  if (id === session.user.id) {
    throw new Error("Kendi hesabınızı silemezsiniz!");
  }

  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/ogrenciler");
}
