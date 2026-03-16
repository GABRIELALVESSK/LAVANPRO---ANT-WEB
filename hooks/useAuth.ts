import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAndEnrichUser = async (sessionUser: User | null) => {
            if (!sessionUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Se o usuário já tem owner_id nos metadados, estamos prontos
            if (sessionUser.user_metadata?.owner_id) {
                setUser(sessionUser);
                setLoading(false);
                return;
            }

            // Caso contrário, tenta buscar do banco e atualizar os metadados (proativo)
            try {
                const { data: staff } = await supabase
                    .from('staff')
                    .select('name, role, owner_id')
                    .eq('email', sessionUser.email!)
                    .maybeSingle();

                if (staff) {
                    const { data: { user: updatedUser } } = await supabase.auth.updateUser({
                        data: {
                            full_name: staff.name,
                            role: staff.role,
                            owner_id: staff.owner_id,
                            is_owner: staff.owner_id === sessionUser.id
                        }
                    });
                    setUser(updatedUser);
                } else {
                    setUser(sessionUser);
                }
            } catch (e) {
                console.error("Auth enrichment error:", e);
                setUser(sessionUser);
            } finally {
                setLoading(false);
            }
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            checkAndEnrichUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            checkAndEnrichUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return {
        user,
        loading,
        isAdmin: user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'Administrador' || user?.user_metadata?.is_owner === true,
        isManager: user?.user_metadata?.role === 'manager' || user?.user_metadata?.role === 'Gerente',
        staffName: user?.user_metadata?.full_name || user?.email || 'Usuário',
        ownerId: user?.user_metadata?.owner_id || user?.id
    };
}
