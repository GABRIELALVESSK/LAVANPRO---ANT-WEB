-- ==========================================
-- MIGRATION: MULTI-UNIT SUPPORT (V6)
-- ==========================================

-- 1. Create Units Table
CREATE TABLE IF NOT EXISTS public.units (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null,
    name text not null,
    is_matrix boolean default false,
    active boolean default true,
    created_at timestamp with time zone default now()
);

-- RLS for Units
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso por Organizacao (Units)" ON public.units;
CREATE POLICY "Acesso por Organizacao (Units)" ON public.units FOR ALL USING (owner_id = public.resolve_owner_id());

-- 2. Modify Staff Table
-- Add unit_id explicitly (instead of just a text name)
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS unit_id uuid references public.units(id) ON DELETE SET NULL;

-- Fix for existing trigger error: Add updated_at if it's missing but required by trigger
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 3. Modify Laundry Data Structure (Requires care due to JSONB)
-- The laundry_data table stores a big JSON array. We cannot easily filter Row Level Security inside JSON objects on the fly for every SELECT without massive performance hits.
-- Therefore, the filtering MUST happen in the RPC function, OR we migrate to relational tables.
-- Given the current setup, we will enforce security at the RPC level.

-- 4. Update RPC Data Fetching (get_laundry_data)
CREATE OR REPLACE FUNCTION public.get_laundry_data_secured(p_key text, p_unit_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_owner_id uuid := public.resolve_owner_id();
    v_role text;
    v_staff_unit_id uuid;
    v_raw_data jsonb;
    v_filtered_data jsonb := '[]'::jsonb;
    v_item jsonb;
BEGIN
    -- 1. Get raw data for the organization
    SELECT data_value INTO v_raw_data FROM public.laundry_data 
    WHERE owner_id = v_owner_id AND data_key = p_key;

    IF v_raw_data IS NULL THEN
        RETURN '[]'::jsonb;
    END IF;

    -- 2. Identify the caller
    SELECT role, unit_id INTO v_role, v_staff_unit_id 
    FROM public.staff WHERE user_id = auth.uid() LIMIT 1;

    -- If Admin OR Owner OR no role found (Fallback for raw owners)
    IF v_role = 'owner' OR v_role = 'Administrador' THEN
        -- Admin asked for a specific unit? Filter it. Otherwise return all.
        IF p_unit_id IS NOT NULL THEN
            FOR v_item IN SELECT * FROM jsonb_array_elements(v_raw_data)
            LOOP
                IF (v_item->>'unitId')::text = p_unit_id::text THEN
                    v_filtered_data := v_filtered_data || v_item;
                END IF;
            END LOOP;
            RETURN COALESCE(v_filtered_data, '[]'::jsonb);
        ELSE
            RETURN v_raw_data;
        END IF;
    END IF;

    -- 3. If Staff (Gerente/Atendente), strictly filter by THEIR unit
    IF v_staff_unit_id IS NOT NULL THEN
         FOR v_item IN SELECT * FROM jsonb_array_elements(v_raw_data)
         LOOP
            IF (v_item->>'unitId')::text = v_staff_unit_id::text THEN
                v_filtered_data := v_filtered_data || v_item;
            END IF;
         END LOOP;
         RETURN COALESCE(v_filtered_data, '[]'::jsonb);
    END IF;

    -- Fallback safety: return empty if a staff member has no assigned unit
    RETURN '[]'::jsonb;
END;
$$;

-- 5. Auto-Create Matrix for existing owners
DO $$
DECLARE
    rec RECORD;
    v_unit_id uuid;
BEGIN
    FOR rec IN SELECT DISTINCT owner_id FROM public.laundry_data
    LOOP
        -- Check if matrix already exists
        IF NOT EXISTS (SELECT 1 FROM public.units WHERE owner_id = rec.owner_id AND is_matrix = true) THEN
            INSERT INTO public.units (owner_id, name, is_matrix) 
            VALUES (rec.owner_id, 'Matriz (Sede)', true)
            RETURNING id INTO v_unit_id;

            -- Link existing staff to matrix as fallback
            UPDATE public.staff SET unit_id = v_unit_id WHERE owner_id = rec.owner_id AND unit_id IS NULL;
        END IF;
    END LOOP;
END;
$$;


-- ==========================================
-- MIGRATION: SAFE ARRAY MERGING
-- ==========================================

-- Fix array wiping when staff member saves data
CREATE OR REPLACE FUNCTION public.set_laundry_data(p_key text, p_value jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_owner_id uuid := public.resolve_owner_id();
    v_role text;
    v_staff_unit_id uuid;
    v_merged_data jsonb;
    v_old_value jsonb;
BEGIN
    SELECT data_value INTO v_old_value FROM public.laundry_data WHERE owner_id = v_owner_id AND data_key = p_key;

    SELECT role, unit_id INTO v_role, v_staff_unit_id 
    FROM public.staff WHERE user_id = auth.uid() LIMIT 1;
    
    IF v_role = 'owner' OR v_role = 'Administrador' THEN
        -- Admin overwrites the whole array normally
        INSERT INTO public.laundry_data (owner_id, data_key, data_value, updated_at)
        VALUES (v_owner_id, p_key, p_value, now())
        ON CONFLICT (owner_id, data_key) DO UPDATE SET data_value = p_value, updated_at = now();
    ELSE
        -- Staff only modifies their slice. We must merge!
        IF jsonb_typeof(p_value) = 'array' AND v_old_value IS NOT NULL AND jsonb_typeof(v_old_value) = 'array' THEN
            -- Get original array, filter out elements from staff's unit, append the new array
           SELECT COALESCE(
               (SELECT jsonb_agg(elem) 
                FROM jsonb_array_elements(v_old_value) elem 
                WHERE COALESCE((elem->>'unitId')::text, 'default') != v_staff_unit_id::text
               ), '[]'::jsonb)
               || p_value
           INTO v_merged_data;
            
           UPDATE public.laundry_data SET data_value = v_merged_data, updated_at = now() 
           WHERE owner_id = v_owner_id AND data_key = p_key;
        ELSE
            -- Fallback
            INSERT INTO public.laundry_data (owner_id, data_key, data_value, updated_at)
            VALUES (v_owner_id, p_key, p_value, now())
            ON CONFLICT (owner_id, data_key) DO UPDATE SET data_value = p_value, updated_at = now();
        END IF;
    END IF;

    -- Registra na auditoria
    INSERT INTO public.audit_logs (owner_id, staff_id, action, module, old_value, new_value)
    VALUES (v_owner_id, auth.uid(), 'UPDATE_SECURED', p_key, v_old_value, p_value);
END;
$$;
