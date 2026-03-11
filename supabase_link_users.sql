-- ============================================================
-- Execute isso no Supabase SQL Editor
-- Adiciona política para auto-linkagem de user_id no staff
-- e conserta o vínculo entre auth.users e staff
-- ============================================================

-- 1. Permitir que um usuário autenticado atualize user_id
--    no registro de staff que tem o mesmo email que ele
CREATE POLICY IF NOT EXISTS "User can link own user_id to staff record"
    ON public.staff FOR UPDATE
    TO authenticated
    USING (lower(email) = lower(auth.email()))
    WITH CHECK (lower(email) = lower(auth.email()));

-- 2. Vincular automaticamente todos os usuários auth existentes 
--    aos registros de staff pelo email (execução única)
UPDATE public.staff s
SET user_id = au.id
FROM auth.users au
WHERE lower(s.email) = lower(au.email)
  AND s.user_id IS NULL;

-- 3. Verificar o resultado: quais staff estão vinculados agora?
SELECT 
    s.name,
    s.email AS staff_email,
    s.role,
    s.user_id,
    au.email AS auth_email,
    CASE 
        WHEN s.user_id IS NOT NULL THEN '✅ Vinculado'
        ELSE '❌ Sem vínculo'
    END AS status
FROM public.staff s
LEFT JOIN auth.users au ON au.id = s.user_id
ORDER BY s.created_at DESC;
