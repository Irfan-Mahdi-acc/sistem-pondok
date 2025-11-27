-- CreateTable
CREATE TABLE "LembagaGradeCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lembagaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupName" TEXT,
    "gradeType" TEXT NOT NULL DEFAULT 'LETTER',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LembagaGradeCategory_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "mapelId" TEXT,
    "ujianId" TEXT,
    "lembagaId" TEXT,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Nilai_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nilai_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nilai_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nilai_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nilai_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LembagaGradeCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Nilai" ("category", "createdAt", "gradeType", "id", "lembagaId", "letterGrade", "mapelId", "santriId", "score", "ujianId", "updatedAt") SELECT "category", "createdAt", "gradeType", "id", "lembagaId", "letterGrade", "mapelId", "santriId", "score", "ujianId", "updatedAt" FROM "Nilai";
DROP TABLE "Nilai";
ALTER TABLE "new_Nilai" RENAME TO "Nilai";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "LembagaGradeCategory_lembagaId_idx" ON "LembagaGradeCategory"("lembagaId");

-- CreateIndex
CREATE UNIQUE INDEX "LembagaGradeCategory_lembagaId_name_key" ON "LembagaGradeCategory"("lembagaId", "name");
