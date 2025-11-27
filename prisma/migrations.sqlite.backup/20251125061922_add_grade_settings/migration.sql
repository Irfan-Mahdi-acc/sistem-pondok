-- CreateTable
CREATE TABLE "GradeSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lembagaId" TEXT NOT NULL,
    "gradeValue" REAL NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GradeSetting_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GradeSetting_lembagaId_idx" ON "GradeSetting"("lembagaId");

-- CreateIndex
CREATE UNIQUE INDEX "GradeSetting_lembagaId_gradeValue_key" ON "GradeSetting"("lembagaId", "gradeValue");
