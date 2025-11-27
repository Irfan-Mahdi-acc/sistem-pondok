/*
  Warnings:

  - You are about to drop the `Violation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Violation";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ViolationCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ViolationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "santriId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "sanction" TEXT,
    "status" TEXT NOT NULL,
    "reportedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ViolationRecord_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ViolationRecord_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ViolationCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AchievementRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "santriId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "rank" TEXT,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AchievementRecord_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IbadahRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "santriId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "prayer" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IbadahRecord_santriId_fkey" FOREIGN KEY ("santriId") REFERENCES "Santri" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "IbadahRecord_santriId_date_prayer_key" ON "IbadahRecord"("santriId", "date", "prayer");
