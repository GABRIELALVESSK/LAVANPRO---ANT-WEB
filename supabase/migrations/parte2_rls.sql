-- ============================================================
-- PARTE 2: Rodar DEPOIS da Parte 1 - RLS Policies
-- ============================================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Staff visible to owner and same-org members" ON public.staff;
DROP POLICY IF EXISTS "Owner can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Owner can update staff" ON public.staff;
DROP POLICY IF EXISTS "Owner can delete staff" ON public.staff;

-- Ativar RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- SELECT: usuário vê staff se for o dono, ou pertencer ao mesmo dono
CREATE POLICY "Staff visible to owner and same-org members" ON public.staff
  FOR SELECT USING (
    owner_id = auth.uid()
    OR owner_id = (SELECT s.owner_id FROM public.staff s WHERE s.user_id = auth.uid() LIMIT 1)
    OR user_id = auth.uid()
  );

-- INSERT: apenas donos podem adicionar staff (owner_id deve ser o próprio user)
CREATE POLICY "Owner can insert staff" ON public.staff
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
  );

-- UPDATE: dono pode editar. O próprio colaborador pode editar alguns dados seus.
CREATE POLICY "Owner can update staff" ON public.staff
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR user_id = auth.uid()
  );

-- DELETE: apenas o dono pode deletar
CREATE POLICY "Owner can delete staff" ON public.staff
  FOR DELETE USING (
    owner_id = auth.uid()
  );
