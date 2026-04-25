"use server";

import { db } from "../lib/db";
import { mockExamResults } from "../lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { revalidatePath } from "next/cache";

export async function addMockExamResult(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Giriş yapmanız gerekiyor." };
    }

    const examName = formData.get("examName") as string;
    const examType = formData.get("examType") as string;
    const examDate = new Date(formData.get("examDate") as string);

    if (Number.isNaN(examDate.getTime())) {
      return { success: false, error: "Geçerli bir tarih giriniz." };
    }

    const { eq, and } = await import("drizzle-orm");
    
    // Aynı isimde deneme var mı kontrolü
    const existingExam = await db
      .select({ id: mockExamResults.id })
      .from(mockExamResults)
      .where(
        and(
          eq(mockExamResults.userId, session.user.id),
          eq(mockExamResults.examName, examName.trim())
        )
      )
      .limit(1);

    if (existingExam.length > 0) {
      return { success: false, error: `"${examName.trim()}" isminde bir deneme zaten eklenmiş.` };
    }

    const tc = parseInt(formData.get("turkishCorrect") as string) || 0;
    const tw = parseInt(formData.get("turkishWrong") as string) || 0;
    const mc = parseInt(formData.get("mathCorrect") as string) || 0;
    const mw = parseInt(formData.get("mathWrong") as string) || 0;
    let soc = parseInt(formData.get("socialCorrect") as string) || 0;
    let sow = parseInt(formData.get("socialWrong") as string) || 0;

    const inkC = parseInt(formData.get("inkilapCorrect") as string) || 0;
    const inkW = parseInt(formData.get("inkilapWrong") as string) || 0;
    const dinC = parseInt(formData.get("dinCorrect") as string) || 0;
    const dinW = parseInt(formData.get("dinWrong") as string) || 0;
    const ingC = parseInt(formData.get("ingilizceCorrect") as string) || 0;
    const ingW = parseInt(formData.get("ingilizceWrong") as string) || 0;

    const scc = parseInt(formData.get("scienceCorrect") as string) || 0;
    const scw = parseInt(formData.get("scienceWrong") as string) || 0;

    if (tc < 0 || tw < 0 || mc < 0 || mw < 0 || soc < 0 || sow < 0 || scc < 0 || scw < 0 || inkC < 0 || inkW < 0 || dinC < 0 || dinW < 0 || ingC < 0 || ingW < 0) {
      return { success: false, error: "Doğru ve yanlış sayıları negatif olamaz." };
    }

    let limits = { t: 40, m: 40, so: 20, sc: 20 };
    let wrongFactor = 4;

    if (examType === "LGS") {
      limits = { t: 20, m: 20, so: 30, sc: 20 };
      wrongFactor = 3;
      
      if (inkC + inkW > 10) return { success: false, error: "İnkılap için en fazla 10 soru olmalıdır." };
      if (dinC + dinW > 10) return { success: false, error: "Din kültürü için en fazla 10 soru olmalıdır." };
      if (ingC + ingW > 10) return { success: false, error: "İngilizce için en fazla 10 soru olmalıdır." };

      soc = inkC + dinC + ingC;
      sow = inkW + dinW + ingW;
    } else if (examType === "AYT-SAY") {
      limits = { t: 0, m: 40, so: 0, sc: 40 };
    } else if (examType === "AYT-EA") {
      limits = { t: 40, m: 40, so: 0, sc: 0 };
    } else if (examType === "AYT-SÖZ") {
      limits = { t: 40, m: 0, so: 40, sc: 0 };
    } else if (examType === "Diger") {
      limits = { t: 200, m: 200, so: 200, sc: 200 };
    }

    if (tc + tw > limits.t) return { success: false, error: `${examType} sınavında Türkçe için en fazla ${limits.t} soru olmalıdır.` };
    if (mc + mw > limits.m) return { success: false, error: `${examType} sınavında Matematik için en fazla ${limits.m} soru olmalıdır.` };
    if (examType !== "LGS" && (soc + sow > limits.so)) return { success: false, error: `${examType} sınavında Sosyal için en fazla ${limits.so} soru olmalıdır.` };
    if (scc + scw > limits.sc) return { success: false, error: `${examType} sınavında Fen için en fazla ${limits.sc} soru olmalıdır.` };

    const calcNet = (c: number, w: number) => c - (w / wrongFactor);
    const totalNet = calcNet(tc, tw) + calcNet(mc, mw) + calcNet(soc, sow) + calcNet(scc, scw);

    if (totalNet < -150 || totalNet > 500) {
      return { success: false, error: "Hesaplanan net mantıksız seviyede. Kontrol ediniz." };
    }

    await db.insert(mockExamResults).values({
      userId: session.user.id,
      examName,
      examType,
      examDate,
      turkishCorrect: tc,
      turkishWrong: tw,
      mathCorrect: mc,
      mathWrong: mw,
      socialCorrect: soc,
      socialWrong: sow,
      scienceCorrect: scc,
      scienceWrong: scw,
      totalNet: totalNet.toFixed(2),
    });

    revalidatePath("/takip");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Bilinmeyen bir hata oluştu." };
  }
}

export async function deleteMockExamResult(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Giriş yapmanız gerekiyor." };
    }

    const { eq, and } = await import("drizzle-orm");
    
    await db.delete(mockExamResults)
      .where(
        and(
          eq(mockExamResults.id, id),
          eq(mockExamResults.userId, session.user.id)
        )
      );

    revalidatePath("/takip");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Silinirken bir hata oluştu." };
  }
}
