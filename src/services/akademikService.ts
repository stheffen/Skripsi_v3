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

  // ─── Internal (in-memory) helpers ───────────────────────────────────────────
  // Accept a pre-loaded KHS list so callers can avoid redundant DB queries.

  private static _hitungIPKFromList(khsList: any[]): number {
    const dedup = this.deduplicateKhsList(khsList);
    if (dedup.length === 0) return 0.0;
    let totalBobot = 0, totalSks = 0;
    for (const khs of dedup) {
      const sks = khs.mata_kuliah.sks;
      totalBobot += (khs.bobot_nilai ?? 0) * sks;
      totalSks += sks;
    }
    return totalSks === 0 ? 0.0 : Number((totalBobot / totalSks).toFixed(2));
  }

  private static _hitungIPSFromList(khsList: any[], semester: number): number {
    const filtered = khsList.filter((khs: any) => {
      const semEfektif = khs.semester_override ?? khs.mata_kuliah.semester;
      return semEfektif === semester;
    });
    if (filtered.length === 0) return 0.0;
    let totalBobot = 0, totalSks = 0;
    for (const khs of filtered) {
      const sks = khs.mata_kuliah.sks;
      totalBobot += (khs.bobot_nilai ?? 0) * sks;
      totalSks += sks;
    }
    return totalSks === 0 ? 0.0 : Number((totalBobot / totalSks).toFixed(2));
  }

  private static _hitungMKBermasalahFromList(khsList: any[], angkatan: number): number {
    const dedup = this.deduplicateKhsList(khsList);
    const deMks = dedup.filter((k: any) => ['D', 'E'].includes(k.nilai));
    deMks.sort((a: any, b: any) => {
      if (a.nilai === 'E' && b.nilai !== 'E') return -1;
      if (a.nilai !== 'E' && b.nilai === 'E') return 1;
      return 0;
    });
    let dCountReguler = 0, count = 0;
    for (const khs of deMks) {
      const isBintang = MATA_KULIAH_BERBINTANG.includes(khs.mata_kuliah.kode);
      if (khs.nilai === 'E') {
        count++;
      } else if (khs.nilai === 'D') {
        if (isBintang || angkatan >= 2026) {
          count++;
        } else if (dCountReguler < 2) {
          dCountReguler++;
        } else {
          count++;
        }
      }
    }
    return count;
  }

  private static _getMKBermasalahDetailFromList(khsList: any[]): any[] {
    const dedup = this.deduplicateKhsList(khsList);
    const deMks = dedup.filter((k: any) => ['D', 'E'].includes(k.nilai));
    const result = deMks.map((khs: any) => ({
      kode: khs.mata_kuliah.kode,
      nama: khs.mata_kuliah.nama,
      sks: khs.mata_kuliah.sks,
      nilai: khs.nilai,
      semester: khs.semester_override ?? khs.mata_kuliah.semester,
      jenis: khs.mata_kuliah.jenis,
    }));
    result.sort((a: any, b: any) => {
      const bobotA = a.nilai === 'E' ? 0 : 1;
      const bobotB = b.nilai === 'E' ? 0 : 1;
      if (bobotA !== bobotB) return bobotA - bobotB;
      return b.sks - a.sks;
    });
    return result;
  }

  private static _hitungTotalSKSLulusFromList(khsList: any[]): number {
    const dedup = this.deduplicateKhsList(khsList);
    const lulus = dedup.filter((k: any) => ['A', 'B', 'C'].includes(k.nilai));
    return lulus.reduce((acc: number, khs: any) => acc + khs.mata_kuliah.sks, 0);
  }

  private static _hitungTotalSKSTempuhFromList(khsList: any[]): number {
    const dedup = this.deduplicateKhsList(khsList);
    return dedup.reduce((acc: number, khs: any) => acc + khs.mata_kuliah.sks, 0);
  }

  // ─── Public async methods (fetch their own data) ─────────────────────────────

  static async hitungIPS(userId: number, semester: number): Promise<number> {
    const khsList = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });
    return this._hitungIPSFromList(khsList, semester);
  }

  static async hitungIPK(userId: number): Promise<number> {
    const khsListRaw = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });
    return this._hitungIPKFromList(khsListRaw);
  }

  static async hitungMKBermasalah(userId: number): Promise<number> {
    const [user, khsListRaw] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { angkatan: true } }),
      prisma.khs.findMany({
        where: { user_id: userId, nilai: { in: ['A', 'B', 'C', 'D', 'E'] } },
        include: { mata_kuliah: true },
      }),
    ]);
    const angkatan = user?.angkatan ? parseInt(user.angkatan) : 2026;
    return this._hitungMKBermasalahFromList(khsListRaw, angkatan);
  }

  static async getMKBermasalahDetail(userId: number) {
    const khsListRaw = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { in: ['A', 'B', 'C', 'D', 'E'] } },
      include: { mata_kuliah: true },
    });
    return this._getMKBermasalahDetailFromList(khsListRaw);
  }

  static async hitungTotalSKSTempuh(userId: number): Promise<number> {
    const khsListRaw = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });
    return this._hitungTotalSKSTempuhFromList(khsListRaw);
  }

  static async hitungTotalSKSLulus(userId: number): Promise<number> {
    const khsListRaw = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });
    return this._hitungTotalSKSLulusFromList(khsListRaw);
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
    // Fetch user + KHS in parallel (one round trip each)
    const [user, allKhs] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { angkatan: true } }),
      prisma.khs.findMany({
        where: { user_id: userId, nilai: { not: null } },
        include: { mata_kuliah: true },
      }),
    ]);
    const angkatan = user?.angkatan ? parseInt(user.angkatan) : 2026;

    let totalBobotSemester = 0;
    let totalSksSemester = 0;
    const semStats: Record<number, any> = {};

    // 1. Hitung IPS & Statistik Per Semester (Menggunakan ALL KHS, tanpa deduplikasi)
    for (const khs of allKhs) {
      const sks = khs.mata_kuliah.sks;
      const bobot = khs.bobot_nilai ?? 0;
      const semEfektif = khs.semester_override ?? khs.mata_kuliah.semester;
      
      const isBermasalah = ['D', 'E'].includes(khs.nilai!);

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

    // 2. Hitung IPK, SKS Lulus, dan MK Bermasalah (Menggunakan internal helpers)
    const ipk = this._hitungIPKFromList(allKhs);
    const mkBermasalahCount = this._hitungMKBermasalahFromList(allKhs, angkatan);
    const totalSksLulus = this._hitungTotalSKSLulusFromList(allKhs);
    const dedup = this.deduplicateKhsList(allKhs);
    const totalSksKumulatif = dedup.reduce((acc: number, k: any) => acc + k.mata_kuliah.sks, 0);
    const totalMkDE = dedup.filter((k: any) => ['D', 'E'].includes(k.nilai)).length;

    const statistik_semester = Object.values(semStats).map((stat: any) => ({
      semester: stat.semester,
      ips: stat.totalSks > 0 ? Number((stat.totalBobot / stat.totalSks).toFixed(2)) : 0,
      total_sks: stat.totalSks,
      mk_bermasalah: stat.mk_bermasalah,
      total_mk: stat.total_mk,
    })).sort((a, b) => a.semester - b.semester);

    return {
      ipk,
      ips: totalSksSemester > 0 ? Number((totalBobotSemester / totalSksSemester).toFixed(2)) : 0.0,
      mk_bermasalah: mkBermasalahCount,
      total_mk_d_e: totalMkDE,
      total_sks_tempuh: totalSksKumulatif,
      total_sks_lulus: totalSksLulus,
      statistik_semester,
    };
  }

  // ─── New: Full summary in ONE DB query, used by hitungAnalisisRisiko ─────────
  static async getFullAnalysisData(userId: number, semesterAktif: number) {
    // Only 2 DB round trips total (previously 7+)
    const [user, allKhs, nextSemesterCourses] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { angkatan: true } }),
      prisma.khs.findMany({
        where: { user_id: userId, nilai: { not: null } },
        include: { mata_kuliah: true },
      }),
      prisma.mataKuliah.findMany({
        where: { semester: semesterAktif + 1 },
        select: { id: true, kode: true, nama: true, sks: true, semester: true, jenis: true },
      }),
    ]);

    const angkatan = user?.angkatan ? parseInt(user.angkatan) : 2026;

    const ipk    = this._hitungIPKFromList(allKhs);
    const ips    = this._hitungIPSFromList(allKhs, semesterAktif);
    const mkBermasalah = this._hitungMKBermasalahFromList(allKhs, angkatan);
    const mkDetail     = this._getMKBermasalahDetailFromList(allKhs);
    const totalSksLulus  = this._hitungTotalSKSLulusFromList(allKhs);
    const totalSksTempuh = this._hitungTotalSKSTempuhFromList(allKhs);

    return { ipk, ips, mkBermasalah, mkDetail, allKhs, totalSksLulus, totalSksTempuh, angkatan, nextSemesterCourses };
  }
}
