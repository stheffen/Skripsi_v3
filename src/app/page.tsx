import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === 'dosen') {
    redirect("/dosen/dashboard");
  } else {
    redirect("/dashboard");
  }
}
