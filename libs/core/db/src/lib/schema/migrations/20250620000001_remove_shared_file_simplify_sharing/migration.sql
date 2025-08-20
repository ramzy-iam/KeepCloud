-- Remove SharedFile model and simplify file sharing
-- Drop SharedFile table and related constraints
DROP TABLE IF EXISTS "SharedFile";
DROP TYPE IF EXISTS "PermissionType";

-- Add simple sharing fields to File model
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "isShared" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "shareToken" TEXT UNIQUE;
ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "shareExpiry" TIMESTAMP(3);

-- Add indexes for sharing performance
CREATE INDEX IF NOT EXISTS "File_shareToken_idx" ON "File"("shareToken");
CREATE INDEX IF NOT EXISTS "File_isPublic_idx" ON "File"("isPublic");
CREATE INDEX IF NOT EXISTS "File_isShared_idx" ON "File"("isShared");

-- Remove any remaining RLS policies (if they exist)
DROP POLICY IF EXISTS "Users can only access their own files" ON "File";
DROP POLICY IF EXISTS "Users can access shared files" ON "File";
ALTER TABLE "File" DISABLE ROW LEVEL SECURITY;