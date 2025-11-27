-- AlterTable
ALTER TABLE "Lembaga" ADD COLUMN "jenjang" TEXT;
ALTER TABLE "Lembaga" ADD COLUMN "logoUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Kelas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "nextKelasId" TEXT,
    CONSTRAINT "Kelas_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kelas_nextKelasId_fkey" FOREIGN KEY ("nextKelasId") REFERENCES "Kelas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Kelas" ("id", "lembagaId", "level", "name") SELECT "id", "lembagaId", "level", "name" FROM "Kelas";
DROP TABLE "Kelas";
ALTER TABLE "new_Kelas" RENAME TO "Kelas";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
