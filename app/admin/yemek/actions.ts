"use server";

import { db } from "@/app/lib/db";
import { mealMenus } from "@/app/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createMenu(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  const date = formData.get("date") as string;
  const mealType = formData.get("mealType") as "kahvalti" | "ogle" | "aksam";
  const items = formData.get("items") as string;

  await db.insert(mealMenus).values({
    date,
    mealType,
    items,
  });

  revalidatePath("/admin/yemek");
  revalidatePath("/");
}

export async function deleteMenu(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  await db.delete(mealMenus).where(eq(mealMenus.id, id));
  revalidatePath("/admin/yemek");
  revalidatePath("/");
}

export async function updateMenu(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    throw new Error("Yetkisiz işlem!");
  }

  const id = formData.get("id") as string;
  const date = formData.get("date") as string;
  const mealType = formData.get("mealType") as "kahvalti" | "ogle" | "aksam";
  const items = formData.get("items") as string;

  await db.update(mealMenus).set({
    date,
    mealType,
    items,
  }).where(eq(mealMenus.id, id));

  revalidatePath("/admin/yemek");
  revalidatePath("/");
}
