import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import InputNilaiClient from "./InputNilaiClient";

export default async function InputNilaiPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  if (user.role === 'dosen') {
    redirect("/dosen/dashboard");
  }

  return <InputNilaiClient user={user} />;
}
