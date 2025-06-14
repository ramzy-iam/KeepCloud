/*
  Warnings:

  - Added the required column `createdById` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `left` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `right` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "left" INTEGER NOT NULL,
ADD COLUMN     "right" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "File_left_idx" ON "File"("left");

-- CreateIndex
CREATE INDEX "File_right_idx" ON "File"("right");

-- CreateIndex
CREATE INDEX "File_createdById_idx" ON "File"("createdById");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
