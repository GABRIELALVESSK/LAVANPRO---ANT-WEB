-- ============================================================
-- MIGRATION: Fix Multi-Tenant Auth and Subscriptions
-- ============================================================

-- 1. Ensure staff table has owner_id
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 2. Backfill: set owner_id for existing staff rows (Admin ID)
UPDATE public.staff
  SET owner_id = 'ea331ea5-0fa3-4848-b1ac-e2590bfaaa85'
  WHERE owner_id IS NULL;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_staff_owner_id ON public.staff(owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);

-- 4. RLS policies
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff visible to owner and same-org members" ON public.staff;
DROP POLICY IF EXISTS "Owner can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Owner can update staff" ON public.staff;
DROP POLICY IF EXISTS "Owner can delete staff" ON public.staff;

CREATE POLICY "Staff visible to owner and same-org members" ON public.staff
  FOR SELECT USING (
    owner_id = auth.uid()
    OR owner_id = (SELECT s.owner_id FROM public.staff s WHERE s.user_id = auth.uid() LIMIT 1)
    OR user_id = auth.uid()
  );

CREATE POLICY "Owner can insert staff" ON public.staff
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
  );

CREATE POLICY "Owner can update staff" ON public.staff
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR user_id = auth.uid()
  );

CREATE POLICY "Owner can delete staff" ON public.staff
  FOR DELETE USING (
    owner_id = auth.uid()
  );

-- 5. RPC: get_my_staff_role (Drop first because signature might change)
DROP FUNCTION IF EXISTS public.get_my_staff_role();

CREATE OR REPLACE FUNCTION public.get_my_staff_role()
RETURNS TABLE(role TEXT, owner_id UUID, unit TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.role::TEXT, s.owner_id, s.unit
  FROM public.staff s
  WHERE s.user_id = auth.uid()
  LIMIT 1;
$$;

-- 6. RPC: get_my_subscription (Lookup OWNER's subscription)
-- Fix: Using correct table 'company_subscriptions' and column 'owner_id'

DROP FUNCTION IF EXISTS public.get_my_subscription();

CREATE OR REPLACE FUNCTION public.get_my_subscription()
RETURNS TABLE(plan TEXT, status TEXT, trial_end TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sub.plan::TEXT, sub.status::TEXT, sub.trial_end
  FROM public.company_subscriptions sub
  WHERE sub.owner_id = COALESCE(
    -- If I'm a collaborator, use my owner's ID
    (SELECT s.owner_id FROM public.staff s WHERE s.user_id = auth.uid() AND s.owner_id IS NOT NULL LIMIT 1),
    -- Otherwise, I'm the owner, use my own ID
    auth.uid()
  )
  LIMIT 1;
$$;
