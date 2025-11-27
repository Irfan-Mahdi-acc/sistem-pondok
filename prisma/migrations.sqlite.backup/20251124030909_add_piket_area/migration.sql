-- CreateTable
CREATE TABLE "PiketArea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PiketSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "asramaId" TEXT,
    "kelasId" TEXT,
    "day" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "area" TEXT,
    "role" TEXT,
    "piketAreaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PiketSchedule_asramaId_fkey" FOREIGN KEY ("asramaId") REFERENCES "Asrama" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PiketSchedule_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PiketSchedule_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PiketSchedule_piketAreaId_fkey" FOREIGN KEY ("piketAreaId") REFERENCES "PiketArea" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PiketSchedule" ("area", "asramaId", "createdAt", "day", "id", "kelasId", "role", "santriId", "type", "updatedAt") SELECT "area", "asramaId", "createdAt", "day", "id", "kelasId", "role", "santriId", "type", "updatedAt" FROM "PiketSchedule";
DROP TABLE "PiketSchedule";
ALTER TABLE "new_PiketSchedule" RENAME TO "PiketSchedule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
