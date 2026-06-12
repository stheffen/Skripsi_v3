"use server";

import prisma from '@/lib/prisma';
import { AkademikService } from "@/services/akademikService";
import { prosesFuzzy } from "@/services/fuzzyMamdaniService";
import { RekomendasiService } from "@/services/rekomendasiService";

export async function hitungAnalisisRisiko(userId: number, semesterAktif: number) {
  try {
    const ipk = await AkademikService.hitungIPK(userId);
    const ips = await AkademikService.hitungIPS(userId, semesterAktif);
    const mkBermasalah = await AkademikService.hitungMKBermasalah(userId);
    const mkDetail = await AkademikService.getMKBermasalahDetail(userId);

    const allKhs = await prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      include: { mata_kuliah: true },
    });

    // Fuzzy Mamdani processing
    const fuzzyResult = prosesFuzzy(ips, ipk, mkBermasalah);

    // Generate recommendation
    const rekomendasi = RekomendasiService.buat(
      fuzzyResult.kategori,
      ips,
      ipk,
      mkBermasalah,
      mkDetail,
      allKhs,
      semesterAktif
    );

    // Save to database
    const analisis = await prisma.analisisRisiko.create({
      data: {
        user_id: userId,
        semester: semesterAktif,
        ipk,
        ips,
        mk_bermasalah: mkBermasalah,
        fuzzy_output: fuzzyResult.crisp_output,
        kategori: fuzzyResult.kategori,
        rekomendasi,
        detail_fuzzy: JSON.stringify(fuzzyResult),
      },
    });

    return { success: true, data: analisis, fuzzyResult };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal melakukan analisis risiko" };
  }
}

export async function getRiwayatAnalisis(userId: number) {
  try {
    const riwayat = await prisma.analisisRisiko.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return { data: riwayat };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal memuat riwayat" };
  }
}
