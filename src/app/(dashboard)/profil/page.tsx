import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfilClient from "./ProfilClient";
import prisma from "@/lib/prisma";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }
  
  let dosenPA = null;
  let dosenList = [];
  let permohonanAktif = null;
  
  if (session.user.role === 'mahasiswa') {
    const userId = parseInt(session.user.id);
    const dm = await prisma.dosenMahasiswa.findFirst({
      where: { mahasiswa_id: userId },
      include: { dosen: true }
    });
    if (dm) {
      dosenPA = { id: dm.dosen.id, name: dm.dosen.name };
    }
    
    dosenList = await prisma.user.findMany({
      where: { role: 'dosen' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
    
    permohonanAktif = await prisma.permohonanGantiDosen.findFirst({
      where: { mahasiswa_id: userId },
      orderBy: { created_at: 'desc' },
      include: { dosen_baru: { select: { name: true } } }
    });
  }

  return (
    <ProfilClient 
      user={session.user} 
      dosenPA={dosenPA} 
      dosenList={dosenList} 
      permohonanAktif={permohonanAktif} 
    />
  );
}
