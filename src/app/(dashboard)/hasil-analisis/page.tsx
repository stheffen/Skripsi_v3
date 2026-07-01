import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import HasilAnalisisClient from "./HasilAnalisisClient";
import prisma from "@/lib/prisma";
import { AkademikService } from "@/services/akademikService";
import { hitungSemesterAktif } from "@/lib/utils";

export default async function HasilAnalisisPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user;
  if (user.role === "dosen") redirect("/dosen/dashboard");

  const userId = parseInt(user.id);

  // OPTIMIZED: Run all independent queries in parallel (was 4 sequential awaits)
  const [dbUser, latest, semuaMK, khsAda] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { angkatan: true },
    }),
    prisma.analisisRisiko.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    }),
    prisma.mataKuliah.findMany({
      orderBy: [{ semester: "asc" }, { nama: "asc" }],
      select: { id: true, kode: true, nama: true, sks: true, semester: true, jenis: true },
    }),
    prisma.khs.findMany({
      where: { user_id: userId, nilai: { not: null } },
      select: { mata_kuliah_id: true },
    }),
  ]);

  const maxSemester = hitungSemesterAktif(dbUser?.angkatan);

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
      initialData.mk_bermasalah_detail = await AkademikService.getMKBermasalahDetail(userId);
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
