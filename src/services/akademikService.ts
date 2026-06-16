import prisma from '@/lib/prisma';

export const MATA_KULIAH_BERBINTANG = [
  'TIPK101', // Pend. Agama Katolik/Etika Sosial
  'TIKK104', // Algoritma dan Pemrograman
  'TIKB204', // Sistem Basis Data
  'TIPK302', // Pendidikan Kewarganegaraan
  'TIKK311', // Logika Informatika
  'TIKB408', // Pemrograman Visual
  'TIKK513', // Metodologi Penelitian
  'TIKB614', // Kerja Praktek
  'TIPK703', // Bahasa Indonesia
  'TIPB801', // Etika Profesi
  'TIPK801', // Pendidikan Pancasila
];

export class AkademikService {
  private static deduplicateKhsList(khsList: any[]) {
    const map = new Map<number, any>();
    for (const khs of khsList) {
      const existing = map.get(khs.mata_kuliah_id);
      if (!existing) {
        map.set(khs.mata_kuliah_id, khs);
      } else {
        const currentBobot = khs.bobot_nilai ?? -1;
        const existingBobot = existing.bobot_nilai ?? -1;
        if (currentBobot > existingBobot) {
          map.set(khs.mata_kuliah_id, khs);
        } else if (currentBobot === existingBobot && khs.id > existing.id) {
          map.set(khs.mata_kuliah_id, khs);
        }
      }
    }
    return Array.from(map.values());
  }

  static async hitungIPS(userId: number, semester: number): Promise<number> {
    const khsList = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });

    const khsFiltered = khsList.filter((khs: any) => {
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

  static async hitungIPK(userId: number): Promise<number> {
    const khsListRaw = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });

    const khsList = this.deduplicateKhsList(khsListRaw);

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

  static async hitungMKBermasalah(userId: number): Promise<number> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { angkatan: true } });
    const angkatan = user?.angkatan ? parseInt(user.angkatan) : 2026;
    
    const khsListRaw = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { in: ['A', 'B', 'C', 'D', 'E'] } },
      include: { mata_kuliah: true },
    });

    const khsListAll = this.deduplicateKhsList(khsListRaw);
    const khsList = khsListAll.filter(k => ['D', 'E'].includes(k.nilai));

    let dCountReguler = 0;
    let bermasalahCount = 0;

    khsList.sort((a: any, b: any) => {
      if (a.nilai === 'E' && b.nilai !== 'E') return -1;
      if (a.nilai !== 'E' && b.nilai === 'E') return 1;
      return 0;
    });

    for (const khs of khsList) {
      const mk = khs.mata_kuliah;
      const isBintang = MATA_KULIAH_BERBINTANG.includes(mk.kode);
      let isBermasalah = false;

      if (khs.nilai === 'E') {
        isBermasalah = true;
      } else if (khs.nilai === 'D') {
        if (isBintang) {
          isBermasalah = true;
        } else if (angkatan >= 2026) {
          isBermasalah = true;
        } else {
          if (dCountReguler < 2) {
            dCountReguler++;
            isBermasalah = false; 
          } else {
            isBermasalah = true;
          }
        }
      }

      if (isBermasalah) {
        bermasalahCount++;
      }
    }

    return bermasalahCount;
  }

  static async getMKBermasalahDetail(userId: number) {
    const khsListRaw = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { in: ['A', 'B', 'C', 'D', 'E'] } },
      include: { mata_kuliah: true },
    });

    const khsListAll = this.deduplicateKhsList(khsListRaw);
    const khsList = khsListAll.filter(k => ['D', 'E'].includes(k.nilai));

    const bermasalahList: any[] = [];

    for (const khs of khsList) {
      const mk = khs.mata_kuliah;
      bermasalahList.push({
        kode: mk.kode,
        nama: mk.nama,
        sks: mk.sks,
        nilai: khs.nilai!,
        semester: khs.semester_override ?? mk.semester,
        jenis: mk.jenis,
      });
    }

    const result = bermasalahList;

    result.sort((a: any, b: any) => {
      const bobotA = a.nilai === 'E' ? 0 : 1;
      const bobotB = b.nilai === 'E' ? 0 : 1;
      if (bobotA !== bobotB) return bobotA - bobotB;
      return b.sks - a.sks;
    });

    return result;
  }

  static async hitungTotalSKSTempuh(userId: number): Promise<number> {
    const khsListRaw = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });
    const khsList = this.deduplicateKhsList(khsListRaw);
    return khsList.reduce((acc: any, khs: any) => acc + khs.mata_kuliah.sks, 0);
  }

  static async hitungTotalSKSLulus(userId: number): Promise<number> {
    const khsListRaw = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });
    const khsListAll = this.deduplicateKhsList(khsListRaw);
    const khsList = khsListAll.filter(k => ['A', 'B', 'C'].includes(k.nilai));
    return khsList.reduce((acc: any, khs: any) => acc + khs.mata_kuliah.sks, 0);
  }

  static async statistikPerSemester(userId: number) {
    const allKhs = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });

    const result: Record<number, any> = {};

    for (let sem = 1; sem <= 14; sem++) {
      const khsSem = allKhs.filter((khs: any) => {
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

  static async getAkademikSummary(userId: number, semesterAktif: number) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { angkatan: true } });
    const angkatan = user?.angkatan ? parseInt(user.angkatan) : 2026;
    
    const allKhs = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });

    let totalBobotSemester = 0;
    let totalSksSemester = 0;
    const semStats: Record<number, any> = {};

    // 1. Hitung IPS & Statistik Per Semester (Menggunakan ALL KHS, tanpa deduplikasi)
    for (const khs of allKhs) {
      const sks = khs.mata_kuliah.sks;
      const bobot = khs.bobot_nilai ?? 0;
      const semEfektif = khs.semester_override ?? khs.mata_kuliah.semester;
      
      let isBermasalah = ['D', 'E'].includes(khs.nilai!);

      if (semEfektif === semesterAktif) {
        totalBobotSemester += bobot * sks;
        totalSksSemester += sks;
      }

      if (!semStats[semEfektif]) {
        semStats[semEfektif] = {
          semester: semEfektif,
          totalBobot: 0,
          totalSks: 0,
          mk_bermasalah: 0,
          total_mk: 0,
        };
      }
      semStats[semEfektif].totalBobot += bobot * sks;
      semStats[semEfektif].totalSks += sks;
      if (isBermasalah) semStats[semEfektif].mk_bermasalah++;
      semStats[semEfektif].total_mk++;
    }

    // 2. Hitung IPK, SKS Lulus, dan MK Bermasalah (Menggunakan Deduplicated KHS)
    const deduplicatedKhs = this.deduplicateKhsList(allKhs);
    
    let totalBobotKumulatif = 0;
    let totalSksKumulatif = 0;
    let mkBermasalahCount = 0;
    let totalSksLulus = 0;
    let dCountReguler = 0;
    let totalMkDE = 0;

    deduplicatedKhs.sort((a: any, b: any) => {
      if (a.nilai === 'E' && b.nilai !== 'E') return -1;
      if (a.nilai !== 'E' && b.nilai === 'E') return 1;
      return 0;
    });

    for (const khs of deduplicatedKhs) {
      const sks = khs.mata_kuliah.sks;
      const bobot = khs.bobot_nilai ?? 0;
      
      const isBintang = MATA_KULIAH_BERBINTANG.includes(khs.mata_kuliah.kode);
      let isLulus = false;
      let isBermasalah = false;

      if (['A', 'B', 'C'].includes(khs.nilai!)) {
        isLulus = true;
      } else if (khs.nilai === 'E') {
        isBermasalah = true;
        totalMkDE++;
      } else if (khs.nilai === 'D') {
        totalMkDE++;
        if (isBintang) {
          isBermasalah = true;
        } else if (angkatan >= 2026) {
          isBermasalah = true;
        } else {
          if (dCountReguler < 2) {
            dCountReguler++;
            isLulus = true; 
          } else {
            isBermasalah = true;
          }
        }
      }

      totalBobotKumulatif += bobot * sks;
      totalSksKumulatif += sks;
      
      if (isLulus) totalSksLulus += sks;
      if (isBermasalah) mkBermasalahCount++;
    }

    const statistik_semester = Object.values(semStats).map((stat: any) => ({
      semester: stat.semester,
      ips: stat.totalSks > 0 ? Number((stat.totalBobot / stat.totalSks).toFixed(2)) : 0,
      total_sks: stat.totalSks,
      mk_bermasalah: stat.mk_bermasalah,
      total_mk: stat.total_mk,
    })).sort((a, b) => a.semester - b.semester);

    return {
      ipk: totalSksKumulatif > 0 ? Number((totalBobotKumulatif / totalSksKumulatif).toFixed(2)) : 0.0,
      ips: totalSksSemester > 0 ? Number((totalBobotSemester / totalSksSemester).toFixed(2)) : 0.0,
      mk_bermasalah: mkBermasalahCount,
      total_mk_d_e: totalMkDE,
      total_sks_tempuh: totalSksKumulatif,
      total_sks_lulus: totalSksLulus,
      statistik_semester,
    };
  }
}
