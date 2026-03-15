"use client";

import { useEffect, useRef } from "react";
import { syncData } from "@/lib/dataSync";

export function DataSynchronizer() {
    const hasSynced = useRef(false);

    useEffect(() => {
        if (!hasSynced.current) {
            hasSynced.current = true;
            syncData().catch(err => console.error("DataSynchronizer error:", err));
        }
    }, []);

    return null;
}
