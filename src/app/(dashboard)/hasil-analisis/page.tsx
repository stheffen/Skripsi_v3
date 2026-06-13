import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import HasilAnalisisClient from "./HasilAnalisisClient";
import prisma from "@/lib/prisma";
import { AkademikService } from "@/services/akademikService";

export default async function HasilAnalisisPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user;
  if (user.role === "dosen") redirect("/dosen/dashboard");

  const dbUser = await prisma.user.findUnique({
    where: { id: parseInt(user.id) },
    select: { angkatan: true },
  });

  // Hitung maxSemester berdasarkan angkatan dan tahun sekarang
  const now = new Date();
  const tahunSekarang = now.getFullYear();
  const bulan = now.getMonth() + 1; // 1-12

  let maxSemester = 1;
  if (dbUser?.angkatan) {
    const tahunAngkatan = parseInt(dbUser.angkatan);
    const selisihTahun = tahunSekarang - tahunAngkatan;
    // Setiap tahun = 2 semester; bulan >= 8 = semester ganjil, bulan < 8 = semester genap
    const semesterBerjalan = bulan >= 8 ? 1 : 2;
    maxSemester = Math.max(1, Math.min(14, selisihTahun * 2 + semesterBerjalan));
  }

  // Ambil analisis terbaru
  const latest = await prisma.analisisRisiko.findFirst({
    where: { user_id: parseInt(user.id) },
    orderBy: { created_at: "desc" },
  });

  // Ambil semua MK dari kurikulum
  const semuaMK = await prisma.mataKuliah.findMany({
    orderBy: [{ semester: "asc" }, { nama: "asc" }],
  });

  // Ambil KHS mahasiswa yang sudah ada nilai
  const khsAda = await prisma.khs.findMany({
    where: { user_id: parseInt(user.id), nilai: { not: null } },
    select: { mata_kuliah_id: true },
  });

  // MK yang belum diambil
  const khsMkIds = new Set(khsAda.map((k: any) => k.mata_kuliah_id));
  const mkBelumDiambil = semuaMK
    .filter((mk: any) => !khsMkIds.has(mk.id))
    .map((mk: any) => ({
      id: mk.id,
      kode: mk.kode,
      nama: mk.nama,
      sks: mk.sks,
      semester: mk.semester,
      jenis: mk.jenis,
    }));

  let initialData: any = null;
  if (latest) {
    initialData = {
      ...latest,
      created_at: latest.created_at.toISOString(),
      updated_at: latest.updated_at.toISOString(),
    };
    try {
      if (latest.detail_fuzzy) {
        const parsed = JSON.parse(latest.detail_fuzzy);
        initialData = { ...initialData, ...parsed };
        initialData.mk_bermasalah_detail = parsed.input?.mkDetail;
      }
    } catch (e) {}
    
    // Fallback: Jika data analisis lama tidak menyimpan mkDetail, hitung manual saat ini
    if (!initialData.mk_bermasalah_detail || initialData.mk_bermasalah_detail.length === 0) {
      initialData.mk_bermasalah_detail = await AkademikService.getMKBermasalahDetail(parseInt(user.id));
    }
  }

  return (
    <HasilAnalisisClient
      user={user}
      initialData={initialData}
      maxSemester={maxSemester}
      mkBelumDiambil={mkBelumDiambil}
    />
  );
}
