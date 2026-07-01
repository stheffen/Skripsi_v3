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

  // Ambil data mahasiswa dulu (guard — must be first)
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

  // OPTIMIZED: Run all 5 independent queries in parallel (was 5+ sequential awaits)
  const [latestAnalysis, semuaMK, khsAda, filledSemRes, statHistory] = await Promise.all([
    prisma.analisisRisiko.findFirst({
      where: { user_id: mahasiswaId },
      orderBy: { created_at: "desc" },
    }),
    prisma.mataKuliah.findMany({
      orderBy: [{ semester: "asc" }, { nama: "asc" }],
      select: { id: true, kode: true, nama: true, sks: true, semester: true, jenis: true },
    }),
    prisma.khs.findMany({
      where: { user_id: mahasiswaId, nilai: { not: null } },
      select: { mata_kuliah_id: true },
    }),
    getFilledSemesters(mahasiswaId),
    prisma.analisisRisiko.findMany({
      where: { user_id: mahasiswaId },
      orderBy: { semester: 'asc' },
      select: { semester: true, ips: true },
    }),
  ]);

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

  const filledSemesters = filledSemRes.data || [1];
  if (filledSemesters.length === 0) filledSemesters.push(1);

  return (
    <DetailMahasiswaClient
      mahasiswa={mahasiswa}
      initialData={initialData}
      mkBelumDiambil={mkBelumDiambil}
      filledSemesters={filledSemesters}
      statHistory={statHistory}
    />
  );
}
