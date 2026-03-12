-- Função para o Webhook do Asaas atualizar a assinatura burlando o RLS local
-- Pois o webhook chega via POST anônimo sem Sessão de Usuário.
CREATE OR REPLACE FUNCTION public.asaas_webhook_update_sub(
    p_owner_id UUID,
    p_plan TEXT,
    p_status TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.company_subscriptions
    SET plan = COALESCE(p_plan, plan), -- só atualiza se vier preenchido
        status = p_status,
        updated_at = NOW()
    WHERE owner_id = p_owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
