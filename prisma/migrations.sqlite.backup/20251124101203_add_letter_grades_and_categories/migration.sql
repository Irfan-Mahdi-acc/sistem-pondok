/*
  Warnings:

  - Added the required column `updatedAt` to the `Nilai` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PDFLayoutSettings" ADD COLUMN "content" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Nilai" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gradeType" TEXT NOT NULL DEFAULT 'NUMERIC',
    "score" REAL,
    "letterGrade" TEXT,
    "category" TEXT NOT NULL DEFAULT 'UJIAN',
    "santriId" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,
    "ujianId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Nilai_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nilai_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nilai_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Nilai" ("id", "mapelId", "santriId", "score", "ujianId") SELECT "id", "mapelId", "santriId", "score", "ujianId" FROM "Nilai";
DROP TABLE "Nilai";
ALTER TABLE "new_Nilai" RENAME TO "Nilai";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
