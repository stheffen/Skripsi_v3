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

    const grouped: Record<number, any[]> = {};

    // Map KHS by mata_kuliah_id so we know all attempts
    const khsByMkId = new Map<number, any[]>();
    for (const khs of existingKhs) {
      if (!khsByMkId.has(khs.mata_kuliah_id)) {
        khsByMkId.set(khs.mata_kuliah_id, []);
      }
      khsByMkId.get(khs.mata_kuliah_id)!.push(khs);
    }

    for (const mk of semuaMK) {
      const attempts = khsByMkId.get(mk.id) || [];
      
      if (attempts.length === 0) {
        // Not taken yet, show in default semester
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
          khs_id: null,
          nilai: null,
          sudah_registrasi: false,
        });
      } else {
        // Taken one or more times
        for (const khs of attempts) {
          const semEfektif = khs.semester_override ?? mk.semester;
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
            khs_id: khs.id,
            nilai: khs.nilai ?? null,
            sudah_registrasi: true,
          });
        }
      }
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
    const existing = await prisma.khs.findFirst({
      where: { user_id: userId, mata_kuliah_id: mkId, semester_override: semesterInput },
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
 * OPTIMIZED: Was 2N sequential DB round-trips — now 2 round-trips total:
 *   1. Load all existing KHS for this user
 *   2. Parallel creates + parallel updates via Promise.all
 */
export async function batchRegistrasiMK(
  userId: number,
  entries: { mkId: number; nilai: string | null; semester: number }[]
) {
  try {
    // Step 1: Bulk-load all existing KHS for the affected MK IDs in one query
    const mkIds = entries.map((e) => e.mkId);
    const existingList = await prisma.khs.findMany({
      where: { user_id: userId, mata_kuliah_id: { in: mkIds } },
      select: { id: true, mata_kuliah_id: true, semester_override: true },
    });

    // Index by (mata_kuliah_id, semester_override) for O(1) lookup
    const existingMap = new Map<string, number>();
    for (const khs of existingList) {
      const key = `${khs.mata_kuliah_id}_${khs.semester_override ?? 'null'}`;
      existingMap.set(key, khs.id);
    }

    const toCreate: typeof entries = [];
    const toUpdate: Array<{ id: number; nilai: string | null; semester: number }> = [];

    for (const e of entries) {
      const key = `${e.mkId}_${e.semester}`;
      const existingId = existingMap.get(key);
      if (existingId) {
        toUpdate.push({ id: existingId, nilai: e.nilai, semester: e.semester });
      } else {
        toCreate.push(e);
      }
    }

    // Step 2: Execute creates and updates in parallel
    await Promise.all([
      toCreate.length > 0
        ? prisma.khs.createMany({
            data: toCreate.map((e) => ({
              user_id: userId,
              mata_kuliah_id: e.mkId,
              nilai: e.nilai || null,
              bobot_nilai: e.nilai ? getBobot(e.nilai) : null,
              semester_input: e.semester,
              semester_override: e.semester,
            })),
            skipDuplicates: true,
          })
        : Promise.resolve(),
      ...toUpdate.map((u) =>
        prisma.khs.update({
          where: { id: u.id },
          data: {
            nilai: u.nilai || null,
            bobot_nilai: u.nilai ? getBobot(u.nilai) : null,
            semester_override: u.semester,
          },
        })
      ),
    ]);

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal menyimpan registrasi" };
  }
}

/**
 * Hapus MK dari KRS (Hapus dari KHS)
 */
export async function deleteRegistrasiMK(userId: number, mkId: number, semesterInput: number) {
  try {
    await prisma.khs.deleteMany({
      where: { user_id: userId, mata_kuliah_id: mkId, semester_override: semesterInput },
    });
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal menghapus mata kuliah" };
  }
}
