"use client";

import { useState, useEffect } from "react";
import { ChevronDown, MapPin, Globe } from "lucide-react";
import { Unit } from "@/lib/units-data";
import { motion, AnimatePresence } from "framer-motion";
import { usePermissions } from "@/hooks/usePermissions";
import { useBusinessData } from "./business-data-provider";

interface UnitSelectorProps {
  onUnitChange?: (unitId: string) => void;
  showAllOption?: boolean;
}

export function UnitSelector({ onUnitChange, showAllOption = true }: UnitSelectorProps) {
  const { data: businessData, saveData } = useBusinessData();
  const { isOwner, staffUnit, loading: permsLoading } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  // 1. Determine if user is restricted to a specific unit
  const isSpecificUnit = !isOwner && staffUnit && staffUnit.toLowerCase() !== "todas as unidades" && staffUnit.toLowerCase() !== "todas";

  // 2. Filter available units based on restrictions
  let units = businessData.units || [];
  if (isSpecificUnit) {
      const staffUnitNormalized = staffUnit.trim().toLowerCase();
      units = units.filter(u => u.name.trim().toLowerCase() === staffUnitNormalized);
  }

  const selectedUnit = businessData.selectedUnit || "all";

  // Handle forcing unit for specific staff or defaulting to first unit
  useEffect(() => {
    if (permsLoading || units.length === 0) return;

    if (isSpecificUnit) {
      // If restricted, force selectedUnit to match the only available unit
      const matchedUnit = units[0];
      if (matchedUnit && selectedUnit !== matchedUnit.id) {
        saveData("lavanpro_selected_unit", matchedUnit.id);
        if (onUnitChange) onUnitChange(matchedUnit.id);
      }
    } else {
      // Logic for selecting a default unit if none is selected
      if (!selectedUnit && !showAllOption && units.length > 0) {
        const firstUnitId = units[0].id;
        saveData("lavanpro_selected_unit", firstUnitId);
      }
    }
  }, [showAllOption, isSpecificUnit, permsLoading, units.length, selectedUnit, saveData, onUnitChange]);

  const handleSelect = (id: string) => {
    if (id === selectedUnit) {
        setIsOpen(false);
        return;
    }
    
    saveData("lavanpro_selected_unit", id);
    setIsOpen(false);
    if (onUnitChange) onUnitChange(id);
  };

  const currentUnit = units.find(u => u.id === selectedUnit);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 px-4 py-2 bg-brand-card border border-brand-darkBorder rounded-xl hover:border-brand-primary/40 transition-all text-sm font-bold text-brand-text shadow-lg group"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="size-6 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform shrink-0">
            {selectedUnit === "all" ? <Globe className="size-3.5" /> : <MapPin className="size-3.5" />}
          </div>
          <div className="text-left truncate">
            <p className="text-[10px] text-brand-muted uppercase tracking-widest leading-none mb-0.5">Unidade</p>
            <p className="truncate">
              {selectedUnit === "all" ? "Todas as Unidades" : currentUnit?.name || "Selecionar..."}
            </p>
          </div>
        </div>
        <ChevronDown className={`size-4 text-brand-muted transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-full bg-brand-card border border-brand-darkBorder rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {showAllOption && (isOwner || !staffUnit || staffUnit.toLowerCase() === "todas as unidades" || staffUnit.toLowerCase() === "todas") && (
                <button
                  onClick={() => handleSelect("all")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedUnit === "all" ? "bg-brand-primary text-white" : "hover:bg-white/5 text-brand-text"}`}
                >
                  <Globe className="size-4" />
                  <span className="text-sm font-bold">Todas as Unidades</span>
                </button>
              )}
              
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => handleSelect(unit.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedUnit === unit.id ? "bg-brand-primary text-white" : "hover:bg-white/5 text-brand-text"}`}
                >
                  <MapPin className="size-4" />
                  <div className="text-left">
                    <p className="text-sm font-bold truncate max-w-[180px]">{unit.name}</p>
                    <p className={`text-[10px] font-medium ${selectedUnit === unit.id ? "text-white/70" : "text-brand-muted"} truncate max-w-[180px]`}>
                      {unit.city}, {unit.state}
                    </p>
                  </div>
                </button>
              ))}

              {units.length === 0 && (
                <div className="p-4 text-center">
                    <p className="text-xs text-brand-muted">Nenhuma unidade cadastrada.</p>
                    {isOwner && (
                      <button 
                          onClick={() => window.location.href = '/settings?tab=unit'}
                          className="mt-2 text-[10px] font-bold text-brand-primary hover:underline"
                      >
                          Configurar agora
                      </button>
                    )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
