-- ==========================================
-- LAVANPRO ENTERPRISE SETUP (V5 - ROBUST)
-- ==========================================
-- Este script configura o backend completo do LavanPro.
-- Copie e cole este conteúdo no SQL Editor do Supabase.

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. STAFF TABLE (Hierarquia de Acesso)
create table if not exists public.staff (
    id uuid primary key default gen_random_uuid(),
    user_id uuid unique references auth.users(id) on delete set null,
    owner_id uuid not null, -- ID do dodo da lavanderia (root)
    name text not null,
    email text not null,
    role text not null default 'Atendente',
    active boolean default true,
    unit text, -- Unidade padrão se houver
    created_at timestamp with time zone default now()
);

-- 3. LAUNDRY DATA (Armazenamento Granular por Chave)
create table if not exists public.laundry_data (
    owner_id uuid not null,
    data_key text not null,
    data_value jsonb not null default '[]',
    updated_at timestamp with time zone default now(),
    primary key (owner_id, data_key)
);

-- 4. APP SETTINGS (Configurações Globais)
create table if not exists public.app_settings (
    key text primary key,
    value jsonb not null default '{}',
    updated_at timestamp with time zone default now()
);

-- 5. AUDIT LOGS (Rastreabilidade Total)
create table if not exists public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    owner_id uuid not null,
    staff_id uuid,
    action text not null,
    module text not null,
    old_value jsonb,
    new_value jsonb,
    created_at timestamp with time zone default now()
);

-- ==========================================
-- MOTOR DE ESCOPO (SEGURANÇA RLS)
-- ==========================================

alter table public.staff enable row level security;
alter table public.laundry_data enable row level security;
alter table public.audit_logs enable row level security;

-- Resolve quem é o "Dono" para filtrar os dados da organização
create or replace function public.resolve_owner_id()
returns uuid language plpgsql security definer as $$
declare
    v_uid uuid := auth.uid();
    v_owner uuid;
    v_is_owner boolean;
begin
    if v_uid is null then return null; end if;

    -- Verifica se o usuário é o dono nos metadados (auth.users)
    select coalesce((raw_user_meta_data->>'is_owner')::boolean, false) into v_is_owner
    from auth.users where id = v_uid;

    if v_is_owner = true then
        -- Garante que o dono esteja na tabela staff
        insert into public.staff (user_id, owner_id, name, role, email)
        select v_uid, v_uid, coalesce(u.raw_user_meta_data->>'name', u.email, 'Admin'), 'owner', u.email
        from auth.users u where u.id = v_uid 
        on conflict (user_id) do update set owner_id = v_uid;
        
        return v_uid;
    end if;

    -- Se não for dono, busca na tabela staff quem é o owner dele
    select s.owner_id into v_owner from public.staff s where s.user_id = v_uid limit 1;
    
    return coalesce(v_owner, v_uid);
end;
$$;

-- POLICIES
create policy "Acesso por Organização (Staff)" on public.staff for all using (owner_id = public.resolve_owner_id());
create policy "Acesso por Organização (Dados)" on public.laundry_data for all using (owner_id = public.resolve_owner_id());
create policy "Acesso por Organização (Logs)" on public.audit_logs for select using (owner_id = public.resolve_owner_id());

-- ==========================================
-- INTERFACE DE DADOS (RPCs)
-- ==========================================

-- Busca dados por chave
create or replace function public.get_laundry_data(p_key text)
returns jsonb language plpgsql security definer as $$
begin
    return (select data_value from public.laundry_data 
            where owner_id = public.resolve_owner_id() and data_key = p_key);
end;
$$;

-- Salva dados por chave com log de auditoria
create or replace function public.set_laundry_data(p_key text, p_value jsonb)
returns void language plpgsql security definer as $$
declare
    v_owner_id uuid := public.resolve_owner_id();
    v_old_value jsonb;
begin
    -- Captura valor antigo para o log
    select data_value into v_old_value from public.laundry_data where owner_id = v_owner_id and data_key = p_key;

    insert into public.laundry_data (owner_id, data_key, data_value, updated_at)
    values (v_owner_id, p_key, p_value, now())
    on conflict (owner_id, data_key) do update set data_value = p_value, updated_at = now();

    -- Registra na auditoria
    insert into public.audit_logs (owner_id, staff_id, action, module, old_value, new_value)
    values (v_owner_id, auth.uid(), 'UPDATE', p_key, v_old_value, p_value);
end;
$$;

-- Busca Subscrição ativa (Owner)
create or replace function public.get_my_subscription()
returns table (plan text, status text, trial_end timestamp with time zone) as $$
begin
    return query
    select 
        coalesce(u.raw_user_meta_data->>'plan', 'free') as plan,
        coalesce(u.raw_user_meta_data->>'subscription_status', 'active') as status,
        (u.raw_user_meta_data->>'subscription_trial_end')::timestamptz as trial_end
    from auth.users u
    where u.id = public.resolve_owner_id();
end;
$$ language plpgsql security definer;

-- Webhook do Asaas (Atualiza plano do usuário)
create or replace function public.asaas_webhook_update_sub(p_owner_id uuid, p_plan text, p_status text)
returns void language plpgsql security definer as $$
begin
    -- Atualiza os metadados do usuário no Auth (Bypass RLS)
    update auth.users
    set raw_user_meta_data = raw_user_meta_data || 
        jsonb_build_object(
            'plan', p_plan,
            'subscription_status', p_status,
            'subscription_last_update', now()
        )
    where id = p_owner_id;
end;
$$;

-- Função auxiliar para verificar convites de staff (Pública mas segura)
create or replace function public.get_staff_invitation(p_email text)
returns table (id uuid, role text, unit text, owner_id uuid) 
language plpgsql security definer as $$
begin
    return query 
    select s.id, s.role, s.unit, s.owner_id 
    from public.staff s 
    where lower(s.email) = lower(p_email) 
    and s.user_id is null;
end;
$$;

-- ==========================================
-- DADOS MESTRES (PERMISSÕES)
-- ==========================================
insert into public.app_settings (key, value) values ('permissions_matrix', '{
    "owner": ["dashboard", "orders", "customers", "services", "stock", "finance", "team", "settings", "reports", "labels"],
    "Administrador": ["dashboard", "orders", "customers", "services", "stock", "finance", "team", "settings", "reports", "labels"],
    "Gerente": ["dashboard", "orders", "customers", "services", "stock", "finance", "team", "reports", "labels"],
    "Atendente": ["dashboard", "orders", "customers", "labels"]
}'::jsonb) on conflict (key) do update set value = excluded.value;
