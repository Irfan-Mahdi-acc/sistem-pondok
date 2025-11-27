-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AcademicCalendar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "academicYear" TEXT,
    "lembagaId" TEXT,
    CONSTRAINT "AcademicCalendar_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AcademicCalendar" ("description", "endDate", "id", "startDate", "title", "type") SELECT "description", "endDate", "id", "startDate", "title", "type" FROM "AcademicCalendar";
DROP TABLE "AcademicCalendar";
ALTER TABLE "new_AcademicCalendar" RENAME TO "AcademicCalendar";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
