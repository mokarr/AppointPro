-- AlterEnum
ALTER TYPE "BookingType" ADD VALUE 'CLASS_SESSION';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "personCount" INTEGER;
