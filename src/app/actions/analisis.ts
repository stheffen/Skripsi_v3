"use server";

import prisma from '@/lib/prisma';
import { AkademikService } from "@/services/akademikService";
import { prosesFuzzy } from "@/services/fuzzyMamdaniService";
import { RekomendasiService } from "@/services/rekomendasiService";

export async function hitungAnalisisRisiko(userId: number, semesterAktif: number) {
  try {
    // OPTIMIZED: Was 7+ sequential DB queries — now only 3 parallel queries
    const { ipk, ips, mkBermasalah, mkDetail, allKhs, totalSksLulus, totalSksTempuh, angkatan, nextSemesterCourses } =
      await AkademikService.getFullAnalysisData(userId, semesterAktif);

    const sisaSks = Math.max(0, 144 - totalSksLulus);

    // Fuzzy Mamdani processing (angkatan >= 2026 -> 9 aturan, else 27 aturan)
    const fuzzyResult = prosesFuzzy(ips, ipk, mkBermasalah, angkatan, semesterAktif, sisaSks);

    // Generate recommendation
    const rekomendasi = RekomendasiService.buat(
      fuzzyResult.kategori,
      ips,
      ipk,
      mkBermasalah,
      mkDetail,
      allKhs,
      semesterAktif,
      nextSemesterCourses
    );

    const detailToSave = {
      ...fuzzyResult,
      input: {
        ...fuzzyResult.input,
        mkDetail: mkDetail
      },
      total_sks_tempuh: totalSksTempuh,
      total_sks_lulus: totalSksLulus,
    };

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
        detail_fuzzy: JSON.stringify(detailToSave),
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
    // OPTIMIZED: Exclude large `detail_fuzzy` column from list view
    const riwayat = await prisma.analisisRisiko.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        semester: true,
        ipk: true,
        ips: true,
        mk_bermasalah: true,
        fuzzy_output: true,
        kategori: true,
        rekomendasi: true,
        created_at: true,
        updated_at: true,
        // detail_fuzzy intentionally excluded — too large for list view
      },
    });
    return { data: riwayat };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal memuat riwayat" };
  }
}
