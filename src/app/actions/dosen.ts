"use server";

import prisma from '@/lib/prisma';

export async function getDosenDashboard(dosenId: number) {
  try {
    const dmMaps = await prisma.dosenMahasiswa.findMany({
      where: { dosen_id: dosenId },
      select: { mahasiswa_id: true }
    });
    
    const mahasiswaIds = dmMaps.map((dm: any) => dm.mahasiswa_id);

    const totalMahasiswa = mahasiswaIds.length;

    if (totalMahasiswa === 0) {
      return {
        success: true,
        data: {
          total_mahasiswa: 0,
          risiko_tinggi: 0,
          risiko_sedang: 0,
          risiko_rendah: 0,
          total_mk_bermasalah: 0,
        }
      };
    }

    // Ambil semua analisis dari mahasiswa bimbingan untuk tren IPK
    const mahasiswa = await prisma.user.findMany({
      where: { 
        id: { in: mahasiswaIds },
        role: 'mahasiswa' 
      },
      include: {
        analisis_risiko: {
          orderBy: { semester: 'asc' },
        },
      },
    });

    let risikoTinggi = 0;
    let risikoSedang = 0;
    let risikoRendah = 0;
    let totalMkBermasalah = 0;
    
    const mahasiswaKritis: any[] = [];
    const ipkDataBySemester: Record<number, any> = {};

    mahasiswa.forEach((m: any) => {
      // Build IPK Trend
      m.analisis_risiko.forEach((ar: any) => {
        if (!ipkDataBySemester[ar.semester]) {
          ipkDataBySemester[ar.semester] = { semester: `Semester ${ar.semester}` };
        }
        ipkDataBySemester[ar.semester][m.name] = ar.ipk;
      });

      // Status Terbaru (Semester Terakhir)
      if (m.analisis_risiko.length > 0) {
        const ar = m.analisis_risiko[m.analisis_risiko.length - 1];
        if (ar.kategori === 'Tinggi') risikoTinggi++;
        else if (ar.kategori === 'Sedang') risikoSedang++;
        else if (ar.kategori === 'Rendah') risikoRendah++;
        
        let trueCount = ar.mk_bermasalah;
        if (ar.detail_fuzzy) {
          try {
            const parsed = JSON.parse(ar.detail_fuzzy);
            if (parsed.input?.mkDetail) trueCount = parsed.input.mkDetail.length;
          } catch(e) {}
        }
        totalMkBermasalah += trueCount;

        if (trueCount > 2) {
          mahasiswaKritis.push({
            id: m.id,
            name: m.name,
            nim: m.nim,
            mk_bermasalah: trueCount
          });
        }
      }
    });

    // convert ipkDataBySemester to array sorted by semester number
    const ipkTrend = Object.keys(ipkDataBySemester)
      .sort((a, b) => Number(a) - Number(b))
      .map(key => ipkDataBySemester[Number(key)]);

    return {
      success: true,
      data: {
        total_mahasiswa: totalMahasiswa,
        risiko_tinggi: risikoTinggi,
        risiko_sedang: risikoSedang,
        risiko_rendah: risikoRendah,
        total_mk_bermasalah: totalMkBermasalah,
        mahasiswa_kritis: mahasiswaKritis,
        ipk_trend: ipkTrend,
      }
    };
  } catch (error: any) {
    return { error: error.message || "Gagal memuat dashboard dosen" };
  }
}

export async function getDosenMahasiswaList(dosenId: number) {
  try {
    const dmMaps = await prisma.dosenMahasiswa.findMany({
      where: { dosen_id: dosenId },
      select: { mahasiswa_id: true }
    });
    
    const mahasiswaIds = dmMaps.map((dm: any) => dm.mahasiswa_id);

    if (mahasiswaIds.length === 0) {
      return { success: true, data: [] };
    }

    const mahasiswaList = await prisma.user.findMany({
      where: { 
        id: { in: mahasiswaIds },
        role: 'mahasiswa' 
      },
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        semester_aktif: true,
        analisis_risiko: {
          orderBy: { created_at: 'desc' },
          take: 1,
        }
      },
      orderBy: { name: 'asc' },
    });

    const formattedList = mahasiswaList.map((m: any) => {
      const ar = m.analisis_risiko.length > 0 ? m.analisis_risiko[0] : null;
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        nim: m.nim,
        semester_aktif: m.semester_aktif,
        risiko: ar ? ar.kategori : 'Belum Dianalisis',
        ips: ar ? ar.ips : 0,
        ipk: ar ? ar.ipk : 0,
        mk_bermasalah: (() => {
          if (!ar) return 0;
          if (ar.detail_fuzzy) {
            try {
              const parsed = JSON.parse(ar.detail_fuzzy);
              if (parsed.input?.mkDetail) return parsed.input.mkDetail.length;
            } catch(e) {}
          }
          return ar.mk_bermasalah;
        })(),
      };
    });

    return { success: true, data: formattedList };
  } catch (error: any) {
    return { error: error.message || "Gagal memuat daftar mahasiswa" };
  }
}

export async function getAvailableMahasiswa(dosenId: number) {
  try {
    const dmMaps = await prisma.dosenMahasiswa.findMany({
      where: { dosen_id: dosenId },
      select: { mahasiswa_id: true }
    });
    
    const assignedIds = dmMaps.map((dm: any) => dm.mahasiswa_id);

    const available = await prisma.user.findMany({
      where: {
        role: 'mahasiswa',
        id: { notIn: assignedIds }
      },
      select: {
        id: true,
        name: true,
        nim: true,
        semester_aktif: true
      },
      orderBy: { name: 'asc' }
    });

    return { success: true, data: available };
  } catch (error: any) {
    return { error: "Gagal memuat mahasiswa tersedia" };
  }
}

export async function addMahasiswaBimbingan(dosenId: number, mahasiswaIds: number[]) {
  try {
    const data = mahasiswaIds.map(id => ({
      dosen_id: dosenId,
      mahasiswa_id: id,
    }));
    await prisma.dosenMahasiswa.createMany({
      data,
      skipDuplicates: true,
    });
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal menambahkan mahasiswa" };
  }
}

export async function removeMahasiswaBimbingan(dosenId: number, mahasiswaId: number) {
  try {
    await prisma.dosenMahasiswa.deleteMany({
      where: { dosen_id: dosenId, mahasiswa_id: mahasiswaId }
    });
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal menghapus mahasiswa" };
  }
}
