/*
  Warnings:

  - Changed the type of `platform` on the `Device` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('ios', 'android');

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "platform",
ADD COLUMN     "platform" "Platform" NOT NULL;
