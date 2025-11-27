/*
  Warnings:

  - Added the required column `updatedAt` to the `Asrama` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asrama" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "gender" TEXT,
    "address" TEXT,
    "supervisor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Asrama" ("capacity", "id", "name", "supervisor") SELECT "capacity", "id", "name", "supervisor" FROM "Asrama";
DROP TABLE "Asrama";
ALTER TABLE "new_Asrama" RENAME TO "Asrama";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
