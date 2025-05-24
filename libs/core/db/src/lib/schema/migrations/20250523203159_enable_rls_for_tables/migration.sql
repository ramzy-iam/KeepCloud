-- 1. Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "File" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "SharedFile" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "FileAccessLog" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "SubscriptionPlan" ENABLE ROW LEVEL SECURITY;

-- 2. Security definer helper functions
-- Check if a file is shared with a user (no RLS applied)
CREATE OR REPLACE FUNCTION check_file_access(file_id text, user_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "SharedFile"
    WHERE "fileId" = file_id
    AND "sharedWithId" = user_id
    AND "deletedAt" IS NULL
  )
$$;

-- Check if user owns a file (no RLS applied)
CREATE OR REPLACE FUNCTION check_file_ownership(file_id text, user_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "File"
    WHERE id = file_id
    AND "ownerId" = user_id
  )
$$;

-- Check if user owns a shared file record (no RLS applied)
CREATE OR REPLACE FUNCTION check_shared_file_ownership(shared_file_id text, user_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "SharedFile" sf
    JOIN "File" f ON sf."fileId" = f.id
    WHERE sf.id = shared_file_id
    AND f."ownerId" = user_id
  )
$$;

-- 3. User table policies
CREATE POLICY user_select ON "User"
  FOR SELECT
  USING (current_setting('app.bypass_rls', true) = 'on' OR id = current_setting('app.current_user_id', true));

CREATE POLICY user_insert ON "User"
  FOR INSERT
  WITH CHECK (current_setting('app.bypass_rls', true) = 'on');

CREATE POLICY user_update ON "User"
  FOR UPDATE
  USING (current_setting('app.bypass_rls', true) = 'on' OR id = current_setting('app.current_user_id', true))
  WITH CHECK  (current_setting('app.bypass_rls', true) = 'on' OR id = current_setting('app.current_user_id', true));

CREATE POLICY user_delete ON "User"
  FOR DELETE
  USING (current_setting('app.bypass_rls', true) = 'on'  OR id = current_setting('app.current_user_id', true));

-- 4. File table policies
CREATE POLICY file_select ON "File"
  FOR SELECT
  USING (
    current_setting('app.bypass_rls', true) = 'on' OR
    "ownerId" = current_setting('app.current_user_id', true) OR
    check_file_access(id, current_setting('app.current_user_id', true))
  );

CREATE POLICY file_insert ON "File"
  FOR INSERT
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on' OR
    "ownerId" = current_setting('app.current_user_id', true)
  );

CREATE POLICY file_update ON "File"
  FOR UPDATE
  USING (
    current_setting('app.bypass_rls', true) = 'on' OR
    "ownerId" = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on' OR
    "ownerId" = current_setting('app.current_user_id', true)
  );

CREATE POLICY file_delete ON "File"
  FOR DELETE
  USING (
    current_setting('app.bypass_rls', true) = 'on' OR
    "ownerId" = current_setting('app.current_user_id', true)
  );

-- 5. SharedFile table policies
CREATE POLICY shared_file_select ON "SharedFile"
  FOR SELECT
  USING (
    current_setting('app.bypass_rls', true) = 'on' OR
    check_shared_file_ownership(id, current_setting('app.current_user_id', true)) OR
    "sharedWithId" = current_setting('app.current_user_id', true)
  );

CREATE POLICY shared_file_insert ON "SharedFile"
  FOR INSERT
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on' OR
    check_file_ownership("fileId", current_setting('app.current_user_id', true))
  );

CREATE POLICY shared_file_update ON "SharedFile"
  FOR UPDATE
  USING (
    current_setting('app.bypass_rls', true) = 'on' OR
    check_shared_file_ownership(id, current_setting('app.current_user_id', true))
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on' OR
    check_shared_file_ownership(id, current_setting('app.current_user_id', true))
  );

CREATE POLICY shared_file_delete ON "SharedFile"
  FOR DELETE
  USING (
    current_setting('app.bypass_rls', true) = 'on' OR
    check_shared_file_ownership(id, current_setting('app.current_user_id', true))
  );

-- 6. FileAccessLog table policies (now completely safe)
CREATE POLICY file_access_log_select ON "FileAccessLog"
  FOR SELECT
  USING (
    current_setting('app.bypass_rls', true) = 'on' OR
    "userId" = current_setting('app.current_user_id', true) OR 
    check_file_ownership("fileId", current_setting('app.current_user_id', true)) OR
    check_file_access("fileId", current_setting('app.current_user_id', true))
  );


-- 7. SubscriptionPlan table policies
CREATE POLICY subscription_plan_select ON "SubscriptionPlan"
  FOR SELECT
  USING (true);

CREATE POLICY subscription_plan_insert ON "SubscriptionPlan"
  FOR INSERT
  WITH CHECK (current_setting('app.bypass_rls', true) = 'on');

CREATE POLICY subscription_plan_update ON "SubscriptionPlan"
  FOR UPDATE
  USING (current_setting('app.bypass_rls', true) = 'on')
  WITH CHECK (current_setting('app.bypass_rls', true) = 'on');

CREATE POLICY subscription_plan_delete ON "SubscriptionPlan"
  FOR DELETE
  USING (current_setting('app.bypass_rls', true) = 'on');