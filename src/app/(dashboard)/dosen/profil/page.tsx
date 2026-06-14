import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfilClient from "@/app/(dashboard)/profil/ProfilClient";

export default async function DosenProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'dosen') {
    redirect("/login");
  }

  return <ProfilClient user={session.user} />;
}
