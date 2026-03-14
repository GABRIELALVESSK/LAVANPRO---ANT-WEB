-- ============================================================
-- Tabela de dados da lavanderia (compartilhado entre owner e colaboradores)
-- Execute no Supabase SQL Editor
-- ============================================================

-- Armazena os dados JSON da lavanderia: unidades, pedidos, clientes, etc.
CREATE TABLE IF NOT EXISTS public.laundry_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    data_key TEXT NOT NULL,        -- 'units', 'orders', 'customers', 'finance_transactions'
    data_value JSONB NOT NULL DEFAULT '[]'::JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (owner_id, data_key)
);

-- RLS: todos autenticados podem ler/escrever (controle via owner_id no app)
ALTER TABLE public.laundry_data ENABLE ROW LEVEL SECURITY;

-- Owner pode ler/escrever seus próprios dados
CREATE POLICY "Owner can manage own data" ON public.laundry_data
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_laundry_data_owner ON public.laundry_data(owner_id);
CREATE INDEX IF NOT EXISTS idx_laundry_data_key ON public.laundry_data(owner_id, data_key);

-- RPC para buscar dados por chave (resolve automaticamente o owner_id do colaborador)
CREATE OR REPLACE FUNCTION public.get_laundry_data(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_owner_id UUID;
    v_result JSONB;
BEGIN
    -- Determinar o owner_id (colaborador herda do dono)
    SELECT s.owner_id INTO v_owner_id
    FROM public.staff s
    WHERE s.user_id = auth.uid()
    LIMIT 1;

    -- Se não encontrou no staff, usar o próprio user como owner
    IF v_owner_id IS NULL THEN
        v_owner_id := auth.uid();
    END IF;

    -- Buscar os dados
    SELECT data_value INTO v_result
    FROM public.laundry_data
    WHERE owner_id = v_owner_id AND data_key = p_key;

    RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_laundry_data(TEXT) TO authenticated;

-- RPC para salvar dados (apenas owner pode salvar)
CREATE OR REPLACE FUNCTION public.set_laundry_data(p_key TEXT, p_value JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_owner_id UUID;
BEGIN
    -- Determinar o owner_id
    SELECT s.owner_id INTO v_owner_id
    FROM public.staff s
    WHERE s.user_id = auth.uid()
    LIMIT 1;

    IF v_owner_id IS NULL THEN
        v_owner_id := auth.uid();
    END IF;

    -- Upsert
    INSERT INTO public.laundry_data (owner_id, data_key, data_value, updated_at)
    VALUES (v_owner_id, p_key, p_value, now())
    ON CONFLICT (owner_id, data_key)
    DO UPDATE SET data_value = p_value, updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_laundry_data(TEXT, JSONB) TO authenticated;
