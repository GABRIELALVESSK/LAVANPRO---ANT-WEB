-- ============================================================
-- FEATURE: Integração Asaas (Assinaturas e Checkout)
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- Adiciona colunas para armazenar os IDs retornados pelo Asaas
ALTER TABLE public.company_subscriptions
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT;

-- (Opcional) Criação de um log de pagamentos / webhooks
CREATE TABLE IF NOT EXISTS public.asaas_webhooks_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payment_id TEXT,
    customer_id TEXT,
    subscription_id TEXT,
    payload JSONB,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.asaas_webhooks_log ENABLE ROW LEVEL SECURITY;

-- Segurança: apenas leitura e gravação segura
CREATE POLICY "Serviço interno pode gravar e ler webhooks" ON public.asaas_webhooks_log
    FOR ALL TO service_role USING (true);
