




-- DropTable

-- DropTable

-- DropTable

-- DropTable

-- DropTable

-- CreateTable
CREATE TABLE "v2_users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nim" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "semester_aktif" INTEGER,
    "angkatan" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_mata_kuliah" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "is_pilihan" BOOLEAN NOT NULL DEFAULT false,
    "kelompok_pilihan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_mata_kuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_khs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "mata_kuliah_id" INTEGER NOT NULL,
    "nilai" TEXT,
    "bobot_nilai" DOUBLE PRECISION,
    "semester_input" INTEGER,
    "semester_override" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_khs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_analisis_risiko" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "ipk" DOUBLE PRECISION NOT NULL,
    "ips" DOUBLE PRECISION NOT NULL,
    "mk_bermasalah" INTEGER NOT NULL,
    "fuzzy_output" DOUBLE PRECISION NOT NULL,
    "kategori" TEXT NOT NULL,
    "rekomendasi" TEXT NOT NULL,
    "detail_fuzzy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_analisis_risiko_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_dosen_mahasiswa" (
    "id" SERIAL NOT NULL,
    "dosen_id" INTEGER NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_dosen_mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_permohonan_ganti_dosen" (
    "id" SERIAL NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "dosen_lama_id" INTEGER NOT NULL,
    "dosen_baru_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "alasan" TEXT,
    "catatan_dosen" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_permohonan_ganti_dosen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "v2_users_email_key" ON "v2_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "v2_users_nim_key" ON "v2_users"("nim");

-- CreateIndex
CREATE INDEX "v2_users_role_idx" ON "v2_users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "v2_mata_kuliah_kode_key" ON "v2_mata_kuliah"("kode");

-- CreateIndex
CREATE INDEX "v2_khs_user_id_idx" ON "v2_khs"("user_id");

-- CreateIndex
CREATE INDEX "v2_khs_mata_kuliah_id_idx" ON "v2_khs"("mata_kuliah_id");

-- CreateIndex
CREATE INDEX "v2_khs_user_id_nilai_idx" ON "v2_khs"("user_id", "nilai");

-- CreateIndex
CREATE INDEX "v2_khs_user_id_mata_kuliah_id_idx" ON "v2_khs"("user_id", "mata_kuliah_id");

-- CreateIndex
CREATE INDEX "v2_analisis_risiko_user_id_idx" ON "v2_analisis_risiko"("user_id");

-- CreateIndex
CREATE INDEX "v2_analisis_risiko_user_id_created_at_idx" ON "v2_analisis_risiko"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "v2_analisis_risiko_user_id_semester_idx" ON "v2_analisis_risiko"("user_id", "semester");

-- CreateIndex
CREATE INDEX "v2_dosen_mahasiswa_dosen_id_idx" ON "v2_dosen_mahasiswa"("dosen_id");

-- CreateIndex
CREATE INDEX "v2_dosen_mahasiswa_mahasiswa_id_idx" ON "v2_dosen_mahasiswa"("mahasiswa_id");

-- CreateIndex
CREATE UNIQUE INDEX "v2_dosen_mahasiswa_dosen_id_mahasiswa_id_key" ON "v2_dosen_mahasiswa"("dosen_id", "mahasiswa_id");

-- CreateIndex
CREATE INDEX "v2_permohonan_ganti_dosen_mahasiswa_id_idx" ON "v2_permohonan_ganti_dosen"("mahasiswa_id");

-- CreateIndex
CREATE INDEX "v2_permohonan_ganti_dosen_dosen_lama_id_idx" ON "v2_permohonan_ganti_dosen"("dosen_lama_id");

-- CreateIndex
CREATE INDEX "v2_permohonan_ganti_dosen_dosen_baru_id_idx" ON "v2_permohonan_ganti_dosen"("dosen_baru_id");

-- AddForeignKey
ALTER TABLE "v2_khs" ADD CONSTRAINT "v2_khs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "v2_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_khs" ADD CONSTRAINT "v2_khs_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "v2_mata_kuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_analisis_risiko" ADD CONSTRAINT "v2_analisis_risiko_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "v2_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_dosen_mahasiswa" ADD CONSTRAINT "v2_dosen_mahasiswa_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "v2_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_dosen_mahasiswa" ADD CONSTRAINT "v2_dosen_mahasiswa_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "v2_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_permohonan_ganti_dosen" ADD CONSTRAINT "v2_permohonan_ganti_dosen_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "v2_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_permohonan_ganti_dosen" ADD CONSTRAINT "v2_permohonan_ganti_dosen_dosen_lama_id_fkey" FOREIGN KEY ("dosen_lama_id") REFERENCES "v2_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_permohonan_ganti_dosen" ADD CONSTRAINT "v2_permohonan_ganti_dosen_dosen_baru_id_fkey" FOREIGN KEY ("dosen_baru_id") REFERENCES "v2_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

