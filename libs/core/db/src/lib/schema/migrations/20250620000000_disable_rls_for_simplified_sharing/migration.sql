-- Disable RLS for simplified file sharing approach
-- This migration disables Row Level Security and removes complex policies
-- in favor of application-level user filtering as suggested in the requirements

-- 1. Drop all existing RLS policies
DROP POLICY IF EXISTS user_select ON "User";
DROP POLICY IF EXISTS user_insert ON "User";
DROP POLICY IF EXISTS user_update ON "User";
DROP POLICY IF EXISTS user_delete ON "User";

DROP POLICY IF EXISTS file_select ON "File";
DROP POLICY IF EXISTS file_insert ON "File";
DROP POLICY IF EXISTS file_update ON "File";
DROP POLICY IF EXISTS file_delete ON "File";

DROP POLICY IF EXISTS shared_file_select ON "SharedFile";
DROP POLICY IF EXISTS shared_file_insert ON "SharedFile";
DROP POLICY IF EXISTS shared_file_update ON "SharedFile";
DROP POLICY IF EXISTS shared_file_delete ON "SharedFile";

DROP POLICY IF EXISTS file_access_log_select ON "FileAccessLog";
DROP POLICY IF EXISTS file_access_log_insert ON "FileAccessLog";
DROP POLICY IF EXISTS file_access_log_update ON "FileAccessLog";
DROP POLICY IF EXISTS file_access_log_delete ON "FileAccessLog";

-- 2. Drop RLS helper functions (they won't be needed)
DROP FUNCTION IF EXISTS check_file_access(text, text);
DROP FUNCTION IF EXISTS check_file_ownership(text, text);
DROP FUNCTION IF EXISTS check_shared_file_ownership(text, text);

-- 3. Disable RLS on all tables
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "File" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SharedFile" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FileAccessLog" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SubscriptionPlan" DISABLE ROW LEVEL SECURITY;

-- 4. Add indexes for better performance with application-level filtering
CREATE INDEX IF NOT EXISTS idx_file_owner_id_not_trashed 
ON "File" ("ownerId") 
WHERE "trashedAt" IS NULL AND "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS idx_shared_file_shared_with_active 
ON "SharedFile" ("sharedWithId") 
WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS idx_shared_file_file_active 
ON "SharedFile" ("fileId") 
WHERE "deletedAt" IS NULL;

-- Add comment explaining the change
COMMENT ON TABLE "File" IS 'File table with application-level user filtering instead of RLS';
COMMENT ON TABLE "SharedFile" IS 'SharedFile table for managing file sharing with application-level security';