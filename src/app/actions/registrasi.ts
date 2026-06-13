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

      if (!grouped[mk.semester]) grouped[mk.semester] = [];
      grouped[mk.semester].push({
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
      // Update nilai saja jika sudah ada
      if (nilai) {
        await prisma.khs.update({
          where: { id: existing.id },
          data: { nilai, bobot_nilai: getBobot(nilai) },
        });
      }
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

    // Update semester_aktif jika perlu
    if (nilai) {
      const filledKhs = await prisma.khs.findMany({
        where: { user_id: userId, nilai: { not: null } },
        include: { mata_kuliah: { select: { semester: true } } },
      });
      const semSet = new Set(filledKhs.map((k: any) => k.semester_override ?? k.mata_kuliah.semester));
      const maxSem = semSet.size > 0 ? Math.max(...Array.from(semSet)) : null;
      if (maxSem) {
        await prisma.user.update({ where: { id: userId }, data: { semester_aktif: maxSem } });
      }
    }

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
    await prisma.khs.delete({
      where: { user_id_mata_kuliah_id: { user_id: userId, mata_kuliah_id: mkId } },
    });
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal menghapus mata kuliah" };
  }
}
