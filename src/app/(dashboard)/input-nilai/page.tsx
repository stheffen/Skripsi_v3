import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import InputNilaiClient from "./InputNilaiClient";
import { getFilledSemesters } from "@/app/actions/khs";

export default async function InputNilaiPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  if (user.role === 'dosen') {
    redirect("/dosen/dashboard");
  }

  const filledSemRes = await getFilledSemesters(parseInt(user.id));
  const filledSemesters = filledSemRes.data || [1];
  if (filledSemesters.length === 0) filledSemesters.push(1);

  return <InputNilaiClient user={user} filledSemesters={filledSemesters} />;
}
