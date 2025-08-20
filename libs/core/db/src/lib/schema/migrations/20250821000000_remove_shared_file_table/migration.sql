-- Remove SharedFile table and implement token-based file sharing
-- This migration completely removes the SharedFile table and adds 
-- sharing functionality directly to the File table for better scalability

-- 1. Add sharing fields to File table
ALTER TABLE "File" ADD COLUMN "shareToken" VARCHAR(32);
ALTER TABLE "File" ADD COLUMN "isPublic" BOOLEAN DEFAULT FALSE;
ALTER TABLE "File" ADD COLUMN "sharePermissions" TEXT DEFAULT 'VIEW'; -- 'VIEW', 'EDIT', 'COMMENT'
ALTER TABLE "File" ADD COLUMN "shareExpiresAt" TIMESTAMP;

-- 2. Create indexes for efficient sharing queries
CREATE INDEX IF NOT EXISTS idx_file_share_token 
ON "File" ("shareToken") 
WHERE "shareToken" IS NOT NULL AND "isPublic" = TRUE;

CREATE INDEX IF NOT EXISTS idx_file_public_active 
ON "File" ("isPublic", "shareExpiresAt") 
WHERE "isPublic" = TRUE AND ("shareExpiresAt" IS NULL OR "shareExpiresAt" > NOW());

-- 3. Drop the SharedFile table completely
DROP TABLE IF EXISTS "SharedFile";

-- 4. Drop the PermissionType enum that was only used by SharedFile
DROP TYPE IF EXISTS "PermissionType";

-- 5. Add comments explaining the new sharing approach
COMMENT ON COLUMN "File"."shareToken" IS 'Unique token for sharing files publicly - acts as access key';
COMMENT ON COLUMN "File"."isPublic" IS 'Whether the file is publicly accessible via share token';
COMMENT ON COLUMN "File"."sharePermissions" IS 'Permission level for shared access: VIEW, EDIT, or COMMENT';
COMMENT ON COLUMN "File"."shareExpiresAt" IS 'When the share link expires (NULL for never expires)';