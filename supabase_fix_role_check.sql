-- ============================================================
-- CORREÇÃO DO ERRO check constraint "staff_role_check"
-- Execute isso no Supabase SQL Editor
-- ============================================================

-- Primeiro, removemos a restrição antiga
ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_role_check1;

-- Em seguida, adicionamos a nova restrição permitindo os novos cargos 
-- incluindo "Estoquista" (que foi o que causou o erro na imagem)
ALTER TABLE public.staff ADD CONSTRAINT staff_role_check 
CHECK (role IN ('Administrador', 'Gerente', 'Atendente', 'Estoquista', 'Operador de Máquinas', 'Motorista'));
