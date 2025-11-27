/*
  Warnings:

  - Added the required column `updatedAt` to the `DocumentArchive` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentArchive" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lembagaId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "DocumentArchive_lembagaId_idx" ON "DocumentArchive"("lembagaId");

-- CreateIndex
CREATE INDEX "DocumentArchive_type_idx" ON "DocumentArchive"("type");

-- CreateIndex
CREATE INDEX "DocumentArchive_date_idx" ON "DocumentArchive"("date");

-- AddForeignKey
ALTER TABLE "DocumentArchive" ADD CONSTRAINT "DocumentArchive_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE SET NULL ON UPDATE CASCADE;
