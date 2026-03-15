"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
    selectedUnit: string;
}

interface BusinessDataContextType {
    data: BusinessData;
    isLoading: boolean;
    refresh: (key?: string) => Promise<void>;
    saveData: (key: string, value: any) => Promise<void>;
}

const SERVER_KEYS = [
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
    'lavanpro_selected_unit',
];

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
    'lavanpro_selected_unit': 'selectedUnit',
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
    selectedUnit: 'all',
};

const BusinessDataContext = createContext<BusinessDataContextType | undefined>(undefined);

export function BusinessDataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<BusinessData>(INITIAL_DATA);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async (singleKey?: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setIsLoading(false);
                return;
            }

            const keysToFetch = singleKey ? [singleKey] : SERVER_KEYS;
            const updatedData = { ...data };
            let changed = false;

            for (const key of keysToFetch) {
                const { data: serverData, error } = await supabase.rpc('get_laundry_data', {
                    p_key: key,
                });

                if (!error && serverData !== null) {
                    const localKey = KEY_MAP[key];
                    if (localKey) {
                        (updatedData as any)[localKey] = serverData;
                        changed = true;
                    }
                }
            }

            if (changed) {
                setData(updatedData);
            }
        } catch (err) {
            console.error('[BusinessData] Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    useEffect(() => {
        // Initial load
        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel('laundry_data_realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'laundry_data',
                },
                (payload) => {
                    const newData = payload.new as any;
                    if (newData && newData.data_key && KEY_MAP[newData.data_key]) {
                        const localKey = KEY_MAP[newData.data_key];
                        setData(prev => ({
                            ...prev,
                            [localKey]: newData.data_value
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const saveData = useCallback(async (key: string, value: any) => {
        try {
            const { error } = await supabase.rpc('set_laundry_data', {
                p_key: key,
                p_value: value,
            });

            if (error) throw error;

            // Optional: local update for immediate feedback (though realtime will handle it)
            const localKey = KEY_MAP[key];
            if (localKey) {
                setData(prev => ({ ...prev, [localKey]: value }));
            }
        } catch (err) {
            console.error('[BusinessData] Error saving:', err);
            throw err;
        }
    }, []);

    const refresh = useCallback(async (key?: string) => {
        await fetchData(key);
    }, [fetchData]);

    return (
        <BusinessDataContext.Provider value={{ data, isLoading, refresh, saveData }}>
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
