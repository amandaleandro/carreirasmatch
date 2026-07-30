-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "universityId" TEXT;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
