"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SyncKey } from '@/lib/dataSync';
import { Order } from '@/lib/orders-data';
import { Customer } from '@/lib/customers-data';
import { Unit } from '@/lib/units-data';

interface BusinessData {
    units: Unit[];
    orders: Order[];
    customers: Customer[];
    finance: any[];
    stock_products: any[];
    stock_movements: any[];
    company: any;
    operational: any;
    system: any;
    services: any[];
    labels: any[];
    label_history: any[];
}

interface BusinessDataContextType {
    data: BusinessData;
    isLoading: boolean;
    refresh: (key?: SyncKey) => Promise<void>;
}

const KEY_MAP: Record<string, keyof BusinessData> = {
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

const INITIAL_DATA: BusinessData = {
    units: [],
    orders: [],
    customers: [],
    finance: [],
    stock_products: [],
    stock_movements: [],
    company: {},
    operational: {},
    system: {},
    services: [],
    labels: [],
    label_history: [],
};

const BusinessDataContext = createContext<BusinessDataContextType | undefined>(undefined);

export function BusinessDataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<BusinessData>(INITIAL_DATA);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async (key?: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const keysToFetch = key ? [key] : Object.values(KEY_MAP);

            const newData = { ...data };
            let hasChanges = false;

            for (const serverKey of keysToFetch) {
                const { data: serverData, error } = await supabase.rpc('get_laundry_data', {
                    p_key: serverKey,
                });

                if (!error && serverData !== null) {
                    const typedKey = serverKey as keyof BusinessData;
                    // @ts-ignore
                    newData[typedKey] = serverData;
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                setData(prev => ({ ...prev, ...newData }));
            }
        } catch (err) {
            console.error('[BusinessData] Error fetching data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    useEffect(() => {
        fetchData();

        // Supabase Realtime Subscription
        const channel = supabase
            .channel('laundry_data_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'laundry_data',
                },
                (payload) => {
                    console.log('[BusinessData] Realtime update received:', payload);
                    const serverKey = (payload.new as any)?.data_key;
                    const updatedValue = (payload.new as any)?.data_value;
                    
                    if (serverKey && KEY_MAP[serverKey]) {
                        const localKey = KEY_MAP[serverKey];
                        setData(prev => ({
                            ...prev,
                            [localKey]: updatedValue
                        }));
                        // Also dispatch local events for legacy compatibility
                        window.dispatchEvent(new CustomEvent('data-synced'));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const refresh = useCallback(async (localKey?: SyncKey) => {
        const serverKey = localKey ? KEY_MAP[localKey] : undefined;
        // @ts-ignore
        await fetchData(serverKey);
    }, [fetchData]);

    return (
        <BusinessDataContext.Provider value={{ data, isLoading, refresh }}>
            {children}
        </BusinessDataContext.Provider>
    );
}

export function useBusinessData() {
    const context = useContext(BusinessDataContext);
    if (context === undefined) {
        throw new Error('useBusinessData must be used within a BusinessDataProvider');
    }
    return context;
}
