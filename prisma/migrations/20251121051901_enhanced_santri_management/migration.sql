-- CreateTable
CREATE TABLE "KelasHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "santriId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "academicYear" TEXT NOT NULL,
    "semester" TEXT,
    "status" TEXT NOT NULL,
    CONSTRAINT "KelasHistory_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KelasHistory_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "santriId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "action" TEXT,
    "reportedBy" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "Violation_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Santri" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nis" TEXT NOT NULL,
    "nisn" TEXT,
    "nama" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthPlace" TEXT,
    "birthDate" DATETIME,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "bpjsNumber" TEXT,
    "kkNumber" TEXT,
    "nikNumber" TEXT,
    "previousSchool" TEXT,
    "entryDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fatherName" TEXT,
    "fatherNik" TEXT,
    "fatherPhone" TEXT,
    "fatherJob" TEXT,
    "fatherIncome" TEXT,
    "motherName" TEXT,
    "motherNik" TEXT,
    "motherPhone" TEXT,
    "motherJob" TEXT,
    "motherIncome" TEXT,
    "waliName" TEXT,
    "waliNik" TEXT,
    "waliPhone" TEXT,
    "waliJob" TEXT,
    "waliRelation" TEXT,
    "waliPassword" TEXT,
    "userId" TEXT,
    "lembagaId" TEXT NOT NULL,
    "kelasId" TEXT,
    "asramaId" TEXT,
    "halqohId" TEXT,
    CONSTRAINT "Santri_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Santri_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Santri_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Santri_asramaId_fkey" FOREIGN KEY ("asramaId") REFERENCES "Asrama" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Santri_halqohId_fkey" FOREIGN KEY ("halqohId") REFERENCES "Halqoh" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Santri" ("address", "asramaId", "birthDate", "birthPlace", "fatherName", "gender", "halqohId", "id", "kelasId", "lembagaId", "motherName", "nama", "nis", "userId", "waliName", "waliPassword", "waliPhone") SELECT "address", "asramaId", "birthDate", "birthPlace", "fatherName", "gender", "halqohId", "id", "kelasId", "lembagaId", "motherName", "nama", "nis", "userId", "waliName", "waliPassword", "waliPhone" FROM "Santri";
DROP TABLE "Santri";
ALTER TABLE "new_Santri" RENAME TO "Santri";
CREATE UNIQUE INDEX "Santri_nis_key" ON "Santri"("nis");
CREATE UNIQUE INDEX "Santri_userId_key" ON "Santri"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
