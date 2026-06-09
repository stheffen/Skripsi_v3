-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nim" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "semester_aktif" INTEGER,
    "angkatan" TEXT,
    "phone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "mata_kuliah" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "khs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "mata_kuliah_id" INTEGER NOT NULL,
    "nilai" TEXT,
    "bobot_nilai" REAL,
    "semester_input" INTEGER,
    "semester_override" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "khs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "khs_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analisis_risiko" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "total_sks" INTEGER NOT NULL,
    "ipk" REAL NOT NULL,
    "ips" REAL NOT NULL,
    "prediksi_keterlambatan" REAL NOT NULL,
    "persentase_risiko" REAL NOT NULL,
    "level_risiko" TEXT NOT NULL,
    "rekomendasi" TEXT NOT NULL,
    "mk_bermasalah" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "analisis_risiko_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dosen_mahasiswa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dosen_id" INTEGER NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dosen_mahasiswa_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dosen_mahasiswa_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nim_key" ON "users"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "mata_kuliah_kode_key" ON "mata_kuliah"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "khs_user_id_mata_kuliah_id_key" ON "khs"("user_id", "mata_kuliah_id");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_mahasiswa_dosen_id_mahasiswa_id_key" ON "dosen_mahasiswa"("dosen_id", "mahasiswa_id");
