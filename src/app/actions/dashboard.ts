import { PrismaClient } from "@prisma/client";
import { AkademikService } from "@/services/akademikService";

const prisma = new PrismaClient();

export async function getDashboardData(userId: number, semesterAktif: number) {
  const ipk = await AkademikService.hitungIPK(userId);
  const ips = await AkademikService.hitungIPS(userId, semesterAktif);
  const mk_bermasalah = await AkademikService.hitungMKBermasalah(userId);
  const total_sks_tempuh = await AkademikService.hitungTotalSKSTempuh(userId);
  const total_sks_lulus = await AkademikService.hitungTotalSKSLulus(userId);
  const statistik_semester = await AkademikService.statistikPerSemester(userId);

  // Latest analysis
  const risiko = await prisma.analisisRisiko.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });

  const tren_ips = statistik_semester.map((stat: any) => ({
    semester: `Sem ${stat.semester}`,
    ips: stat.ips,
  }));

  return {
    akademik: {
      ipk,
      ips,
      mk_bermasalah,
      total_sks_tempuh,
      total_sks_lulus,
    },
    risiko: risiko ? {
      ...risiko,
      tanggal: risiko.created_at.toISOString().split('T')[0],
    } : null,
    statistik_semester,
    tren_ips,
  };
}
