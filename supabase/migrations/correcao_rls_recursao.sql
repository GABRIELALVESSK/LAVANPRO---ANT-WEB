-- ============================================================
-- CORREÇÃO DEFINITIVA: RLS na tabela staff sem recursão
-- Usa uma função SECURITY DEFINER para buscar o owner_id
-- ============================================================

-- 1. Remover as políticas problemáticas
DROP POLICY IF EXISTS "Staff visible to owner and same-org members" ON public.staff;
DROP POLICY IF EXISTS "Owner can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Owner can update staff" ON public.staff;
DROP POLICY IF EXISTS "Owner can delete staff" ON public.staff;

-- 2. Garantir que o RLS está ativo
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- 3. Criar função auxiliar que ignora RLS (SECURITY DEFINER) para evitar recursão
CREATE OR REPLACE FUNCTION public.get_my_owner_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
BEGIN
  SELECT owner_id INTO v_owner FROM public.staff WHERE user_id = auth.uid() LIMIT 1;
  RETURN COALESCE(v_owner, auth.uid());
END;
$$;

-- 4. Novas políticas seguras e sem recursão
CREATE POLICY "Staff visible to owner and same-org members" ON public.staff
  FOR SELECT USING (
    owner_id = public.get_my_owner_id()
    OR user_id = auth.uid()
  );

CREATE POLICY "Owner can insert staff" ON public.staff
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
  );

CREATE POLICY "Owner can update staff" ON public.staff
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR owner_id = public.get_my_owner_id()
  );

CREATE POLICY "Owner can delete staff" ON public.staff
  FOR DELETE USING (
    owner_id = auth.uid()
  );
