"use server";

import { prosesFuzzy } from "@/services/fuzzyMamdaniService";
import { AkademikService } from "@/services/akademikService";
import { PrismaClient } from "@prisma/client";
import { RekomendasiService } from "@/services/rekomendasiService";

const prisma = new PrismaClient();

const getBobot = (nilai: string | null) => {
  if (!nilai) return null;
  const map: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };
  return map[nilai.toUpperCase()] ?? null;
};

export async function jalankanSimulasi(userId: number, semesterAktif: number, overrides: { khs_id: number; nilai: string }[]) {
  try {
    // We need to calculate IPS, IPK, and MK Bermasalah by simulating the data
    // First, fetch all KHS for the user
    const allKhs = await prisma.khs.findMany({
      where: { user_id: userId },
      include: { mata_kuliah: true },
    });

    // Apply overrides
    const simulatedKhs = allKhs.map(khs => {
      const override = overrides.find(o => o.khs_id === khs.id);
      if (override) {
        return {
          ...khs,
          nilai: override.nilai,
          bobot_nilai: getBobot(override.nilai),
        };
      }
      return khs;
    });

    // Calculate simulated IPS
    let totalBobotSemester = 0;
    let totalSKSSemester = 0;
    
    // Calculate simulated IPK
    let totalBobotKumulatif = 0;
    let totalSKSKumulatif = 0;

    // Calculate MK Bermasalah
    let mkBermasalahCount = 0;
    const mkBermasalahDetail = [];

    // Map by MK ID to handle retakes
    const terbaikPerMK = new Map<number, typeof simulatedKhs[0]>();

    for (const khs of simulatedKhs) {
      if (!khs.nilai) continue;

      const semEfektif = khs.semester_override ?? khs.mata_kuliah.semester;
      
      // For IPS
      if (semEfektif === semesterAktif) {
        totalSKSSemester += khs.mata_kuliah.sks;
        totalBobotSemester += (khs.bobot_nilai || 0) * khs.mata_kuliah.sks;
      }

      // For IPK, find best grade
      const existing = terbaikPerMK.get(khs.mata_kuliah_id);
      if (!existing || (khs.bobot_nilai || 0) > (existing.bobot_nilai || 0)) {
        terbaikPerMK.set(khs.mata_kuliah_id, khs);
      }
    }

    // Process IPK and MK Bermasalah
    for (const khs of Array.from(terbaikPerMK.values())) {
      totalSKSKumulatif += khs.mata_kuliah.sks;
      totalBobotKumulatif += (khs.bobot_nilai || 0) * khs.mata_kuliah.sks;

      if (khs.nilai === 'D' || khs.nilai === 'E') {
        mkBermasalahCount++;
        mkBermasalahDetail.push({
          kode: khs.mata_kuliah.kode,
          nama: khs.mata_kuliah.nama,
          sks: khs.mata_kuliah.sks,
          nilai: khs.nilai,
          semester: khs.mata_kuliah.semester
        });
      }
    }

    const ips = totalSKSSemester > 0 ? totalBobotSemester / totalSKSSemester : 0;
    const ipk = totalSKSKumulatif > 0 ? totalBobotKumulatif / totalSKSKumulatif : 0;

    // Run fuzzy
    const fuzzyResult = prosesFuzzy(ips, ipk, mkBermasalahCount);

    // Generate recommendation
    const rekomendasi = RekomendasiService.buat(
      fuzzyResult.kategori,
      ips,
      ipk,
      mkBermasalahCount,
      mkBermasalahDetail
    );

    return {
      success: true,
      data: {
        ips,
        ipk,
        mk_bermasalah: mkBermasalahCount,
        ...fuzzyResult,
        rekomendasi
      }
    };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal menjalankan simulasi" };
  }
}
