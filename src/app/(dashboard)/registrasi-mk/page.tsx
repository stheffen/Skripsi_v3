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

  const userId = parseInt(user.id);

  // OPTIMIZED: Run both independent fetches in parallel (was 2 sequential awaits)
  const [res, stats] = await Promise.all([
    getMKPerSemesterUntukRegistrasi(userId),
    AkademikService.statistikPerSemester(userId),
  ]);

  const mkPerSemester = res.data || {};

  return <RegistrasiMKClient user={user} mkPerSemester={mkPerSemester} statHistory={stats} />;
}
