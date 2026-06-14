import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Early Warning System",
  description: "Deteksi Dini Risiko Akademik Mahasiswa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="font-sans antialiased bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
