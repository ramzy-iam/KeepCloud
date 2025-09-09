/*
  Warnings:

  - The values [TREE_OWNER,COMMENTER] on the enum `FilePermissionRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FilePermissionRole_new" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');
ALTER TABLE "FileLink" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "FileLink" ALTER COLUMN "role" TYPE "FilePermissionRole_new" USING ("role"::text::"FilePermissionRole_new");
ALTER TABLE "FilePermission" ALTER COLUMN "role" TYPE "FilePermissionRole_new" USING ("role"::text::"FilePermissionRole_new");
ALTER TYPE "FilePermissionRole" RENAME TO "FilePermissionRole_old";
ALTER TYPE "FilePermissionRole_new" RENAME TO "FilePermissionRole";
DROP TYPE "FilePermissionRole_old";
ALTER TABLE "FileLink" ALTER COLUMN "role" SET DEFAULT 'VIEWER';
COMMIT;
