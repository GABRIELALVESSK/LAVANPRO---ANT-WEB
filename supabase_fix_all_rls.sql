-- ============================================================
-- CORREÇÃO DEFINITIVA: RLS policies para staff e app_settings
-- Execute TUDO no Supabase SQL Editor de uma vez
-- ============================================================

-- ═══════════════════════════════════════════════════════════
-- PARTE 1: Corrigir as policies da tabela STAFF
-- ═══════════════════════════════════════════════════════════

-- Remover policies antigas que podem estar restritivas
DROP POLICY IF EXISTS "Authenticated users can read staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated users can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated users can update staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated users can delete staff" ON public.staff;
DROP POLICY IF EXISTS "User can link own user_id to staff record" ON public.staff;
DROP POLICY IF EXISTS "Allow read access for all users" ON public.staff;
DROP POLICY IF EXISTS "Allow insert for authenticated users only" ON public.staff;
DROP POLICY IF EXISTS "Allow update for authenticated users only" ON public.staff;
DROP POLICY IF EXISTS "Allow delete for authenticated users only" ON public.staff;

-- Habilitar RLS (se não estiver)
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer usuário autenticado OU anon pode ler
CREATE POLICY "Anyone can read staff"
    ON public.staff FOR SELECT
    USING (true);

-- Insert/Update/Delete: apenas autenticados
CREATE POLICY "Authenticated can insert staff"
    ON public.staff FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated can update staff"
    ON public.staff FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated can delete staff"
    ON public.staff FOR DELETE
    TO authenticated
    USING (true);

-- ═══════════════════════════════════════════════════════════
-- PARTE 2: Corrigir as policies da tabela APP_SETTINGS
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authenticated users can read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated users can insert app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated users can update app_settings" ON public.app_settings;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer usuário pode ler (anon ou autenticado)
CREATE POLICY "Anyone can read app_settings"
    ON public.app_settings FOR SELECT
    USING (true);

-- Insert/Update: apenas autenticados
CREATE POLICY "Authenticated can insert app_settings"
    ON public.app_settings FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated can update app_settings"
    ON public.app_settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- PARTE 3: Criar/Atualizar a função RPC
-- ═══════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.get_my_staff_role();

CREATE OR REPLACE FUNCTION public.get_my_staff_role()
RETURNS TABLE(role TEXT, staff_id UUID, staff_name TEXT, staff_email TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT s.role::text, s.id, s.name, s.email
    FROM public.staff s
    WHERE s.user_id = auth.uid()
       OR lower(s.email) = lower(auth.email())
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_staff_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_staff_role() TO anon;

-- ═══════════════════════════════════════════════════════════
-- PARTE 4: Vincular user_id dos auth users aos staff
-- ═══════════════════════════════════════════════════════════

UPDATE public.staff s
SET user_id = au.id
FROM auth.users au
WHERE lower(s.email) = lower(au.email)
  AND s.user_id IS NULL;

-- ═══════════════════════════════════════════════════════════
-- PARTE 5: Verificar o resultado final
-- ═══════════════════════════════════════════════════════════

SELECT 
    s.name,
    s.email,
    s.role,
    s.user_id,
    s.active,
    CASE WHEN s.user_id IS NOT NULL THEN '✅ Vinculado' ELSE '❌ Sem vínculo' END AS status
FROM public.staff s
ORDER BY s.created_at DESC;
