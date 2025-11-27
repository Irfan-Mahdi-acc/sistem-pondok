/*
  Warnings:

  - You are about to drop the column `jenjang` on the `MapelGroup` table. All the data in the column will be lost.
  - Added the required column `lembagaId` to the `MapelGroup` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MapelGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lembagaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MapelGroup_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MapelGroup" ("createdAt", "id", "name", "order", "updatedAt") SELECT "createdAt", "id", "name", "order", "updatedAt" FROM "MapelGroup";
DROP TABLE "MapelGroup";
ALTER TABLE "new_MapelGroup" RENAME TO "MapelGroup";
CREATE INDEX "MapelGroup_lembagaId_idx" ON "MapelGroup"("lembagaId");
CREATE UNIQUE INDEX "MapelGroup_lembagaId_name_key" ON "MapelGroup"("lembagaId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
