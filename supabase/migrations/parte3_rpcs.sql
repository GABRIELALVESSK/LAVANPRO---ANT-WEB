-- ============================================================
-- PARTE 3: Rodar POR ÚLTIMO - Atualizar RPCs
-- ============================================================

-- RPC 1: get_my_staff_role
-- (Drop primeiro pois a assinatura de retorno mudou)
DROP FUNCTION IF EXISTS public.get_my_staff_role();

CREATE FUNCTION public.get_my_staff_role()
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

GRANT EXECUTE ON FUNCTION public.get_my_staff_role() TO authenticated;


-- RPC 2: get_my_subscription
-- Busca o plano do DONO (owner). Se for colaborador, herda o plano do dono.
DROP FUNCTION IF EXISTS public.get_my_subscription();

CREATE FUNCTION public.get_my_subscription()
RETURNS TABLE(plan TEXT, status TEXT, trial_end TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.plan::TEXT, c.status::TEXT, c.trial_end
  FROM public.company_subscriptions c
  WHERE c.owner_id = COALESCE(
    (SELECT s.owner_id FROM public.staff s WHERE s.user_id = auth.uid() AND s.owner_id IS NOT NULL LIMIT 1),
    auth.uid()
  )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_subscription() TO authenticated;
