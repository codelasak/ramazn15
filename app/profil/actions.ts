"use server";

import { db } from "@/app/lib/db";
import { users } from "@/app/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function updateGoals(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Giriş yapmanız gerekiyor.");
  }

  const targetUniversity = formData.get("targetUniversity") as string;
  const targetNetRaw = formData.get("targetNet") as string;

  let targetNet: string | null = null;
  if (targetNetRaw) {
    const parsed = parseFloat(targetNetRaw);
    if (!isNaN(parsed)) {
      // YKS max placement score is 560
      const capped = Math.min(Math.max(parsed, 0), 560);
      targetNet = capped.toFixed(2);
    }
  }

  await db.update(users)
    .set({
      targetUniversity: targetUniversity || null,
      targetNet: targetNet,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  // Oturumu veya sayfayı güncelle
  revalidatePath("/profil");
  revalidatePath("/takip");
}

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Giriş yapmanız gerekiyor.");
  }

  const name = (formData.get("name") as string)?.trim();
  const isBoarder = formData.get("isBoarder") === "true";

  if (!name) {
    throw new Error("İsim boş olamaz.");
  }

  await db.update(users)
    .set({
      name,
      isBoarder,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/profil");
  revalidatePath("/");
}
