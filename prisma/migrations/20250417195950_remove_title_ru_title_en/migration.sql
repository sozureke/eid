/*
  Warnings:

  - You are about to drop the column `titleEn` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `titleRu` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `title` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "titleEn",
DROP COLUMN "titleRu",
ADD COLUMN     "title" TEXT NOT NULL;
