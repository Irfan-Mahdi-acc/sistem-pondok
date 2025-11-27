/*
  Warnings:

  - Added the required column `updatedAt` to the `Ujian` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "QuestionCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mapelId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuestionCategory_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "points" INTEGER NOT NULL DEFAULT 1,
    "explanation" TEXT,
    "mapelId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuestionBank_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuestionBank_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "QuestionCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionBank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ujianId" TEXT NOT NULL,
    "questionBankId" TEXT,
    "directQuestion" TEXT,
    "directType" TEXT,
    "directOptions" TEXT,
    "directAnswer" TEXT,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "ExamQuestion_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamQuestion_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ujian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "duration" INTEGER,
    "description" TEXT,
    "mapelId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ujian_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "Mapel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ujian" ("date", "id", "mapelId", "name", "type") SELECT "date", "id", "mapelId", "name", "type" FROM "Ujian";
DROP TABLE "Ujian";
ALTER TABLE "new_Ujian" RENAME TO "Ujian";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roles" TEXT NOT NULL DEFAULT '[]',
    "avatarUrl" TEXT,
    "passwordChangedAt" DATETIME,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "createdAt", "failedLoginAttempts", "id", "lockedUntil", "name", "password", "passwordChangedAt", "role", "updatedAt", "username") SELECT "avatarUrl", "createdAt", "failedLoginAttempts", "id", "lockedUntil", "name", "password", "passwordChangedAt", "role", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_UstadzProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "nik" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "birthPlace" TEXT,
    "birthDate" DATETIME,
    "hireDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "specialization" TEXT,
    "education" TEXT,
    CONSTRAINT "UstadzProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UstadzProfile" ("address", "birthDate", "birthPlace", "education", "hireDate", "id", "nik", "phone", "specialization", "status", "userId") SELECT "address", "birthDate", "birthPlace", "education", "hireDate", "id", "nik", "phone", "specialization", "status", "userId" FROM "UstadzProfile";
DROP TABLE "UstadzProfile";
ALTER TABLE "new_UstadzProfile" RENAME TO "UstadzProfile";
CREATE UNIQUE INDEX "UstadzProfile_userId_key" ON "UstadzProfile"("userId");
CREATE UNIQUE INDEX "UstadzProfile_nik_key" ON "UstadzProfile"("nik");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
