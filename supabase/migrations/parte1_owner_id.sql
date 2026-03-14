-- ============================================================
-- PARTE 1: Rodar PRIMEIRO - Coluna owner_id na tabela staff
-- ============================================================

-- 1. Adicionar coluna owner_id
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 2. Preencher owner_id para registros existentes (ID do admin Gabriel Alves)
UPDATE public.staff
  SET owner_id = 'ea331ea5-0fa3-4848-b1ac-e2590bfaaa85'
  WHERE owner_id IS NULL;

-- 3. Criar índices
CREATE INDEX IF NOT EXISTS idx_staff_owner_id ON public.staff(owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id  ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_email    ON public.staff(email);
