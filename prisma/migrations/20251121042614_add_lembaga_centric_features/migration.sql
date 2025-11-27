/*
  Warnings:

  - Added the required column `mapelId` to the `Nilai` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "JamPelajaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lembagaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "JamPelajaran_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JadwalPelajaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "mapelId" TEXT,
    "jamPelajaranId" TEXT NOT NULL,
    CONSTRAINT "JadwalPelajaran_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JadwalPelajaran_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JadwalPelajaran_jamPelajaranId_fkey" FOREIGN KEY ("jamPelajaranId") REFERENCES "JamPelajaran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Nilai" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "score" REAL NOT NULL,
    "santriId" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,
    "ujianId" TEXT NOT NULL,
    CONSTRAINT "Nilai_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nilai_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nilai_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Nilai" ("id", "santriId", "score", "ujianId") SELECT "id", "santriId", "score", "ujianId" FROM "Nilai";
DROP TABLE "Nilai";
ALTER TABLE "new_Nilai" RENAME TO "Nilai";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
