import { PrismaClient } from "@prisma/client";
import { AkademikService } from "@/services/akademikService";

const prisma = new PrismaClient();

export async function getDashboardData(userId: number, semesterAktif: number) {
  const summary = await AkademikService.getAkademikSummary(userId, semesterAktif);

  // Latest analysis
  const risiko = await prisma.analisisRisiko.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });

  const tren_ips = summary.statistik_semester.map((stat: any) => ({
    semester: `Sem ${stat.semester}`,
    ips: stat.ips,
  }));

  return {
    akademik: {
      ipk: summary.ipk,
      ips: summary.ips,
      mk_bermasalah: summary.mk_bermasalah,
      total_sks_tempuh: summary.total_sks_tempuh,
      total_sks_lulus: summary.total_sks_lulus,
    },
    risiko: risiko ? {
      ...risiko,
      tanggal: risiko.created_at.toISOString().split('T')[0],
    } : null,
    statistik_semester: summary.statistik_semester,
    tren_ips,
  };
}
