/*
  Warnings:

  - You are about to drop the `SharedFile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[treeOwnerId,left]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[treeOwnerId,right]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `treeOwnerId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FilePermissionRole" AS ENUM ('TREE_OWNER', 'OWNER', 'EDITOR', 'VIEWER', 'COMMENTER');

-- DropForeignKey
ALTER TABLE "SharedFile" DROP CONSTRAINT "SharedFile_fileId_fkey";

-- DropForeignKey
ALTER TABLE "SharedFile" DROP CONSTRAINT "SharedFile_sharedWithId_fkey";

-- DropIndex
DROP INDEX "File_left_idx";

-- DropIndex
DROP INDEX "File_right_idx";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "treeOwnerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "SharedFile";

-- DropEnum
DROP TYPE "PermissionType";

-- CreateTable
CREATE TABLE "FileLink" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "FilePermissionRole" NOT NULL DEFAULT 'VIEWER',
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "FileLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilePermission" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "FilePermissionRole" NOT NULL,
    "grantedById" TEXT NOT NULL,

    CONSTRAINT "FilePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileLink_token_key" ON "FileLink"("token");

-- CreateIndex
CREATE INDEX "FilePermission_fileId_idx" ON "FilePermission"("fileId");

-- CreateIndex
CREATE INDEX "FilePermission_userId_idx" ON "FilePermission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FilePermission_fileId_userId_key" ON "FilePermission"("fileId", "userId");

-- CreateIndex
CREATE INDEX "File_treeOwnerId_left_right_idx" ON "File"("treeOwnerId", "left", "right");

-- CreateIndex
CREATE INDEX "File_treeOwnerId_left_idx" ON "File"("treeOwnerId", "left");

-- CreateIndex
CREATE INDEX "File_treeOwnerId_right_idx" ON "File"("treeOwnerId", "right");

-- CreateIndex
CREATE INDEX "File_deletedAt_idx" ON "File"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "File_treeOwnerId_left_key" ON "File"("treeOwnerId", "left");

-- CreateIndex
CREATE UNIQUE INDEX "File_treeOwnerId_right_key" ON "File"("treeOwnerId", "right");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_treeOwnerId_fkey" FOREIGN KEY ("treeOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileLink" ADD CONSTRAINT "FileLink_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilePermission" ADD CONSTRAINT "FilePermission_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilePermission" ADD CONSTRAINT "FilePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilePermission" ADD CONSTRAINT "FilePermission_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
