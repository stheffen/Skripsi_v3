import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/app/actions/dashboard";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  if (user.role === 'dosen') {
    redirect("/dosen/dashboard");
  }

  const data = await getDashboardData(
    parseInt(user.id),
    user.semester_aktif || 1
  );

  return <DashboardClient user={user} data={data} />;
}
