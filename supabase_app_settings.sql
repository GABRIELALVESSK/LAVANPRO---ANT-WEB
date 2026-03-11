-- ============================================================
-- TABELA: app_settings (Configuracoes centralizadas — LavanPro)
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Criar tabela app_settings (chave-valor para config global)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key         TEXT PRIMARY KEY,
    value       JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_app_settings_updated ON public.app_settings;
CREATE TRIGGER on_app_settings_updated
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_app_settings_updated_at();

-- 3. RLS (Row Level Security)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuarios autenticados
CREATE POLICY "Authenticated users can read app_settings"
    ON public.app_settings FOR SELECT
    TO authenticated
    USING (true);

-- Permitir insert/update para usuarios autenticados
CREATE POLICY "Authenticated users can insert app_settings"
    ON public.app_settings FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update app_settings"
    ON public.app_settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Inserir a matriz de permissoes padrao
INSERT INTO public.app_settings (key, value) VALUES
(
    'permissions_matrix',
    '{
        "Administrador": { "orders": true, "customers": true, "finance": true, "stock": true, "reports": true, "team": true, "settings": true, "labels": true },
        "Gerente": { "orders": true, "customers": true, "finance": true, "stock": true, "reports": true, "team": true, "settings": false, "labels": true },
        "Atendente": { "orders": true, "customers": true, "finance": false, "stock": false, "reports": false, "team": false, "settings": false, "labels": true },
        "Estoquista": { "orders": false, "customers": false, "finance": false, "stock": true, "reports": false, "team": false, "settings": false, "labels": false }
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
