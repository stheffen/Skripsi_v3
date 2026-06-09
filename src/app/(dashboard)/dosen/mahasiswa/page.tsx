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

  const res = await getDosenMahasiswaList();
  const mahasiswaList = res.data || [];

  return <DosenMahasiswaClient mahasiswaList={mahasiswaList} />;
}
