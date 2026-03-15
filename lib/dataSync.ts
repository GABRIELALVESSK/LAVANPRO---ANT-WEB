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
    'lavanpro_stock_products_v2',
    'lavanpro_stock_movements_v2',
    'lavanpro_services_pro',
    'lavanpro_labels',
    'lavanpro_label_history',
    'lavanpro_company',
    'lavanpro_operational',
    'lavanpro_system',
] as const;

type SyncKey = typeof SYNC_KEYS[number];

// Map localStorage keys to shorter data_key identifiers
const KEY_MAP: Record<SyncKey, string> = {
    'lavanpro_units': 'units',
    'lavanpro_orders_v3': 'orders',
    'lavanpro_customers': 'customers',
    'lavanpro_finance_transactions': 'finance',
    'lavanpro_stock_products_v2': 'stock_products',
    'lavanpro_stock_movements_v2': 'stock_movements',
    'lavanpro_services_pro': 'services',
    'lavanpro_labels': 'labels',
    'lavanpro_label_history': 'label_history',
    'lavanpro_company': 'settings_company',
    'lavanpro_operational': 'settings_operational',
    'lavanpro_system': 'settings_system',
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
 * Notifica o sistema que dados locais mudaram e precisam ser subidos
 */
export function notifyDataChanged() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('local-data-changed'));
}

/**
 * PUSH: Salva dados do localStorage para o Supabase
 */
let pushTimeout: NodeJS.Timeout | null = null;
export async function pushDataToServer(specificKey?: SyncKey): Promise<void> {
    if (typeof window === 'undefined') return;

    // Debounce de 2 segundos para evitar excesso de requisições
    if (pushTimeout) clearTimeout(pushTimeout);
    
    return new Promise((resolve) => {
        pushTimeout = setTimeout(async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return;

                const keysToSync = specificKey ? [specificKey] : [...SYNC_KEYS];

                for (const localKey of keysToSync) {
                    const raw = localStorage.getItem(localKey);
                    if (!raw) continue;

                    try {
                        const parsed = JSON.parse(raw);
                        const serverKey = KEY_MAP[localKey];

                        await supabase.rpc('set_laundry_data', {
                            p_key: serverKey,
                            p_value: parsed,
                        });
                    } catch (parseErr) {
                        console.error(`[DataSync] Erro ao parsear ${localKey}:`, parseErr);
                    }
                }
                console.log('[DataSync] 🚀 Backup concluído no servidor');
                resolve();
            } catch (err) {
                console.error('[DataSync] Erro no push:', err);
                resolve();
            }
        }, 2000);
    });
}

/**
 * PULL: Carrega dados do Supabase para o localStorage
 */
export async function pullDataFromServer(specificKey?: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const keysToPull = specificKey ? [SYNC_KEYS.find(k => KEY_MAP[k] === specificKey) as SyncKey].filter(Boolean) : [...SYNC_KEYS];

        for (const localKey of keysToPull) {
            const serverKey = KEY_MAP[localKey];

            const { data, error } = await supabase.rpc('get_laundry_data', {
                p_key: serverKey,
            });

            if (error) {
                console.error(`[DataSync] Erro ao carregar ${serverKey}:`, error.message);
                continue;
            }

            if (data) {
                const currentLocal = localStorage.getItem(localKey);
                const serverDataStr = JSON.stringify(data);
                
                if (currentLocal !== serverDataStr) {
                    localStorage.setItem(localKey, serverDataStr);
                    console.log(`[DataSync] ✅ ${serverKey} atualizado pelo servidor`);
                    
                    window.dispatchEvent(new CustomEvent('data-synced', { detail: { key: serverKey } }));
                    if (serverKey === 'units') window.dispatchEvent(new CustomEvent('refresh-units'));
                }
            }
        }
    } catch (err) {
        console.error('[DataSync] Erro no pull:', err);
    }
}

/**
 * SYNC: Sincroniza bidirecionalmente
 */
export async function syncData(): Promise<void> {
    const owner = await isUserOwner();
    await pullDataFromServer();
    if (owner) {
        await pushDataToServer();
    }
}

/**
 * REALTIME: Escuta mudanças no Supabase e atualiza localmente NA HORA
 */
export function setupRealtimeSync(ownerId: string) {
  if (!ownerId) return;

  console.log(`[DataSync] 📡 Realtime Ativo para Owner: ${ownerId}`);

  const channel = supabase
    .channel(`laundry_updates_${ownerId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Escuta INSERT, UPDATE e DELETE
        schema: 'public',
        table: 'laundry_data',
        filter: `owner_id=eq.${ownerId}`,
      },
      (payload) => {
        const key = (payload.new as any)?.data_key || (payload.old as any)?.data_key;
        if (key) {
           console.log(`[DataSync] 🔔 Servidor alterou ${key}, atualizando interface...`);
           pullDataFromServer(key);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
