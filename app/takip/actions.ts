"use server";

import { db } from "../lib/db";
import { mockExamResults } from "../lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { revalidatePath } from "next/cache";

export async function addMockExamResult(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Giriş yapmanız gerekiyor.");
  }

  // Parse form data
  const examName = formData.get("examName") as string;
  const examType = formData.get("examType") as string;
  const examDate = new Date(formData.get("examDate") as string);

  const turkishCorrect = parseInt(formData.get("turkishCorrect") as string || "0");
  const turkishWrong = parseInt(formData.get("turkishWrong") as string || "0");
  const mathCorrect = parseInt(formData.get("mathCorrect") as string || "0");
  const mathWrong = parseInt(formData.get("mathWrong") as string || "0");
  const socialCorrect = parseInt(formData.get("socialCorrect") as string || "0");
  const socialWrong = parseInt(formData.get("socialWrong") as string || "0");
  const scienceCorrect = parseInt(formData.get("scienceCorrect") as string || "0");
  const scienceWrong = parseInt(formData.get("scienceWrong") as string || "0");

  // Calculate Net -> Correct - (Wrong / 4)
  const calcNet = (c: number, w: number) => c - (w / 4);
  const totalNet = calcNet(turkishCorrect, turkishWrong) + 
                   calcNet(mathCorrect, mathWrong) + 
                   calcNet(socialCorrect, socialWrong) + 
                   calcNet(scienceCorrect, scienceWrong);

  await db.insert(mockExamResults).values({
    userId: session.user.id,
    examName,
    examType,
    examDate,
    turkishCorrect,
    turkishWrong,
    mathCorrect,
    mathWrong,
    socialCorrect,
    socialWrong,
    scienceCorrect,
    scienceWrong,
    totalNet: totalNet.toFixed(2),
  });

  revalidatePath("/takip");
}
