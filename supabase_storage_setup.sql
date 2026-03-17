-- ============================================================
-- STORAGE SETUP (LavanPro)
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Criar Buckets (Pastas de Armazenamento)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('company_assets', 'company_assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Acesso para 'avatars'
-- Permitir leitura pública
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Permitir upload para usuários autenticados
DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatars');

-- Permitir atualização/deleção
DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
CREATE POLICY "Auth Update Avatars" ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Auth Delete Avatars" ON storage.objects;
CREATE POLICY "Auth Delete Avatars" ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'avatars');


-- 3. Políticas de Acesso para 'company_assets'
-- Permitir leitura pública
DROP POLICY IF EXISTS "Public Access Company" ON storage.objects;
CREATE POLICY "Public Access Company" ON storage.objects FOR SELECT USING (bucket_id = 'company_assets');

-- Permitir upload a autenticados
DROP POLICY IF EXISTS "Auth Upload Company" ON storage.objects;
CREATE POLICY "Auth Upload Company" ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'company_assets');

-- Permitir atualização/deleção
DROP POLICY IF EXISTS "Auth Update Company" ON storage.objects;
CREATE POLICY "Auth Update Company" ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'company_assets');

DROP POLICY IF EXISTS "Auth Delete Company" ON storage.objects;
CREATE POLICY "Auth Delete Company" ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'company_assets');
