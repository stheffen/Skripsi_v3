import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import HasilAnalisisClient from "./HasilAnalisisClient";
import prisma from '@/lib/prisma';

export default async function HasilAnalisisPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  if (user.role === 'dosen') {
    redirect("/dosen/dashboard");
  }

  // Ambil analisis terbaru
  const latest = await prisma.analisisRisiko.findFirst({
    where: { user_id: parseInt(user.id) },
    orderBy: { created_at: 'desc' },
  });

  let initialData = null;
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
        initialData.mk_bermasalah_detail = parsed.input?.mkDetail || [];
      }
    } catch(e) {}
  }

  return <HasilAnalisisClient user={user} initialData={initialData} />;
}
