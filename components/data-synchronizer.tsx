"use client";

import { useEffect, useRef } from "react";
import { syncData, setupRealtimeSync, pushDataToServer } from "@/lib/dataSync";
import { usePermissions } from "@/hooks/usePermissions";

export function DataSynchronizer() {
    const { ownerId, loading } = usePermissions();
    const hasSyncedOnLogin = useRef(false);

    // 1. Sincronização Inicial ao carregar
    useEffect(() => {
        if (!loading && ownerId && !hasSyncedOnLogin.current) {
            hasSyncedOnLogin.current = true;
            syncData().catch(err => console.error("[DataSynchronizer] Initial sync error:", err));
        }
    }, [loading, ownerId]);

    // 2. Configurar Supabase Realtime para atualizações instantâneas
    useEffect(() => {
        if (!loading && ownerId) {
            const cleanup = setupRealtimeSync(ownerId);
            return () => {
                if (cleanup) cleanup();
            };
        }
    }, [loading, ownerId]);

    // 3. Monitorar alterações locais (nesta aba ou em outras)
    useEffect(() => {
        const handleLocalChange = () => {
            pushDataToServer();
        };

        const handleStorage = (e: StorageEvent) => {
            if (e.key && e.key.startsWith('lavanpro_')) {
                pushDataToServer();
            }
        };

        window.addEventListener('local-data-changed', handleLocalChange);
        window.addEventListener('storage', handleStorage);
        
        return () => {
            window.removeEventListener('local-data-changed', handleLocalChange);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    return null;
}
