-- ============================================================
-- SOLUÇÃO DEFINITIVA: Função RPC para buscar o cargo do usuário
-- Execute no Supabase SQL Editor
-- ============================================================

-- Remove função anterior se existir
DROP FUNCTION IF EXISTS public.get_my_staff_role();

-- Cria a função que consulta diretamente com auth.uid() e auth.email()
-- SECURITY DEFINER = roda com permissões de admin, ignora RLS client-side
CREATE OR REPLACE FUNCTION public.get_my_staff_role()
RETURNS TABLE(role TEXT, staff_id UUID, staff_name TEXT, staff_email TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        s.role::text,
        s.id,
        s.name,
        s.email
    FROM public.staff s
    WHERE 
        s.user_id = auth.uid()
        OR lower(s.email) = lower(auth.email())
    LIMIT 1;
$$;

-- Garante que qualquer usuário autenticado pode chamar a função
GRANT EXECUTE ON FUNCTION public.get_my_staff_role() TO authenticated;

-- ============================================================
-- Também atualiza o user_id de quem ainda está null
-- ============================================================
UPDATE public.staff s
SET user_id = au.id
FROM auth.users au
WHERE lower(s.email) = lower(au.email)
  AND s.user_id IS NULL;

-- ============================================================
-- Teste: chame a função para ver o que retorna para você
-- (deve retornar o seu cargo de admin)
-- ============================================================
SELECT * FROM public.get_my_staff_role();
