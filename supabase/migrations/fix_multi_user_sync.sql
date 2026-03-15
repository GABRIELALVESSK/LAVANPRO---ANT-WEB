-- ============================================================
-- SCRIPT DE AJUSTE: Sincronização Perfeita Multi-Usuário
-- Resolve o problema de colaboradores (como Paulo) salvarem
-- em buckets separados do Administrador (como Gabriel).
-- ============================================================

-- 1. Garantir que a tabela staff tenha os índices corretos para busca rápida
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);

-- 2. Corrigir a função set_laundry_data para ser MAIS RESILIENTE
-- Se o usuário for um colaborador, ele SEMPRE deve usar o owner_id do seu patrão.
CREATE OR REPLACE FUNCTION public.set_laundry_data(p_key TEXT, p_value JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_owner_id UUID;
    v_user_role TEXT;
BEGIN
    -- 1. Tentar encontrar o owner_id na tabela staff
    SELECT s.owner_id, s.role INTO v_owner_id, v_user_role
    FROM public.staff s
    WHERE s.user_id = auth.uid()
    LIMIT 1;

    -- 2. Se não encontrar no staff (ex: admin que acabou de criar conta e não se auto-inseriu)
    -- ou se o owner_id for nulo, assume que o próprio usuário é o dono.
    IF v_owner_id IS NULL THEN
        v_owner_id := auth.uid();
    END IF;

    -- 3. Upsert no bucket do dono
    INSERT INTO public.laundry_data (owner_id, data_key, data_value, updated_at)
    VALUES (v_owner_id, p_key, p_value, now())
    ON CONFLICT (owner_id, data_key)
    DO UPDATE SET 
        data_value = EXCLUDED.data_value, 
        updated_at = now();
END;
$$;

-- 3. Corrigir a função get_laundry_data para ser idêntica em lógica de owner
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
    SELECT s.owner_id INTO v_owner_id
    FROM public.staff s
    WHERE s.user_id = auth.uid()
    LIMIT 1;

    IF v_owner_id IS NULL THEN
        v_owner_id := auth.uid();
    END IF;

    SELECT data_value INTO v_result
    FROM public.laundry_data
    WHERE owner_id = v_owner_id AND data_key = p_key;

    RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

-- 4. RPC auxiliar para ajudar a debugar no front se o vínculo está correto
CREATE OR REPLACE FUNCTION public.get_my_sync_info()
RETURNS TABLE(my_id UUID, effective_owner_id UUID, my_role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid(),
        COALESCE((SELECT s.owner_id FROM public.staff s WHERE s.user_id = auth.uid() LIMIT 1), auth.uid()),
        COALESCE((SELECT s.role FROM public.staff s WHERE s.user_id = auth.uid() LIMIT 1), 'owner');
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_laundry_data(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_laundry_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_sync_info() TO authenticated;

-- 5. ATIVAR REALTIME NA TABELA (Caso não tenha funcionado antes)
-- Se der erro de "already exists", é normal.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'laundry_data'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.laundry_data;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

ALTER TABLE public.laundry_data REPLICA IDENTITY FULL;
