-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExamQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ujianId" TEXT NOT NULL,
    "questionBankId" TEXT,
    "directQuestion" TEXT,
    "directType" TEXT,
    "directOptions" TEXT,
    "directAnswer" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "itemType" TEXT NOT NULL DEFAULT 'QUESTION',
    CONSTRAINT "ExamQuestion_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamQuestion_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ExamQuestion" ("directAnswer", "directOptions", "directQuestion", "directType", "id", "imageUrl", "order", "points", "questionBankId", "ujianId") SELECT "directAnswer", "directOptions", "directQuestion", "directType", "id", "imageUrl", "order", "points", "questionBankId", "ujianId" FROM "ExamQuestion";
DROP TABLE "ExamQuestion";
ALTER TABLE "new_ExamQuestion" RENAME TO "ExamQuestion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
