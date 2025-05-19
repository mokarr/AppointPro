-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('NORMAL', 'CLASSES');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "type" "BookingType" NOT NULL DEFAULT 'NORMAL';
