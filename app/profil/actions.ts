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
  const targetNet = formData.get("targetNet") as string;

  await db.update(users)
    .set({
      targetUniversity: targetUniversity || null,
      targetNet: targetNet ? targetNet : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  // Oturumu veya sayfayı güncelle
  revalidatePath("/profil");
  revalidatePath("/takip");
}
