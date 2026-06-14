import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegistrasiMKClient from "./RegistrasiMKClient";
import { getMKPerSemesterUntukRegistrasi } from "@/app/actions/registrasi";
import { AkademikService } from "@/services/akademikService";

export default async function RegistrasiMKPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user;
  if (user.role === "dosen") redirect("/dosen/dashboard");

  const res = await getMKPerSemesterUntukRegistrasi(parseInt(user.id));
  const mkPerSemester = res.data || {};

  const stats = await AkademikService.statistikPerSemester(parseInt(user.id));

  return <RegistrasiMKClient user={user} mkPerSemester={mkPerSemester} statHistory={stats} />;
}
