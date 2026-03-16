-- Migração para corrigir gestão de equipe e visibilidade
-- Este script adiciona funções seguras para gerenciar colaboradores

-- 1. Melhorar resolve_owner_id para ser ainda mais resiliente
create or replace function public.resolve_owner_id()
returns uuid language plpgsql security definer as $$
declare
    v_uid uuid := auth.uid();
    v_owner uuid;
    v_is_owner boolean;
begin
    if v_uid is null then return null; end if;

    -- 1. Verifica se já é o dono via metadados
    select coalesce((raw_user_meta_data->>'is_owner')::boolean, (raw_user_meta_data->>'role' = 'owner'), false) into v_is_owner
    from auth.users where id = v_uid;

    if v_is_owner = true then
        -- Garante que o dono esteja na tabela staff para que os outros o achem
        insert into public.staff (user_id, owner_id, name, role, email)
        select v_uid, v_uid, coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email, 'Dono'), 'Administrador', u.email
        from auth.users u where u.id = v_uid 
        on conflict (user_id) do update set owner_id = v_uid;
        
        return v_uid;
    end if;

    -- 2. Se não for dono, busca na tabela staff quem é o owner dele
    -- Usamos query direta ignorando RLS por ser security definer
    select s.owner_id into v_owner from public.staff s where s.user_id = v_uid limit 1;
    
    -- 3. Fallback: se não achou no staff (ex: erro de cadastro), assume ele como próprio dono temporário
    -- para não quebrar o dashboard, mas o ideal é que ele esteja no staff.
    return coalesce(v_owner, v_uid);
end;
$$;

-- 2. RPC para buscar lista de staff com segurança
create or replace function public.get_staff_members()
returns setof public.staff 
language plpgsql security definer as $$
begin
    return query 
    select * from public.staff 
    where owner_id = public.resolve_owner_id()
    order by created_at desc;
end;
$$;

-- 3. RPC para adicionar staff garantindo o owner_id correto
create or replace function public.add_staff_member(
    p_name text, 
    p_email text, 
    p_role text, 
    p_unit text
)
returns public.staff
language plpgsql security definer as $$
declare
    v_owner_id uuid := public.resolve_owner_id();
    v_new_staff public.staff;
begin
    insert into public.staff (owner_id, name, email, role, unit, active)
    values (v_owner_id, p_name, p_email, p_role, p_unit, true)
    returning * into v_new_staff;
    
    return v_new_staff;
end;
$$;

-- 4. RPC para atualizar staff
create or replace function public.update_staff_member(
    p_id uuid,
    p_name text,
    p_email text,
    p_role text,
    p_unit text,
    p_active boolean
)
returns void
language plpgsql security definer as $$
begin
    update public.staff
    set 
        name = p_name,
        email = p_email,
        role = p_role,
        unit = p_unit,
        active = p_active
    where id = p_id and owner_id = public.resolve_owner_id();
end;
$$;

-- 5. RPC para excluir staff
create or replace function public.delete_staff_member(p_id uuid)
returns void
language plpgsql security definer as $$
begin
    delete from public.staff
    where id = p_id and owner_id = public.resolve_owner_id();
end;
$$;
