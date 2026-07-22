import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDosenMahasiswaList } from "@/app/actions/dosen";
import DosenMahasiswaClient from "./DosenMahasiswaClient";

export default async function DosenMahasiswaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'dosen') {
    redirect("/login");
  }

  const res = await getDosenMahasiswaList(parseInt(session.user.id));
  const mahasiswaList = ('data' in res && res.data) ? res.data : [];

  return <DosenMahasiswaClient dosenId={parseInt(session.user.id)} mahasiswaList={mahasiswaList} />;
}
