-- ============================================================
-- LAVANPRO: MASTER SCHEMA (REINICIALIZAÇÃO TOTAL)
-- ============================================================
-- Execute este script no SQL Editor do Supabase para resetar
-- e unificar a estrutura do seu banco de dados.
-- ============================================================

-- 2. TABELA: staff (Gestão de Colaboradores e Escopo)
CREATE TABLE IF NOT EXISTS public.staff (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    owner_id    UUID NOT NULL, -- O ID do dono da conta (admin)
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'Atendente',
    active      BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now(),
    unit        TEXT -- Unidade preferencial
);

-- 3. TABELA: app_settings (Configurações Globais e Permissões)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key         TEXT PRIMARY KEY,
    value       JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELA: laundry_data (O novo "Local Storage" na Nuvem)
CREATE TABLE IF NOT EXISTS public.laundry_data (
    owner_id    UUID NOT NULL, -- Sem FK para permitir flexibilidade
    data_key    TEXT NOT NULL, -- Ex: 'orders', 'customers', 'services'
    data_value  JSONB NOT NULL DEFAULT '[]',
    updated_at  TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (owner_id, data_key)
);

-- 5. FUNÇÃO: resolve_owner_id (A inteligência de escopo)
CREATE OR REPLACE FUNCTION public.resolve_owner_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID;
    v_owner UUID;
    v_is_owner BOOLEAN;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN RETURN NULL; END IF;

    -- 1. Checar se o usuário logado é o owner
    SELECT COALESCE((raw_user_meta_data->>'is_owner')::BOOLEAN, FALSE) INTO v_is_owner
    FROM auth.users WHERE id = v_uid;

    IF v_is_owner = TRUE THEN
        -- Garante que o owner está na tabela staff
        INSERT INTO public.staff (user_id, owner_id, name, role, email)
        SELECT v_uid, v_uid, COALESCE(u.raw_user_meta_data->>'name', u.email, 'Admin'), 'admin', u.email
        FROM auth.users u WHERE u.id = v_uid
        ON CONFLICT (user_id) DO UPDATE SET owner_id = v_uid;
        RETURN v_uid;
    END IF;

    -- 2. Se for colaborador, busca o owner_id dele
    SELECT s.owner_id INTO v_owner FROM public.staff s WHERE s.user_id = v_uid LIMIT 1;
    IF v_owner IS NOT NULL THEN RETURN v_owner; END IF;

    -- 3. Fallback final (busca qualquer admin se o usuário estiver órfão)
    SELECT s.user_id INTO v_owner FROM public.staff s WHERE s.role = 'admin' LIMIT 1;
    RETURN COALESCE(v_owner, v_uid);
END;
$$;

-- 6. RPC: get_laundry_data (Leitura)
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
    v_owner_id := public.resolve_owner_id();
    IF v_owner_id IS NULL THEN RETURN '[]'::JSONB; END IF;

    SELECT data_value INTO v_result FROM public.laundry_data
    WHERE owner_id = v_owner_id AND data_key = p_key;

    RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

-- 7. RPC: set_laundry_data (Escrita)
CREATE OR REPLACE FUNCTION public.set_laundry_data(p_key TEXT, p_value JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_owner_id UUID;
BEGIN
    v_owner_id := public.resolve_owner_id();
    IF v_owner_id IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;

    INSERT INTO public.laundry_data (owner_id, data_key, data_value, updated_at)
    VALUES (v_owner_id, p_key, p_value, now())
    ON CONFLICT (owner_id, data_key)
    DO UPDATE SET data_value = p_value, updated_at = now();
END;
$$;

-- 8. SEGURANÇA: RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Staff: Ver apenas colaboradores da mesma organização
CREATE POLICY "Staff scope policy" ON public.staff
FOR ALL USING (owner_id = public.resolve_owner_id());

-- Laundry Data: Ver apenas dados da sua organização
CREATE POLICY "Laundry data scope policy" ON public.laundry_data
FOR ALL USING (owner_id = public.resolve_owner_id());

-- App Settings: Leitura para todos, Escrita apenas Admins
CREATE POLICY "Read app_settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Manage app_settings" ON public.app_settings FOR ALL 
USING (EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid() AND role = 'admin'));

-- 9. DADOS PADRÃO (Matriz de Permissões)
INSERT INTO public.app_settings (key, value) VALUES
('permissions_matrix', '{
    "Administrador": { "orders": true, "customers": true, "finance": true, "stock": true, "reports": true, "team": true, "settings": true, "labels": true },
    "Gerente": { "orders": true, "customers": true, "finance": true, "stock": true, "reports": true, "team": true, "settings": false, "labels": true },
    "Atendente": { "orders": true, "customers": true, "finance": false, "stock": false, "reports": false, "team": false, "settings": false, "labels": true },
    "Estoquista": { "orders": false, "customers": false, "finance": false, "stock": true, "reports": false, "team": false, "settings": false, "labels": false }
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 10. PERMISSÕES FINAIS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
