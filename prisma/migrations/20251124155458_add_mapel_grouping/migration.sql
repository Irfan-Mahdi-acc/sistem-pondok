-- CreateTable
CREATE TABLE "MapelGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mapel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "kelasId" TEXT NOT NULL,
    "ustadzId" TEXT,
    "groupId" TEXT,
    CONSTRAINT "Mapel_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mapel_ustadzId_fkey" FOREIGN KEY ("ustadzId") REFERENCES "UstadzProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Mapel_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MapelGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Mapel" ("code", "id", "kelasId", "name", "ustadzId") SELECT "code", "id", "kelasId", "name", "ustadzId" FROM "Mapel";
DROP TABLE "Mapel";
ALTER TABLE "new_Mapel" RENAME TO "Mapel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "MapelGroup_jenjang_idx" ON "MapelGroup"("jenjang");

-- CreateIndex
CREATE UNIQUE INDEX "MapelGroup_name_jenjang_key" ON "MapelGroup"("name", "jenjang");
