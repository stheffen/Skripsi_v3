import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AkademikService {
  /**
   * Hitung IPS untuk semester tertentu.
   */
  static async hitungIPS(userId: number, semester: number): Promise<number> {
    const khsList = await prisma.khs.findMany({
      where: {
        user_id: userId,
        nilai: { not: null },
      },
      include: {
        mata_kuliah: true,
      },
    });

    const khsFiltered = khsList.filter((khs) => {
      const semEfektif = khs.semester_override ?? khs.mata_kuliah.semester;
      return semEfektif === semester;
    });

    if (khsFiltered.length === 0) return 0.0;

    let totalBobot = 0;
    let totalSks = 0;

    for (const khs of khsFiltered) {
      const sks = khs.mata_kuliah.sks;
      totalBobot += (khs.bobot_nilai ?? 0) * sks;
      totalSks += sks;
    }

    if (totalSks === 0) return 0.0;
    return Number((totalBobot / totalSks).toFixed(2));
  }

  /**
   * Hitung IPK kumulatif (semua semester yang sudah diisi)
   */
  static async hitungIPK(userId: number): Promise<number> {
    const khsList = await prisma.khs.findMany({
      where: {
        user_id: userId,
        nilai: { not: null },
      },
      include: {
        mata_kuliah: true,
      },
    });

    if (khsList.length === 0) return 0.0;

    let totalBobot = 0;
    let totalSks = 0;

    for (const khs of khsList) {
      const sks = khs.mata_kuliah.sks;
      totalBobot += (khs.bobot_nilai ?? 0) * sks;
      totalSks += sks;
    }

    if (totalSks === 0) return 0.0;
    return Number((totalBobot / totalSks).toFixed(2));
  }

  /**
   * Hitung jumlah MK bermasalah (nilai D atau E)
   */
  static async hitungMKBermasalah(userId: number): Promise<number> {
    const count = await prisma.khs.count({
      where: {
        user_id: userId,
        nilai: { in: ['D', 'E'] },
      },
    });
    return count;
  }

  /**
   * Kembalikan detail MK bermasalah (D/E)
   */
  static async getMKBermasalahDetail(userId: number) {
    const khsList = await prisma.khs.findMany({
      where: {
        user_id: userId,
        nilai: { in: ['D', 'E'] },
      },
      include: {
        mata_kuliah: true,
      },
    });

    const result = khsList.map((khs) => {
      const mk = khs.mata_kuliah;
      return {
        kode: mk.kode,
        nama: mk.nama,
        sks: mk.sks,
        nilai: khs.nilai!,
        semester: khs.semester_override ?? mk.semester,
        jenis: mk.jenis,
      };
    });

    // Urutkan: E dulu, lalu D; dan SKS besar dulu
    result.sort((a, b) => {
      const bobotA = a.nilai === 'E' ? 0 : 1;
      const bobotB = b.nilai === 'E' ? 0 : 1;
      if (bobotA !== bobotB) return bobotA - bobotB;
      return b.sks - a.sks;
    });

    return result;
  }

  /**
   * Hitung total SKS yang sudah ditempuh (ada nilainya)
   */
  static async hitungTotalSKSTempuh(userId: number): Promise<number> {
    const khsList = await prisma.khs.findMany({
      where: {
        user_id: userId,
        nilai: { not: null },
      },
      include: {
        mata_kuliah: true,
      },
    });

    return khsList.reduce((acc, khs) => acc + khs.mata_kuliah.sks, 0);
  }

  /**
   * Hitung total SKS yang lulus (nilai A/B/C)
   */
  static async hitungTotalSKSLulus(userId: number): Promise<number> {
    const khsList = await prisma.khs.findMany({
      where: {
        user_id: userId,
        nilai: { in: ['A', 'B', 'C'] },
      },
      include: {
        mata_kuliah: true,
      },
    });

    return khsList.reduce((acc, khs) => acc + khs.mata_kuliah.sks, 0);
  }

  /**
   * Statistik ringkasan per semester.
   */
  static async statistikPerSemester(userId: number) {
    const allKhs = await prisma.khs.findMany({
      where: {
        user_id: userId,
        nilai: { not: null },
      },
      include: {
        mata_kuliah: true,
      },
    });

    const result: Record<number, any> = {};

    for (let sem = 1; sem <= 14; sem++) {
      const khsSem = allKhs.filter((khs) => {
        const semEfektif = khs.semester_override ?? khs.mata_kuliah.semester;
        return semEfektif === sem;
      });

      if (khsSem.length === 0) continue;

      let totalBobot = 0;
      let totalSks = 0;
      let mkBermasalah = 0;

      for (const khs of khsSem) {
        const sks = khs.mata_kuliah.sks;
        totalBobot += (khs.bobot_nilai ?? 0) * sks;
        totalSks += sks;
        if (['D', 'E'].includes(khs.nilai ?? '')) mkBermasalah++;
      }

      result[sem] = {
        semester: sem,
        ips: totalSks > 0 ? Number((totalBobot / totalSks).toFixed(2)) : 0,
        total_sks: totalSks,
        mk_bermasalah: mkBermasalah,
        total_mk: khsSem.length,
      };
    }

    return Object.values(result);
  }
}
