-- AlterTable
ALTER TABLE "Lembaga" ADD COLUMN     "mudirId" TEXT;

-- AddForeignKey
ALTER TABLE "Lembaga" ADD CONSTRAINT "Lembaga_mudirId_fkey" FOREIGN KEY ("mudirId") REFERENCES "UstadzProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
