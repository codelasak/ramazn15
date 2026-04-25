import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { and, eq } from "drizzle-orm";
import { db } from "../app/lib/db";
import { classSchedules } from "../app/lib/schema";

// 12A icin Pazartesi-Cuma 6 ders ornek programi. Apple App Review demo
// hesabi (reviewer@pano15.test, sinif 12A) acildiginda Program tab'inda
// gercek icerik gorunsun diye seed.

const CLASS = "12A";

const SCHEDULE: Array<{
  day: number;
  period: number;
  subject: string;
  teacher: string;
  room: string;
}> = [
  // Pazartesi
  { day: 1, period: 1, subject: "Türk Dili ve Edebiyatı", teacher: "Ahmet Yılmaz", room: "12-A" },
  { day: 1, period: 2, subject: "Matematik", teacher: "Hasan Kaya", room: "12-A" },
  { day: 1, period: 3, subject: "Fizik", teacher: "Mehmet Aydın", room: "Lab-1" },
  { day: 1, period: 4, subject: "Arapça", teacher: "Ömer Çelik", room: "12-A" },
  { day: 1, period: 5, subject: "Beden Eğitimi", teacher: "Murat Şahin", room: "Spor Salonu" },
  { day: 1, period: 6, subject: "Bilgisayar Bilimi", teacher: "Ali Demir", room: "Lab-2" },

  // Sali
  { day: 2, period: 1, subject: "Matematik", teacher: "Hasan Kaya", room: "12-A" },
  { day: 2, period: 2, subject: "Kimya", teacher: "Selim Öz", room: "Lab-1" },
  { day: 2, period: 3, subject: "Tarih", teacher: "Yusuf Öztürk", room: "12-A" },
  { day: 2, period: 4, subject: "Türk Dili ve Edebiyatı", teacher: "Ahmet Yılmaz", room: "12-A" },
  { day: 2, period: 5, subject: "Din Kültürü", teacher: "İbrahim Kara", room: "12-A" },
  { day: 2, period: 6, subject: "Coğrafya", teacher: "Burak Aslan", room: "12-A" },

  // Carsamba
  { day: 3, period: 1, subject: "Biyoloji", teacher: "Selim Öz", room: "Lab-1" },
  { day: 3, period: 2, subject: "Matematik", teacher: "Hasan Kaya", room: "12-A" },
  { day: 3, period: 3, subject: "İngilizce", teacher: "John Smith", room: "12-A" },
  { day: 3, period: 4, subject: "Felsefe", teacher: "Yusuf Öztürk", room: "12-A" },
  { day: 3, period: 5, subject: "Fizik", teacher: "Mehmet Aydın", room: "Lab-1" },
  { day: 3, period: 6, subject: "Rehberlik", teacher: "Ayşe Yıldız", room: "12-A" },

  // Persembe
  { day: 4, period: 1, subject: "Türk Dili ve Edebiyatı", teacher: "Ahmet Yılmaz", room: "12-A" },
  { day: 4, period: 2, subject: "Kimya", teacher: "Selim Öz", room: "Lab-1" },
  { day: 4, period: 3, subject: "Matematik", teacher: "Hasan Kaya", room: "12-A" },
  { day: 4, period: 4, subject: "İngilizce", teacher: "John Smith", room: "12-A" },
  { day: 4, period: 5, subject: "Bilgisayar Bilimi", teacher: "Ali Demir", room: "Lab-2" },
  { day: 4, period: 6, subject: "Beden Eğitimi", teacher: "Murat Şahin", room: "Spor Salonu" },

  // Cuma
  { day: 5, period: 1, subject: "Matematik", teacher: "Hasan Kaya", room: "12-A" },
  { day: 5, period: 2, subject: "Fizik", teacher: "Mehmet Aydın", room: "Lab-1" },
  { day: 5, period: 3, subject: "Türk Dili ve Edebiyatı", teacher: "Ahmet Yılmaz", room: "12-A" },
  { day: 5, period: 4, subject: "Tarih", teacher: "Yusuf Öztürk", room: "12-A" },
  { day: 5, period: 5, subject: "Arapça", teacher: "Ömer Çelik", room: "12-A" },
  { day: 5, period: 6, subject: "Din Kültürü", teacher: "İbrahim Kara", room: "12-A" },
];

async function main() {
  // Idempotent: ayni (sinif, gun, ders saati) varsa once sil.
  for (const row of SCHEDULE) {
    await db
      .delete(classSchedules)
      .where(
        and(
          eq(classSchedules.className, CLASS),
          eq(classSchedules.dayOfWeek, row.day),
          eq(classSchedules.period, row.period)
        )
      );
  }

  await db.insert(classSchedules).values(
    SCHEDULE.map((r) => ({
      className: CLASS,
      dayOfWeek: r.day,
      period: r.period,
      subject: r.subject,
      teacherName: r.teacher,
      room: r.room,
    }))
  );

  console.log(`Seeded ${SCHEDULE.length} schedule rows for class ${CLASS}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
