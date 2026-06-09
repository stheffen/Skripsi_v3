import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/input-nilai/:path*",
    "/hasil-analisis/:path*",
    "/riwayat-analisis/:path*",
    "/simulasi/:path*",
    "/profil/:path*",
  ],
};
