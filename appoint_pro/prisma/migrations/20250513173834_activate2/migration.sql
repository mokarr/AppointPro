/*
  Warnings:

  - You are about to drop the column `active` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `ActivateToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `ActivateToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ActivateToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ActivateToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivateToken" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "active";

-- CreateIndex
CREATE UNIQUE INDEX "ActivateToken_token_key" ON "ActivateToken"("token");

-- AddForeignKey
ALTER TABLE "ActivateToken" ADD CONSTRAINT "ActivateToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
