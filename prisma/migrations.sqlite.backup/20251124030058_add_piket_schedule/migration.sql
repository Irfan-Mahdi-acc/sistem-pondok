-- CreateTable
CREATE TABLE "PiketSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "asramaId" TEXT,
    "kelasId" TEXT,
    "day" TEXT NOT NULL,
    "santriId" TEXT NOT NULL,
    "area" TEXT,
    "role" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PiketSchedule_asramaId_fkey" FOREIGN KEY ("asramaId") REFERENCES "Asrama" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PiketSchedule_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PiketSchedule_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
