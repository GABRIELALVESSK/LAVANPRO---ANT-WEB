"use client";

import { useState, useEffect } from "react";

export function useUnit() {
  const [unitId, setUnitId] = useState<string>("all");

  useEffect(() => {
    // Initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("lavanpro_selected_unit");
      if (saved) setUnitId(saved);
    }

    const handleUnitChange = (e: any) => {
      setUnitId(e.detail);
    };

    window.addEventListener("unit-changed", handleUnitChange);
    return () => window.removeEventListener("unit-changed", handleUnitChange);
  }, []);

  const isAll = unitId === "all" || !unitId || unitId === "";

  return { unitId, isAll };
}
