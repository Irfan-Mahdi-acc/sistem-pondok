-- CreateTable
CREATE TABLE "GradeWeight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lembagaId" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GradeWeight_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GradeWeight_lembagaId_idx" ON "GradeWeight"("lembagaId");

-- CreateIndex
CREATE UNIQUE INDEX "GradeWeight_lembagaId_examType_key" ON "GradeWeight"("lembagaId", "examType");
