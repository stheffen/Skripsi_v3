import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DetailMahasiswaClient from "./DetailMahasiswaClient";
import { getFilledSemesters } from "@/app/actions/khs";

export default async function DetailMahasiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "dosen") redirect("/login");

  const resolvedParams = await params;
  const mahasiswaId = parseInt(resolvedParams.id);

  // Ambil data mahasiswa
  const mahasiswa = await prisma.user.findUnique({
    where: { id: mahasiswaId, role: "mahasiswa" },
    select: {
      id: true,
      name: true,
      nim: true,
      angkatan: true,
      semester_aktif: true,
    },
  });

  if (!mahasiswa) redirect("/dosen/mahasiswa");

  // Ambil analisis terbaru
  const latestAnalysis = await prisma.analisisRisiko.findFirst({
    where: { user_id: mahasiswaId },
    orderBy: { created_at: "desc" },
  });

  let initialData: any = null;
  if (latestAnalysis) {
    initialData = {
      ...latestAnalysis,
      created_at: latestAnalysis.created_at.toISOString(),
      updated_at: latestAnalysis.updated_at.toISOString(),
    };
    try {
      if (latestAnalysis.detail_fuzzy) {
        const parsed = JSON.parse(latestAnalysis.detail_fuzzy);
        initialData = { ...initialData, ...parsed };
        initialData.mk_bermasalah_detail = parsed.input?.mkDetail || [];
      }
    } catch (e) {}
  }

  // Ambil semua MK dari kurikulum
  const semuaMK = await prisma.mataKuliah.findMany({
    orderBy: [{ semester: "asc" }, { nama: "asc" }],
  });

  // Ambil KHS mahasiswa yang sudah ada nilai
  const khsAda = await prisma.khs.findMany({
    where: { user_id: mahasiswaId, nilai: { not: null } },
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

  const filledSemRes = await getFilledSemesters(mahasiswaId);
  const filledSemesters = filledSemRes.data || [1];
  if (filledSemesters.length === 0) filledSemesters.push(1);

  return (
    <DetailMahasiswaClient
      mahasiswa={mahasiswa}
      initialData={initialData}
      mkBelumDiambil={mkBelumDiambil}
      filledSemesters={filledSemesters}
    />
  );
}
