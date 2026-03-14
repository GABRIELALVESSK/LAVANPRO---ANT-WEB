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
    created_at: string
    updated_at: string
}

export type StaffFormData = Pick<Staff, 'name' | 'email' | 'phone' | 'role' | 'unit' | 'active' | 'has_system_access'>

export const ROLES: Role[] = ['Administrador', 'Gerente', 'Atendente', 'Operador de Máquinas', 'Motorista']

export const blankStaff = (): StaffFormData => ({
    name: '', email: '', phone: '', role: 'Atendente', unit: '', active: true, has_system_access: false
})

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function fetchStaff(): Promise<Staff[]> {
    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Staff[]) || []
}

export async function createStaff(form: StaffFormData): Promise<Staff> {
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
