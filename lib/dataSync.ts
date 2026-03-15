import { useEffect } from 'react';
import { supabase } from './supabase'

/**
 * Data Sync Service
 * 
 * Sincroniza dados entre localStorage (browser) e Supabase (servidor).
 * Agora com suporte a persistência imediata.
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

export type SyncKey = typeof SYNC_KEYS[number];

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
 * PUSH: Salva dados do localStorage para o Supabase
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

            const parsed = JSON.parse(raw);
            const serverKey = KEY_MAP[localKey];

            const { error } = await supabase.rpc('set_laundry_data', {
                p_key: serverKey,
                p_value: parsed,
            });

            if (error) {
                console.error(`[DataSync] Erro ao salvar ${serverKey}:`, error.message);
            } else {
                console.log(`[DataSync] ✅ ${serverKey} enviado para nuvem`);
            }
        }
    } catch (err) {
        console.error('[DataSync] Erro no push:', err);
    }
}

/**
 * PULL: Carrega dados do Supabase para o localStorage
 */
export async function pullDataFromServer(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        for (const localKey of SYNC_KEYS) {
            const serverKey = KEY_MAP[localKey];

            const { data, error } = await supabase.rpc('get_laundry_data', {
                p_key: serverKey,
            });

            if (error) continue;

            if (data !== null) {
                const serverString = JSON.stringify(data);
                const rawLocal = localStorage.getItem(localKey);

                // Apenas sobrescreve se houver mudanças reais e não for um dado vazio vindo do servidor quando o local tem algo
                if (serverString !== rawLocal && serverString !== '[]' && serverString !== '{}') {
                    localStorage.setItem(localKey, serverString);
                    window.dispatchEvent(new CustomEvent('data-synced'));
                    if (localKey === 'lavanpro_units') {
                        window.dispatchEvent(new CustomEvent('refresh-units'));
                    }
                } else if ((serverString === '[]' || serverString === '{}') && rawLocal && rawLocal !== '[]' && rawLocal !== '{}') {
                    // SE o servidor está vazio mas o local tem dados (ex: nova instalação que ainda não subiu nada)
                    // NÃO sobrescrevemos o local com vazio. Em vez disso, deixamos o local como está
                    // para que o sistema possa funcionar offline/cache e subir os dados no próximo push.
                    console.log(`[DataSync] Mantendo cache local para ${serverKey} (servidor vazio)`);
                }
            }
        }
    } catch (err) {
        console.error('[DataSync] Erro no pull:', err);
    }
}

/**
 * Salva localmente e envia IMEDIATAMENTE para o servidor
 */
export async function syncSave(key: SyncKey, data: any) {
    if (typeof window === 'undefined') return;
    
    // 1. Salva no localStorage como cache secundário (opcional, mas evita stale data no read inicial)
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn(`[DataSync] Failed to save to localStorage: ${key}`, e);
    }
    
    // 2. Dispara evento local para compatibilidade com componentes legados
    window.dispatchEvent(new CustomEvent('data-synced', { detail: { key, data } }));
    if (key === 'lavanpro_units') window.dispatchEvent(new CustomEvent('refresh-units'));

    // 3. Envia para o servidor imediatamente
    const result = await pushDataToServer(key);
    
    // 4. Se for sucesso, podemos forçar um refresh no provider ou deixar o Realtime agir
    return result;
}

/**
 * SYNC: Alias para puxar dados iniciais
 */
export async function syncData() {
    return await pullDataFromServer();
}

/**
 * Hook para manter os dados atualizados automaticamente
 */

export function useAutoSync(intervalMs = 30000) {
    useEffect(() => {
        // Pull inicial
        pullDataFromServer();

        // Configura pooling
        const timer = setInterval(() => {
            pullDataFromServer();
        }, intervalMs);

        // Atualiza ao focar na aba
        const handleFocus = () => pullDataFromServer();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(timer);
            window.removeEventListener('focus', handleFocus);
        };
    }, [intervalMs]);
}
