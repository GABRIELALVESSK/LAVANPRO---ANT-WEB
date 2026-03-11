-- ============================================================
-- DIAGNÓSTICO: Verificar se o usuário está na tabela staff
-- Execute no Supabase SQL Editor para debugar o problema
-- ============================================================

-- 1. Ver todos os usuários autenticados do Supabase Auth
SELECT 
    id AS auth_id,
    email AS auth_email,
    raw_user_meta_data->>'role' AS meta_role,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Ver todos os registros da tabela staff
SELECT 
    id,
    name,
    email,
    role,
    active,
    has_system_access,
    user_id
FROM public.staff
ORDER BY created_at DESC;

-- 3. Verificar se há email correspondente entre auth.users e staff
-- (Mostra onde a ligação está funcionando ou faltando)
SELECT 
    au.email AS auth_email,
    au.id AS auth_id,
    au.raw_user_meta_data->>'role' AS meta_role,
    s.id AS staff_id,
    s.name AS staff_name,
    s.role AS staff_role,
    s.email AS staff_email,
    CASE 
        WHEN s.id IS NULL THEN '❌ SEM REGISTRO NO STAFF'
        WHEN lower(au.email) = lower(s.email) THEN '✅ EMAIL CORRESPONDENTE'
        ELSE '⚠️ EMAIL DIFERENTE'
    END AS status
FROM auth.users au
LEFT JOIN public.staff s ON lower(au.email) = lower(s.email)
WHERE au.email != 'gabriel23900@gmail.com'  -- ignora o owner
ORDER BY au.created_at DESC;

-- ============================================================
-- CORREÇÃO: Se o funcionário não tiver registro no staff,
-- ou se o email estiver diferente, execute:
-- ============================================================

-- Atualizar o email do staff para coincidir com o auth user
-- (substitua os valores conforme necessário)
-- UPDATE public.staff
-- SET email = 'email-real-do-funcionario@exemplo.com'
-- WHERE name = 'Lucas Silva';  -- ou pelo ID do staff

-- Ou criar um novo registro para o funcionário:
-- INSERT INTO public.staff (name, email, role, unit, active, has_system_access)
-- VALUES ('Lucas Silva', 'wociy90389@hlkes.com', 'Atendente', 'Matriz Centro', true, true);
