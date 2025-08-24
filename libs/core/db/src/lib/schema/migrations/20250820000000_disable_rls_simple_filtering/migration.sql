-- 1. Disable RLS on all tables
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "File" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SharedFile" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FileAccessLog" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SubscriptionPlan" DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing RLS policies
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

DROP POLICY IF EXISTS subscription_plan_select ON "SubscriptionPlan";
DROP POLICY IF EXISTS subscription_plan_insert ON "SubscriptionPlan";
DROP POLICY IF EXISTS subscription_plan_update ON "SubscriptionPlan";
DROP POLICY IF EXISTS subscription_plan_delete ON "SubscriptionPlan";

-- 3. Drop RLS helper functions
DROP FUNCTION IF EXISTS check_file_access(text, text);
DROP FUNCTION IF EXISTS check_file_ownership(text, text);
DROP FUNCTION IF EXISTS check_shared_file_ownership(text, text);
