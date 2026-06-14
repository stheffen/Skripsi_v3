import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hitungSemesterAktif(angkatanStr: string | number | null | undefined): number {
  if (!angkatanStr) return 1;
  const angkatan = parseInt(String(angkatanStr));
  if (isNaN(angkatan)) return 1;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  let diffYear = currentYear - angkatan;
  if (diffYear < 0) diffYear = 0;
  
  // Jika bulan Agustus ke atas (8-12), masuk semester ganjil
  // Jika bulan Januari - Juli (1-7), masuk semester genap
  if (currentMonth >= 8) {
    return diffYear * 2 + 1;
  } else {
    if (diffYear === 0) return 1;
    return diffYear * 2;
  }
}
