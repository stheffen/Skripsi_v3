import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PermohonanClient from "./PermohonanClient";
import { getPermohonanMasuk } from "@/app/actions/dosen";

export default async function PermohonanPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "dosen") {
    redirect("/login");
  }

  const res = await getPermohonanMasuk(parseInt(session.user.id));
  const permohonan = res.success ? res.data : [];

  return <PermohonanClient initialData={permohonan} />;
}
