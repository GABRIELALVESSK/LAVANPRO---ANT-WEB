import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────
export type Role = 'Administrador' | 'Gerente' | 'Atendente' | 'Operador de Máquinas' | 'Motorista'

export interface Staff {
    id: string
    name: string
    email: string
    phone: string
    role: Role
    unit: string
    active: boolean
    has_system_access: boolean
    processed_orders: number
    join_date: string
    user_id: string | null
    owner_id: string | null
    created_at: string
    updated_at: string
}

export type StaffFormData = Pick<Staff, 'name' | 'email' | 'phone' | 'role' | 'unit' | 'active' | 'has_system_access'>

export const ROLES: Role[] = ['Administrador', 'Gerente', 'Atendente', 'Operador de Máquinas', 'Motorista']

export const blankStaff = (): StaffFormData => ({
    name: '', email: '', phone: '', role: 'Atendente', unit: '', active: true, has_system_access: false
})

// ─── Helper: Get current user's effective owner_id ────────────────────────────
async function getEffectiveOwnerId(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Usuário não autenticado');

    // First, check if owner_id is already in JWT metadata (most efficient)
    const metaOwnerId = session.user.user_metadata?.owner_id;
    if (metaOwnerId) return metaOwnerId;

    const userId = session.user.id;

    // Fallback: Check if this user is a collaborator (has an owner_id in staff table)
    // Using a direct query - Note: if RLS is recursive, this will fail.
    const { data: staffRecord } = await supabase
        .from('staff')
        .select('owner_id')
        .eq('user_id', userId)
        .maybeSingle();

    // If they're a collaborator, return their owner_id; otherwise they ARE the owner
    return staffRecord?.owner_id || userId;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function fetchStaff(unit?: string): Promise<Staff[]> {
    const ownerId = await getEffectiveOwnerId();
    
    let query = supabase
        .from('staff')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

    if (unit && unit !== 'all') {
        // We expect 'unit' to be the unit ID from the caller (already filtered in page)
        // But the staff table stores 'unit' as a string (name). 
        // We'll keep it simple: if the caller wants to filter by ID, they should do it.
        // However, the database column is named 'unit'.
        // If the caller passes a name, it works. If it passes an ID, it needs resolution.
        // For now, let's assume the caller passes the resolved unit name if possible, 
        // or we just filter by the unit column.
        query = query.eq('unit', unit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('[staffService] fetchStaff error:', error.code, error.message);
        // If RLS is blocking (PGRST116, 42501) return empty array gracefully
        // The user needs to run the SQL migration in Supabase
        if (error.code === 'PGRST116' || error.code === '42501' || error.message?.includes('policy')) {
            console.warn('[staffService] RLS may be blocking. Run the SQL migration in Supabase.');
            return [];
        }
        throw error;
    }
    return (data as Staff[]) || []
}

export async function createStaff(form: StaffFormData): Promise<Staff> {
    // Get the owner_id: the admin creating this staff member
    const ownerId = await getEffectiveOwnerId();

    const { data, error } = await supabase
        .from('staff')
        .insert({
            name: form.name,
            email: form.email || null,
            phone: form.phone || null,
            role: form.role,
            unit: form.unit,
            active: form.active,
            has_system_access: form.has_system_access,
            owner_id: ownerId,
        })
        .select()
        .single()

    if (error) throw error
    return data as Staff
}

export async function updateStaff(id: string, form: Partial<StaffFormData>): Promise<Staff> {
    const { data, error } = await supabase
        .from('staff')
        .update({
            ...form,
            email: form.email || null,
            phone: form.phone || null,
        })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as Staff
}

export async function deleteStaff(id: string): Promise<void> {
    const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function toggleStaffStatus(id: string, active: boolean): Promise<Staff> {
    return updateStaff(id, { active })
}
