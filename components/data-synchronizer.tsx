"use client";

import { useEffect, useRef } from "react";
import { useAutoSync } from "@/lib/dataSync";

export function DataSynchronizer() {
    useAutoSync(30000); // Sincroniza a cada 30 segundos
    return null;
}
