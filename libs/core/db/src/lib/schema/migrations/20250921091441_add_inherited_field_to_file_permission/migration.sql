-- AlterTable
ALTER TABLE "FilePermission" ADD COLUMN     "isInherited" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "FilePermission_isInherited_idx" ON "FilePermission"("isInherited");
