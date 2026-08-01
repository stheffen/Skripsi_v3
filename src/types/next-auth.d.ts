import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      nim?: string | null;
      semester_aktif?: number | null;
      angkatan?: string | null;
      has_pa: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    nim?: string | null;
    semester_aktif?: number | null;
    angkatan?: string | null;
    has_pa?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    nim?: string | null;
    semester_aktif?: number | null;
    angkatan?: string | null;
    has_pa?: boolean;
  }
}
