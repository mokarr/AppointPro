-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "_FacilityToFeature" ADD CONSTRAINT "_FacilityToFeature_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FacilityToFeature_AB_unique";
