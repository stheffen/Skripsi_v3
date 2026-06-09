import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RiwayatAnalisisClient from "./RiwayatAnalisisClient";
import { getRiwayatAnalisis } from "@/app/actions/analisis";

export default async function RiwayatAnalisisPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  if (user.role === 'dosen') {
    redirect("/dosen/dashboard");
  }

  const result = await getRiwayatAnalisis(parseInt(user.id));
  const data = result.data || [];

  return <RiwayatAnalisisClient riwayatData={data} />;
}
