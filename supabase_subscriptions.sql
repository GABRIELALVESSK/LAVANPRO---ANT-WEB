-- ============================================================
-- FEATURE: PLANOS E ASSINATURAS (7 DIAS DE TESTE)
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Criar a tabela de assinaturas da empresa
CREATE TABLE IF NOT EXISTS public.company_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    status TEXT NOT NULL DEFAULT 'trialing', -- 'trialing', 'active', 'canceled'
    trial_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    trial_end TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

-- Segurança: apenas leitura e atualização via RPC com SECURITY DEFINER
-- Não precisamos expor políticas diretas se usarmos RPC. Mas para garantir:
CREATE POLICY "Authenticated users can read subscriptions" ON public.company_subscriptions
    FOR SELECT TO authenticated USING (true);


-- 2. Função RPC para buscar/pegar/inicializar o plano do usuário atual
DROP FUNCTION IF EXISTS public.get_my_subscription();
CREATE OR REPLACE FUNCTION public.get_my_subscription()
RETURNS TABLE (
    plan TEXT,
    status TEXT,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_owner_id UUID;
    v_raw_meta JSONB;
BEGIN
    -- Obter os meta dados do usuario
    SELECT raw_user_meta_data INTO v_raw_meta FROM auth.users WHERE id = auth.uid();
    
    -- Determinar o owner_id (se tiver owner_id no json, eh ele. senao é o owner master)
    IF v_raw_meta ? 'owner_id' AND (v_raw_meta->>'owner_id') IS NOT NULL THEN
        v_owner_id := (v_raw_meta->>'owner_id')::uuid;
    ELSE
        -- Se for nulo ou vazio, o proprio usuario logado é o owner
        v_owner_id := auth.uid();
    END IF;

    -- Tentar inserir se nao existe (inicia como free/trial de 7 dias)
    INSERT INTO public.company_subscriptions (owner_id, plan, status, trial_start, trial_end)
    VALUES (v_owner_id, 'free', 'trialing', now(), now() + interval '7 days')
    ON CONFLICT (owner_id) DO NOTHING;

    -- Retornar os dados
    RETURN QUERY
    SELECT c.plan, c.status, c.trial_start, c.trial_end
    FROM public.company_subscriptions c
    WHERE c.owner_id = v_owner_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_subscription() TO authenticated;


-- 3. Função RPC para o usuário MUDAR (comprar) O PLANO
DROP FUNCTION IF EXISTS public.update_my_subscription(TEXT);
CREATE OR REPLACE FUNCTION public.update_my_subscription(new_plan TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_owner_id UUID;
    v_raw_meta JSONB;
BEGIN
    SELECT raw_user_meta_data INTO v_raw_meta FROM auth.users WHERE id = auth.uid();
    
    IF v_raw_meta ? 'owner_id' AND (v_raw_meta->>'owner_id') IS NOT NULL THEN
        v_owner_id := (v_raw_meta->>'owner_id')::uuid;
    ELSE
        v_owner_id := auth.uid();
    END IF;

    -- Atualiza o plano
    UPDATE public.company_subscriptions
    SET plan = new_plan,
        status = 'active', 
        updated_at = now()
    WHERE owner_id = v_owner_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_my_subscription(TEXT) TO authenticated;
