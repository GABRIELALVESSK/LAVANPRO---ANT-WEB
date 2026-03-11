-- ============================================================
-- SCRIPT DE ESCLARECIMENTO E INTEGRAÇÃO (Rode no Supabase)
-- Migra dados antigos de "collaborators" para "staff"
-- ============================================================

-- 1. Copia os usuários da tabela "collaborators" para "staff"
-- Isso garante que o Lucas que você criou lá apareça corretamente no sistema
INSERT INTO public.staff (name, email, role, active, unit, has_system_access)
SELECT 
    name, 
    email, 
    role, 
    true AS active, 
    'Matriz Centro' AS unit, 
    true AS has_system_access
FROM public.collaborators
WHERE email NOT IN (SELECT email FROM public.staff)
  AND email IS NOT NULL;

-- 2. Refaz a ligação de user_id por segurança
UPDATE public.staff s
SET user_id = au.id
FROM auth.users au
WHERE lower(s.email) = lower(au.email)
  AND s.user_id IS NULL;

-- 3. Limpa a tabela collaborators para evitar confusão futura
-- (TODO o gerenciamento agora usa apenas a tabela staff)
DELETE FROM public.collaborators;
