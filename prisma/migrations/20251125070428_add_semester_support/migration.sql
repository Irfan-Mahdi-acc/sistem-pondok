-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Nilai" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gradeType" TEXT NOT NULL DEFAULT 'NUMERIC',
    "score" REAL,
    "letterGrade" TEXT,
    "category" TEXT NOT NULL DEFAULT 'UJIAN',
    "semester" TEXT,
    "academicYearId" TEXT,
    "santriId" TEXT NOT NULL,
    "mapelId" TEXT,
    "ujianId" TEXT,
    "lembagaId" TEXT,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Nilai_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nilai_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nilai_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nilai_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nilai_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nilai_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LembagaGradeCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Nilai" ("category", "categoryId", "createdAt", "gradeType", "id", "lembagaId", "letterGrade", "mapelId", "santriId", "score", "ujianId", "updatedAt") SELECT "category", "categoryId", "createdAt", "gradeType", "id", "lembagaId", "letterGrade", "mapelId", "santriId", "score", "ujianId", "updatedAt" FROM "Nilai";
DROP TABLE "Nilai";
ALTER TABLE "new_Nilai" RENAME TO "Nilai";
CREATE TABLE "new_Tahfidz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "santriId" TEXT NOT NULL,
    "ustadzId" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "surah" TEXT NOT NULL,
    "ayatStart" INTEGER NOT NULL,
    "ayatEnd" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "grade" TEXT,
    "note" TEXT,
    "semester" TEXT,
    "academicYearId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tahfidz_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tahfidz_ustadzId_fkey" FOREIGN KEY ("ustadzId") REFERENCES "UstadzProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tahfidz_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tahfidz" ("ayatEnd", "ayatStart", "date", "grade", "id", "note", "santriId", "surah", "type", "ustadzId") SELECT "ayatEnd", "ayatStart", "date", "grade", "id", "note", "santriId", "surah", "type", "ustadzId" FROM "Tahfidz";
DROP TABLE "Tahfidz";
ALTER TABLE "new_Tahfidz" RENAME TO "Tahfidz";
CREATE TABLE "new_Ujian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "duration" INTEGER,
    "description" TEXT,
    "semester" TEXT,
    "academicYearId" TEXT,
    "mapelId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ujian_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ujian_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ujian" ("createdAt", "date", "description", "duration", "id", "mapelId", "name", "type", "updatedAt") SELECT "createdAt", "date", "description", "duration", "id", "mapelId", "name", "type", "updatedAt" FROM "Ujian";
DROP TABLE "Ujian";
ALTER TABLE "new_Ujian" RENAME TO "Ujian";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
