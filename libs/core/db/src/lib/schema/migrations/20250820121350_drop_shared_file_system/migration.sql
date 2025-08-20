-- Migration to drop the SharedFile system completely

-- 1. Drop all SharedFile related policies
DROP POLICY IF EXISTS shared_file_select ON "SharedFile";
DROP POLICY IF EXISTS shared_file_insert ON "SharedFile";
DROP POLICY IF EXISTS shared_file_update ON "SharedFile";
DROP POLICY IF EXISTS shared_file_delete ON "SharedFile";

-- 2. Drop helper functions related to SharedFile
DROP FUNCTION IF EXISTS check_file_access(text, text);
DROP FUNCTION IF EXISTS check_shared_file_ownership(text, text);

-- 3. Drop the SharedFile table
DROP TABLE IF EXISTS "SharedFile";

-- 4. Drop the PermissionType enum (only used for SharedFile)
DROP TYPE IF EXISTS "PermissionType";

-- 5. Update File table RLS policies to remove SharedFile dependencies
-- Drop existing file_select policy that references check_file_access
DROP POLICY IF EXISTS file_select ON "File";

-- Recreate file_select policy without SharedFile references
CREATE POLICY file_select ON "File"
  FOR SELECT
  USING (
    current_setting('app.bypass_rls', true) = 'on' OR
    "ownerId" = current_setting('app.current_user_id', true)
  );

-- 6. Update FileAccessLog table policies to remove SharedFile dependencies  
-- Drop existing policy that references check_file_access
DROP POLICY IF EXISTS file_access_log_select ON "FileAccessLog";

-- Recreate policy without SharedFile references
CREATE POLICY file_access_log_select ON "FileAccessLog"
  FOR SELECT
  USING (
    current_setting('app.bypass_rls', true) = 'on' OR
    "userId" = current_setting('app.current_user_id', true) OR 
    check_file_ownership("fileId", current_setting('app.current_user_id', true))
  );