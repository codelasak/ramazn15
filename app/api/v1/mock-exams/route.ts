import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../../../lib/db";
import { mockExamResults } from "../../../lib/schema";
import { apiAuthErrorResponse, requireUser } from "../../../lib/api-auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    let results: typeof mockExamResults.$inferSelect[] = [];
    try {
      results = await db
        .select()
        .from(mockExamResults)
        .where(eq(mockExamResults.userId, user.id))
        .orderBy(asc(mockExamResults.examDate), asc(mockExamResults.createdAt));
    } catch (err) {
      console.error("[mock-exams.GET] db error:", err);
    }
    return NextResponse.json({ results });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}

interface PostBody {
  examName?: string;
  examType?: string;
  examDate?: string;
  turkishCorrect?: number | string;
  turkishWrong?: number | string;
  mathCorrect?: number | string;
  mathWrong?: number | string;
  socialCorrect?: number | string;
  socialWrong?: number | string;
  scienceCorrect?: number | string;
  scienceWrong?: number | string;
  inkilapCorrect?: number | string;
  inkilapWrong?: number | string;
  dinCorrect?: number | string;
  dinWrong?: number | string;
  ingilizceCorrect?: number | string;
  ingilizceWrong?: number | string;
}

function toInt(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? Math.floor(v) : 0;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = (await req.json().catch(() => ({}))) as PostBody;

    const examName = (body.examName ?? "").toString().trim();
    const examType = (body.examType ?? "Deneme").toString().trim();
    const examDate = body.examDate ? new Date(body.examDate) : null;

    if (!examName) {
      return NextResponse.json({ error: "Sinav ismi zorunlu." }, { status: 400 });
    }
    if (!examDate || Number.isNaN(examDate.getTime())) {
      return NextResponse.json({ error: "Gecerli bir tarih giriniz." }, { status: 400 });
    }

    const existing = await db
      .select({ id: mockExamResults.id })
      .from(mockExamResults)
      .where(
        and(
          eq(mockExamResults.userId, user.id),
          eq(mockExamResults.examName, examName)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `"${examName}" isminde bir deneme zaten eklenmis.` },
        { status: 409 }
      );
    }

    const tc = toInt(body.turkishCorrect);
    const tw = toInt(body.turkishWrong);
    const mc = toInt(body.mathCorrect);
    const mw = toInt(body.mathWrong);
    let soc = toInt(body.socialCorrect);
    let sow = toInt(body.socialWrong);
    const scc = toInt(body.scienceCorrect);
    const scw = toInt(body.scienceWrong);

    const inkC = toInt(body.inkilapCorrect);
    const inkW = toInt(body.inkilapWrong);
    const dinC = toInt(body.dinCorrect);
    const dinW = toInt(body.dinWrong);
    const ingC = toInt(body.ingilizceCorrect);
    const ingW = toInt(body.ingilizceWrong);

    if ([tc, tw, mc, mw, soc, sow, scc, scw, inkC, inkW, dinC, dinW, ingC, ingW].some((n) => n < 0)) {
      return NextResponse.json(
        { error: "Dogru ve yanlis sayilari negatif olamaz." },
        { status: 400 }
      );
    }

    let limits = { t: 40, m: 40, so: 20, sc: 20 };
    let wrongFactor = 4;

    if (examType === "LGS") {
      limits = { t: 20, m: 20, so: 30, sc: 20 };
      wrongFactor = 3;
      if (inkC + inkW > 10) return NextResponse.json({ error: "Inkilap icin en fazla 10 soru olmalidir." }, { status: 400 });
      if (dinC + dinW > 10) return NextResponse.json({ error: "Din kulturu icin en fazla 10 soru olmalidir." }, { status: 400 });
      if (ingC + ingW > 10) return NextResponse.json({ error: "Ingilizce icin en fazla 10 soru olmalidir." }, { status: 400 });
      soc = inkC + dinC + ingC;
      sow = inkW + dinW + ingW;
    } else if (examType === "AYT-SAY") {
      limits = { t: 0, m: 40, so: 0, sc: 40 };
    } else if (examType === "AYT-EA") {
      limits = { t: 40, m: 40, so: 0, sc: 0 };
    } else if (examType === "AYT-SOZ") {
      limits = { t: 40, m: 0, so: 40, sc: 0 };
    } else if (examType === "Diger") {
      limits = { t: 200, m: 200, so: 200, sc: 200 };
    }

    if (tc + tw > limits.t) {
      return NextResponse.json({ error: `${examType} sinavinda Turkce icin en fazla ${limits.t} soru olmalidir.` }, { status: 400 });
    }
    if (mc + mw > limits.m) {
      return NextResponse.json({ error: `${examType} sinavinda Matematik icin en fazla ${limits.m} soru olmalidir.` }, { status: 400 });
    }
    if (examType !== "LGS" && soc + sow > limits.so) {
      return NextResponse.json({ error: `${examType} sinavinda Sosyal icin en fazla ${limits.so} soru olmalidir.` }, { status: 400 });
    }
    if (scc + scw > limits.sc) {
      return NextResponse.json({ error: `${examType} sinavinda Fen icin en fazla ${limits.sc} soru olmalidir.` }, { status: 400 });
    }

    const calcNet = (c: number, w: number) => c - w / wrongFactor;
    const totalNet = calcNet(tc, tw) + calcNet(mc, mw) + calcNet(soc, sow) + calcNet(scc, scw);

    if (totalNet < -150 || totalNet > 500) {
      return NextResponse.json({ error: "Hesaplanan net mantiksiz seviyede." }, { status: 400 });
    }

    const [created] = await db
      .insert(mockExamResults)
      .values({
        userId: user.id,
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
      })
      .returning();

    return NextResponse.json({ result: created }, { status: 201 });
  } catch (err) {
    return apiAuthErrorResponse(err);
  }
}
