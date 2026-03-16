-- ============================================================
-- CORRECAO DEFINITIVA: Sincronizacao entre Owner e Colaboradores
-- Cole e execute no SQL Editor do Supabase
-- ============================================================

-- PASSO 1: Funcao que SEMPRE resolve o owner_id correto
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
    
    IF v_uid IS NULL THEN
        RETURN NULL;
    END IF;

    -- 1. Checar se eh owner via user_metadata
    SELECT COALESCE(
        (raw_user_meta_data->>'is_owner')::BOOLEAN, 
        FALSE
    ) INTO v_is_owner
    FROM auth.users 
    WHERE id = v_uid;

    -- 2. Se eh owner, retorna ele mesmo e garante que esta no staff
    IF v_is_owner = TRUE THEN
        INSERT INTO public.staff (user_id, owner_id, name, role, email)
        SELECT 
            v_uid, 
            v_uid, 
            COALESCE(u.raw_user_meta_data->>'name', u.email, 'Administrador'),
            'Administrador',
            u.email
        FROM auth.users u WHERE u.id = v_uid
        ON CONFLICT (user_id) DO UPDATE SET owner_id = v_uid;
        
        RETURN v_uid;
    END IF;

    -- 3. Colaborador: buscar o owner_id na tabela staff
    SELECT s.owner_id INTO v_owner
    FROM public.staff s
    WHERE s.user_id = v_uid
    LIMIT 1;

    IF v_owner IS NOT NULL THEN
        RETURN v_owner;
    END IF;

    -- 4. Fallback: procurar pelo admin dono do e-mail (caso o owner_id esteja nulo por algum erro)
    -- Isso ajuda se o colaborador foi inserido mas o owner_id nao foi propagado
    SELECT s.owner_id INTO v_owner
    FROM public.staff s
    WHERE s.role IN ('Administrador', 'admin', 'Owner')
    ORDER BY s.created_at ASC
    LIMIT 1;

    RETURN COALESCE(v_owner, v_uid);
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_owner_id() TO authenticated;

-- PASSO 2: Recriar get_laundry_data
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
    
    IF v_owner_id IS NULL THEN
        RETURN '[]'::JSONB;
    END IF;

    SELECT data_value INTO v_result
    FROM public.laundry_data
    WHERE owner_id = v_owner_id AND data_key = p_key;

    RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

-- PASSO 3: Recriar set_laundry_data
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

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Usuario nao autenticado';
    END IF;

    INSERT INTO public.laundry_data (owner_id, data_key, data_value, updated_at)
    VALUES (v_owner_id, p_key, p_value, now())
    ON CONFLICT (owner_id, data_key)
    DO UPDATE SET data_value = p_value, updated_at = now();
END;
$$;

-- PASSO 4: Atualizar get_my_owner_id (usado pelo RLS do staff)
CREATE OR REPLACE FUNCTION public.get_my_owner_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN public.resolve_owner_id();
END;
$$;

-- PASSO 5: Permissoes
GRANT EXECUTE ON FUNCTION public.get_laundry_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_laundry_data(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_owner_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_owner_id() TO authenticated;
