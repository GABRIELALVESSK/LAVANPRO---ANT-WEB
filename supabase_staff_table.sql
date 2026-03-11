-- ============================================================
-- TABELA: staff (Gestão de Equipe — LavanPro)
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Criar tabela staff
CREATE TABLE IF NOT EXISTS public.staff (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT,
    phone       TEXT,
    role        TEXT NOT NULL DEFAULT 'Atendente'
                CHECK (role IN ('Administrador','Gerente','Atendente','Operador de Máquinas','Motorista')),
    unit        TEXT NOT NULL DEFAULT 'Matriz Centro',
    active      BOOLEAN NOT NULL DEFAULT true,
    has_system_access BOOLEAN NOT NULL DEFAULT false,
    processed_orders  INTEGER NOT NULL DEFAULT 0,
    join_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_staff_active ON public.staff(active);
CREATE INDEX IF NOT EXISTS idx_staff_role   ON public.staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_unit   ON public.staff(unit);
CREATE INDEX IF NOT EXISTS idx_staff_user   ON public.staff(user_id);

-- 3. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_staff_updated ON public.staff;
CREATE TRIGGER on_staff_updated
    BEFORE UPDATE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION public.handle_staff_updated_at();

-- 4. RLS (Row Level Security)
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Authenticated users can read staff"
    ON public.staff FOR SELECT
    TO authenticated
    USING (true);

-- Permitir insert/update/delete para usuários autenticados
CREATE POLICY "Authenticated users can insert staff"
    ON public.staff FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update staff"
    ON public.staff FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete staff"
    ON public.staff FOR DELETE
    TO authenticated
    USING (true);

-- 5. Dados iniciais (seed)
INSERT INTO public.staff (name, email, phone, role, unit, active, has_system_access, processed_orders, join_date) VALUES
    ('Gabriel Alves',   'gabriel23900@gmail.com',    '(11) 98888-0001', 'Administrador',       'Todas as Unidades', true,  true,  1450, '2025-01-10'),
    ('Ana Beatriz',     'ana.beatriz@lavanpro.com',  '(11) 98888-0002', 'Gerente',             'Matriz Centro',     true,  true,  840,  '2025-03-15'),
    ('Carlos Magno',    'carlos@lavanpro.com',       '(11) 98888-0003', 'Operador de Máquinas','Matriz Centro',     true,  false, 2310, '2025-04-01'),
    ('Ricardo Santos',  'ricardo@lavanpro.com',      '(11) 98888-0004', 'Motorista',           'Filial Jardins',    true,  false, 950,  '2025-08-20'),
    ('Marta Nogueira',  'marta@lavanpro.com',        '(11) 98888-0005', 'Atendente',           'Filial Pinheiros',  false, false, 420,  '2025-09-10');
