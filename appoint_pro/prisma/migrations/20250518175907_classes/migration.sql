/*
  Warnings:

  - A unique constraint covering the columns `[classId]` on the table `Settings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "SettingScope" ADD VALUE 'CLASS';

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "classId" TEXT;

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "facilityId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_classId_key" ON "Settings"("classId");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
