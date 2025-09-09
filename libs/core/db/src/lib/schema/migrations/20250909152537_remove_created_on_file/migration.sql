/*
  Warnings:

  - You are about to drop the column `createdById` on the `File` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_createdById_fkey";

-- DropIndex
DROP INDEX "File_createdById_idx";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "createdById";
