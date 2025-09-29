-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('FILE', 'FOLDER');

-- CreateEnum
CREATE TYPE "AccessAction" AS ENUM ('VIEW', 'DOWNLOAD', 'EDIT', 'SHARE');

-- CreateEnum
CREATE TYPE "FilePermissionRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "trashedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "isFolder" BOOLEAN NOT NULL DEFAULT false,
    "format" TEXT,
    "size" BIGINT NOT NULL,
    "type" "FileType" NOT NULL DEFAULT 'FILE',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "storagePath" TEXT,
    "parentId" TEXT,
    "ownerId" TEXT NOT NULL,
    "treeOwnerId" TEXT NOT NULL,
    "left" INTEGER NOT NULL,
    "right" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAccessLog" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "userId" TEXT,
    "fileId" TEXT NOT NULL,
    "action" "AccessAction" NOT NULL,
    "ipAddress" TEXT,
    "deviceInfo" TEXT,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileLink" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "FilePermissionRole" NOT NULL DEFAULT 'VIEWER',

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
    "isInherited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FilePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "nameKey" TEXT NOT NULL,
    "descriptionKey" TEXT NOT NULL,
    "maxStorage" BIGINT NOT NULL,
    "price" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT nanoid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "firstName" TEXT,
    "lastName" TEXT,
    "picture" TEXT,
    "email" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "storageUsed" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "File_treeOwnerId_left_right_idx" ON "File"("treeOwnerId", "left", "right");

-- CreateIndex
CREATE INDEX "File_treeOwnerId_left_idx" ON "File"("treeOwnerId", "left");

-- CreateIndex
CREATE INDEX "File_treeOwnerId_right_idx" ON "File"("treeOwnerId", "right");

-- CreateIndex
CREATE INDEX "File_ownerId_idx" ON "File"("ownerId");

-- CreateIndex
CREATE INDEX "File_parentId_idx" ON "File"("parentId");

-- CreateIndex
CREATE INDEX "File_trashedAt_idx" ON "File"("trashedAt");

-- CreateIndex
CREATE INDEX "File_deletedAt_idx" ON "File"("deletedAt");

-- CreateIndex
CREATE INDEX "FileAccessLog_userId_idx" ON "FileAccessLog"("userId");

-- CreateIndex
CREATE INDEX "FileAccessLog_fileId_idx" ON "FileAccessLog"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "FileLink_token_key" ON "FileLink"("token");

-- CreateIndex
CREATE INDEX "FilePermission_fileId_idx" ON "FilePermission"("fileId");

-- CreateIndex
CREATE INDEX "FilePermission_userId_idx" ON "FilePermission"("userId");

-- CreateIndex
CREATE INDEX "FilePermission_isInherited_idx" ON "FilePermission"("isInherited");

-- CreateIndex
CREATE UNIQUE INDEX "FilePermission_fileId_userId_key" ON "FilePermission"("fileId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_nameKey_key" ON "SubscriptionPlan"("nameKey");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_descriptionKey_key" ON "SubscriptionPlan"("descriptionKey");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_treeOwnerId_fkey" FOREIGN KEY ("treeOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAccessLog" ADD CONSTRAINT "FileAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAccessLog" ADD CONSTRAINT "FileAccessLog_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileLink" ADD CONSTRAINT "FileLink_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilePermission" ADD CONSTRAINT "FilePermission_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilePermission" ADD CONSTRAINT "FilePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilePermission" ADD CONSTRAINT "FilePermission_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
