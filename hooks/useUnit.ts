import { useBusinessData } from "@/components/business-data-provider";
import { usePermissions } from "@/hooks/usePermissions";

export function useUnit() {
  const { data } = useBusinessData();
  const { isOwner, staffUnit } = usePermissions();
  
  let unitId = data.selectedUnit || "all";

  // Force actual restricted unit if it's set for this staff member
  const isSpecificUnit = staffUnit && staffUnit.toLowerCase() !== "todas as unidades" && staffUnit.toLowerCase() !== "todas";
  
  if (!isOwner && isSpecificUnit) {
      const units = data.units || [];
      const staffUnitNormalized = staffUnit.trim().toLowerCase();
      const matchedUnit = units.find((u: any) => u.name.trim().toLowerCase() === staffUnitNormalized);
      
      if (matchedUnit) {
          unitId = matchedUnit.id;
      }
  }

  const isAll = unitId === "all" || !unitId || unitId === "";

  return { unitId, isAll, staffUnit };
}
