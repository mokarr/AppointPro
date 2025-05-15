-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('PRIVATE', 'PUBLIC', 'CLASSES');

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "type" "FacilityType" NOT NULL DEFAULT 'PRIVATE';
