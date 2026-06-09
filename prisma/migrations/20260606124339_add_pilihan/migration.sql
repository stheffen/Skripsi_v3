-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_mata_kuliah" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "is_pilihan" BOOLEAN NOT NULL DEFAULT false,
    "kelompok_pilihan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_mata_kuliah" ("created_at", "id", "jenis", "kode", "nama", "semester", "sks", "updated_at") SELECT "created_at", "id", "jenis", "kode", "nama", "semester", "sks", "updated_at" FROM "mata_kuliah";
DROP TABLE "mata_kuliah";
ALTER TABLE "new_mata_kuliah" RENAME TO "mata_kuliah";
CREATE UNIQUE INDEX "mata_kuliah_kode_key" ON "mata_kuliah"("kode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
