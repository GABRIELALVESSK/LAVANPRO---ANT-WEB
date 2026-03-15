import { useEffect } from 'react';
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
    'lavanpro_company',
    'lavanpro_operational',
    'lavanpro_system',
    'lavanpro_services_pro',
    'lavanpro_labels',
    'lavanpro_label_history',
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
    'lavanpro_company': 'company',
    'lavanpro_operational': 'operational',
    'lavanpro_system': 'system',
    'lavanpro_services_pro': 'services',
    'lavanpro_labels': 'labels',
    'lavanpro_label_history': 'label_history',
};

/**
 * Verifica se o usuário logado é Owner ou Colaborador
 */
export async function isUserOwner(): Promise<boolean> {
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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

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

            if (data !== null) {
                const serverString = JSON.stringify(data);
                const rawLocal = localStorage.getItem(localKey);

                // SEGURANÇA: Se o local tem dados e o servidor está vindo vazio '[]', 
                // não sobrescrevemos o local imediatamente. Damos preferência ao local 
                // se for a primeira vez sincronizando após correção de SQL.
                if ((serverString === '[]' || serverString === '{}') && rawLocal && rawLocal !== '[]' && rawLocal !== '{}') {
                    console.log(`[DataSync] ⚠️ Servidor vazio para ${serverKey}, mantendo dados locais e preparando push.`);
                    await pushDataToServer(localKey);
                    continue;
                }

                // Apenas sobrescreve o navegador se houver MUDANÇAS!
                if (serverString !== rawLocal) {
                    localStorage.setItem(localKey, serverString);
                    // Avisa a interface do sistema que a nuvem mudou algo
                    window.dispatchEvent(new CustomEvent('data-synced'));
                    if (localKey === 'lavanpro_units') {
                        window.dispatchEvent(new CustomEvent('refresh-units'));
                    }
                }
            }
        }
    } catch (err) {
        console.error('[DataSync] Erro no pull:', err);
    }
}

// Controle do pooling em tempo real
let isRealtimeStarted = false;

/**
 * SYNC: Sincroniza ativamente sempre mantendo o navegador do usuário fiel à nuvem
 */
export async function syncData(): Promise<void> {
    await pullDataFromServer();
    
    if (typeof window !== 'undefined' && !isRealtimeStarted) {
        isRealtimeStarted = true;
        setInterval(() => {
            pullDataFromServer();
        }, 10000); // 10 Segundos é mais seguro
    }
}

/**
 * Hook para manter os dados atualizados automaticamente
 */
export function useAutoSync(intervalMs = 60000) {
    useEffect(() => {
        syncData();

        const timer = setInterval(() => {
            pullDataFromServer();
        }, intervalMs);

        const handleFocus = () => {
            pullDataFromServer();
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(timer);
            window.removeEventListener('focus', handleFocus);
        };
    }, [intervalMs]);
}
