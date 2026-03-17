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
