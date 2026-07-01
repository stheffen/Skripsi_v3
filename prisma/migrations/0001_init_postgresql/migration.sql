-- CreateTable
CREATE TABLE "users" (
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

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_kuliah" (
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

    CONSTRAINT "mata_kuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "khs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "mata_kuliah_id" INTEGER NOT NULL,
    "nilai" TEXT,
    "bobot_nilai" DOUBLE PRECISION,
    "semester_input" INTEGER,
    "semester_override" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "khs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analisis_risiko" (
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

    CONSTRAINT "analisis_risiko_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dosen_mahasiswa" (
    "id" SERIAL NOT NULL,
    "dosen_id" INTEGER NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dosen_mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nim_key" ON "users"("nim");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "mata_kuliah_kode_key" ON "mata_kuliah"("kode");

-- CreateIndex
CREATE INDEX "khs_user_id_idx" ON "khs"("user_id");

-- CreateIndex
CREATE INDEX "khs_mata_kuliah_id_idx" ON "khs"("mata_kuliah_id");

-- CreateIndex
CREATE INDEX "khs_user_id_nilai_idx" ON "khs"("user_id", "nilai");

-- CreateIndex
CREATE INDEX "khs_user_id_mata_kuliah_id_idx" ON "khs"("user_id", "mata_kuliah_id");

-- CreateIndex
CREATE INDEX "analisis_risiko_user_id_idx" ON "analisis_risiko"("user_id");

-- CreateIndex
CREATE INDEX "analisis_risiko_user_id_created_at_idx" ON "analisis_risiko"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "analisis_risiko_user_id_semester_idx" ON "analisis_risiko"("user_id", "semester");

-- CreateIndex
CREATE INDEX "dosen_mahasiswa_dosen_id_idx" ON "dosen_mahasiswa"("dosen_id");

-- CreateIndex
CREATE INDEX "dosen_mahasiswa_mahasiswa_id_idx" ON "dosen_mahasiswa"("mahasiswa_id");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_mahasiswa_dosen_id_mahasiswa_id_key" ON "dosen_mahasiswa"("dosen_id", "mahasiswa_id");

-- AddForeignKey
ALTER TABLE "khs" ADD CONSTRAINT "khs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khs" ADD CONSTRAINT "khs_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analisis_risiko" ADD CONSTRAINT "analisis_risiko_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dosen_mahasiswa" ADD CONSTRAINT "dosen_mahasiswa_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dosen_mahasiswa" ADD CONSTRAINT "dosen_mahasiswa_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
