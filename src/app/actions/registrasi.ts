"use server";

import prisma from "@/lib/prisma";

const getBobot = (nilai: string | null) => {
  if (!nilai) return null;
  const map: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };
  return map[nilai.toUpperCase()] ?? null;
};

/**
 * Ambil daftar MK per semester yang BELUM diregistrasikan (belum ada di KHS user)
 * atau sudah diregistrasikan tapi nilainya masih null.
 */
export async function getMKPerSemesterUntukRegistrasi(userId: number) {
  try {
    // Ambil semua MK kurikulum
    const semuaMK = await prisma.mataKuliah.findMany({
      orderBy: [{ semester: "asc" }, { nama: "asc" }],
    });

    // Ambil KHS yang sudah ada (baik ada nilai maupun belum)
    const existingKhs = await prisma.khs.findMany({
      where: { user_id: userId },
      include: { mata_kuliah: true },
    });

    const existingMap = new Map(existingKhs.map((k: any) => [k.mata_kuliah_id, k]));

    // Group per semester
    const grouped: Record<number, any[]> = {};
    for (const mk of semuaMK) {
      const khs = existingMap.get(mk.id) as any;
      const semEfektif = khs?.semester_override ?? mk.semester;

      if (!grouped[semEfektif]) grouped[semEfektif] = [];
      grouped[semEfektif].push({
        id: mk.id,
        kode: mk.kode,
        nama: mk.nama,
        sks: mk.sks,
        semester: mk.semester,
        jenis: mk.jenis,
        is_pilihan: mk.is_pilihan,
        kelompok_pilihan: mk.kelompok_pilihan,
        // Status registrasi
        khs_id: khs?.id ?? null,
        nilai: khs?.nilai ?? null,
        sudah_registrasi: !!khs,
      });
    }

    return { data: grouped };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal memuat data mata kuliah" };
  }
}

/**
 * Registrasikan MK (insert KHS baru) dan opsional langsung input nilai.
 */
export async function registrasiMK(
  userId: number,
  mkId: number,
  nilai: string | null,
  semesterInput: number
) {
  try {
    // Cek apakah sudah ada
    const existing = await prisma.khs.findUnique({
      where: { user_id_mata_kuliah_id: { user_id: userId, mata_kuliah_id: mkId } },
    });

    if (existing) {
      // Update nilai dan semester (jika dipindah/mengulang)
      await prisma.khs.update({
        where: { id: existing.id },
        data: { 
          nilai: nilai || null, 
          bobot_nilai: getBobot(nilai),
          semester_override: semesterInput 
        },
      });
      return { success: true, action: "updated" };
    }

    // Insert baru
    await prisma.khs.create({
      data: {
        user_id: userId,
        mata_kuliah_id: mkId,
        nilai: nilai || null,
        bobot_nilai: nilai ? getBobot(nilai) : null,
        semester_input: semesterInput, // Asal semester dicatat
        semester_override: semesterInput, // Semester tempat MK dimasukkan di KRS
      },
    });

    return { success: true, action: "created" };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal registrasi mata kuliah" };
  }
}

/**
 * Batch registrasi + input nilai dari halaman Registrasi MK
 */
export async function batchRegistrasiMK(
  userId: number,
  entries: { mkId: number; nilai: string | null; semester: number }[]
) {
  try {
    for (const e of entries) {
      await registrasiMK(userId, e.mkId, e.nilai, e.semester);
    }
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal menyimpan registrasi" };
  }
}

/**
 * Hapus MK dari KRS (Hapus dari KHS)
 */
export async function deleteRegistrasiMK(userId: number, mkId: number) {
  try {
    await prisma.khs.deleteMany({
      where: { user_id: userId, mata_kuliah_id: mkId },
    });
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal menghapus mata kuliah" };
  }
}
