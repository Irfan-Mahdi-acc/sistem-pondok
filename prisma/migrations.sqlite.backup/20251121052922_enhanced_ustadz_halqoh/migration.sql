/*
  Warnings:

  - You are about to drop the column `juz` on the `Tahfidz` table. All the data in the column will be lost.
  - You are about to drop the column `nip` on the `UstadzProfile` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `UstadzProfile` table. All the data in the column will be lost.
  - Made the column `ayatEnd` on table `Tahfidz` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ayatStart` on table `Tahfidz` required. This step will fail if there are existing NULL values in that column.
  - Made the column `surah` on table `Tahfidz` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Halqoh" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ustadzId" TEXT,
    "schedule" TEXT,
    "level" TEXT,
    "maxCapacity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "Halqoh_ustadzId_fkey" FOREIGN KEY ("ustadzId") REFERENCES "UstadzProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Halqoh" ("id", "name", "ustadzId") SELECT "id", "name", "ustadzId" FROM "Halqoh";
DROP TABLE "Halqoh";
ALTER TABLE "new_Halqoh" RENAME TO "Halqoh";
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
    CONSTRAINT "Tahfidz_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tahfidz_ustadzId_fkey" FOREIGN KEY ("ustadzId") REFERENCES "UstadzProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tahfidz" ("ayatEnd", "ayatStart", "date", "grade", "id", "note", "santriId", "surah", "type") SELECT "ayatEnd", "ayatStart", "date", "grade", "id", "note", "santriId", "surah", "type" FROM "Tahfidz";
DROP TABLE "Tahfidz";
ALTER TABLE "new_Tahfidz" RENAME TO "Tahfidz";
CREATE TABLE "new_UstadzProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nik" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "birthPlace" TEXT,
    "birthDate" DATETIME,
    "hireDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "specialization" TEXT,
    "education" TEXT,
    CONSTRAINT "UstadzProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UstadzProfile" ("id", "userId") SELECT "id", "userId" FROM "UstadzProfile";
DROP TABLE "UstadzProfile";
ALTER TABLE "new_UstadzProfile" RENAME TO "UstadzProfile";
CREATE UNIQUE INDEX "UstadzProfile_userId_key" ON "UstadzProfile"("userId");
CREATE UNIQUE INDEX "UstadzProfile_nik_key" ON "UstadzProfile"("nik");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
