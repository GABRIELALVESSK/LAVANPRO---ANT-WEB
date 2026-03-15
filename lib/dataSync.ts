import { supabase } from './supabase'

/**
 * Data Sync Service
 * 
 * Sincroniza dados entre localStorage (browser) e Supabase (servidor).
 * - Owner/Admin: SALVA do localStorage para o Supabase
 * - Colaborador: CARREGA do Supabase para o localStorage
 * 
 * Isso garante que colaboradores em outros navegadores vejam
 * os mesmos dados que o admin criou.
 */

const SYNC_KEYS = [
    'lavanpro_units',
    'lavanpro_orders_v3',
    'lavanpro_customers',
    'lavanpro_finance_transactions',
] as const;

type SyncKey = typeof SYNC_KEYS[number];

// Map localStorage keys to shorter data_key identifiers
const KEY_MAP: Record<SyncKey, string> = {
    'lavanpro_units': 'units',
    'lavanpro_orders_v3': 'orders',
    'lavanpro_customers': 'customers',
    'lavanpro_finance_transactions': 'finance',
};

/**
 * Verifica se o usuário logado é Owner ou Colaborador
 */
async function isUserOwner(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const meta = session.user.user_metadata;
    if (meta?.is_owner === true) return true;

    // Check staff table
    const { data } = await supabase
        .from('staff')
        .select('owner_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

    // Owner if owner_id matches their own id, or no owner_id (legacy admin)
    return !data?.owner_id || data.owner_id === session.user.id;
}

/**
 * PUSH: Admin salva dados do localStorage para o Supabase
 * Chamado quando admin faz alterações (cria pedido, cadastra unidade, etc.)
 */
export async function pushDataToServer(specificKey?: SyncKey): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const owner = await isUserOwner();
        if (!owner) {
            console.log('[DataSync] Colaborador não pode fazer push de dados.');
            return;
        }

        const keysToSync = specificKey ? [specificKey] : [...SYNC_KEYS];

        for (const localKey of keysToSync) {
            const raw = localStorage.getItem(localKey);
            if (!raw) continue;

            try {
                const parsed = JSON.parse(raw);
                const serverKey = KEY_MAP[localKey];

                const { error } = await supabase.rpc('set_laundry_data', {
                    p_key: serverKey,
                    p_value: parsed,
                });

                if (error) {
                    console.error(`[DataSync] Erro ao salvar ${serverKey}:`, error.message);
                } else {
                    console.log(`[DataSync] ✅ ${serverKey} sincronizado (${Array.isArray(parsed) ? parsed.length : 1} items)`);
                }
            } catch (parseErr) {
                console.error(`[DataSync] Erro ao parsear ${localKey}:`, parseErr);
            }
        }
    } catch (err) {
        console.error('[DataSync] Erro no push:', err);
    }
}

/**
 * PULL: Colaborador carrega dados do Supabase para o localStorage
 * Chamado quando o colaborador faz login ou abre o app
 */
export async function pullDataFromServer(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        for (const localKey of SYNC_KEYS) {
            const serverKey = KEY_MAP[localKey];

            const { data, error } = await supabase.rpc('get_laundry_data', {
                p_key: serverKey,
            });

            if (error) {
                console.error(`[DataSync] Erro ao carregar ${serverKey}:`, error.message);
                continue;
            }

            if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
                localStorage.setItem(localKey, JSON.stringify(data));
                console.log(`[DataSync] ✅ ${serverKey} carregado do servidor (${Array.isArray(data) ? data.length : 1} items)`);
            }
        }

        // Notificar componentes que os dados foram atualizados
        window.dispatchEvent(new CustomEvent('data-synced'));
        window.dispatchEvent(new CustomEvent('refresh-units'));
    } catch (err) {
        console.error('[DataSync] Erro no pull:', err);
    }
}

/**
 * SYNC: Sincroniza automaticamente
 * - Owner → Push (localStorage → Supabase)
 * - Colaborador → Pull (Supabase → localStorage)
 */
export async function syncData(): Promise<void> {
    const owner = await isUserOwner();

    if (owner) {
        await pushDataToServer();
    } else {
        await pullDataFromServer();
    }
}
