/*
  Warnings:

  - Added the required column `updatedAt` to the `AcademicCalendar` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "EventLembaga" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    CONSTRAINT "EventLembaga_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "AcademicCalendar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventLembaga_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lembagaId" TEXT,
    CONSTRAINT "AcademicCalendar_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AcademicCalendar" ("academicYear", "description", "endDate", "id", "lembagaId", "startDate", "title", "type") SELECT "academicYear", "description", "endDate", "id", "lembagaId", "startDate", "title", "type" FROM "AcademicCalendar";
DROP TABLE "AcademicCalendar";
ALTER TABLE "new_AcademicCalendar" RENAME TO "AcademicCalendar";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "passwordChangedAt" DATETIME,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "createdAt", "id", "name", "password", "role", "updatedAt", "username") SELECT "avatarUrl", "createdAt", "id", "name", "password", "role", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EventLembaga_eventId_lembagaId_key" ON "EventLembaga"("eventId", "lembagaId");
