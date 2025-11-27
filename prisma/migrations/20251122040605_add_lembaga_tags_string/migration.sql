/*
  Warnings:

  - You are about to drop the column `supervisor` on the `Asrama` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lembaga" ADD COLUMN "tags" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asrama" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "gender" TEXT,
    "address" TEXT,
    "ketuaAsramaId" TEXT,
    "musyrifId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Asrama_ketuaAsramaId_fkey" FOREIGN KEY ("ketuaAsramaId") REFERENCES "Santri" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Asrama_musyrifId_fkey" FOREIGN KEY ("musyrifId") REFERENCES "UstadzProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Asrama" ("address", "capacity", "createdAt", "gender", "id", "name", "updatedAt") SELECT "address", "capacity", "createdAt", "gender", "id", "name", "updatedAt" FROM "Asrama";
DROP TABLE "Asrama";
ALTER TABLE "new_Asrama" RENAME TO "Asrama";
CREATE UNIQUE INDEX "Asrama_ketuaAsramaId_key" ON "Asrama"("ketuaAsramaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
