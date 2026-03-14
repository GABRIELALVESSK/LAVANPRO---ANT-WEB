import { Order } from "./orders-data";

export interface DashboardMetrics {
  faturamento: number;
  pedidosTotal: number;
  pedidosAbertos: number;
  ticketMedio: number;
  taxaEntrega: number;
  taxaBalcao: number;
  statusCounts: Record<string, number>;
  categoryRevenue: { label: string; value: number }[];
  paymentMethodRevenue: { method: string; value: number }[];
  chartData: { date: string; atual: number; anterior: number }[];
}

export function calculateDashboardMetrics(orders: Order[] = [], range: string, customDates?: { start: string; end: string }, unitId?: string): DashboardMetrics {
  const now = new Date();
  let startDate = new Date();

  // Robust array check
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  // 1. Filter by unit first if specified and not "all"
  let unitFilteredOrders = safeOrders;
  if (unitId && unitId !== "all") {
    unitFilteredOrders = safeOrders.filter(o => o.unitId === unitId);
  }

  // 2. Resolve the start date for the selected range
  try {
    if (range === "hoje") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7d") {
      startDate.setTime(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      startDate.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === "custom" && customDates?.start) {
      startDate = new Date(customDates.start + "T00:00:00");
    } else {
      startDate.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  } catch (e) {
    console.error("Error parsing dates in calculateDashboardMetrics:", e);
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Ensure startDate is a valid date
  if (isNaN(startDate.getTime())) {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // 3. Filter by date range
  const filteredOrders = unitFilteredOrders.filter(o => {
    if (!o.createdAt) return false;
    try {
        const orderDate = new Date(o.createdAt);
        return orderDate >= startDate;
    } catch {
        return false;
    }
  });
  
  const faturamento = filteredOrders.reduce((acc, o) => {
    const items = Array.isArray(o.items) ? o.items : [];
    const total = items.reduce((sum, i) => sum + ((Number(i.qty) || 0) * (Number(i.unitPrice) || 0)), 0);
    return acc + total;
  }, 0);

  const pedidosTotal = filteredOrders.length;
  const pedidosAbertos = filteredOrders.filter(o => o.status !== "Entregue" && o.status !== "Cancelado").length;
  const ticketMedio = pedidosTotal > 0 ? faturamento / pedidosTotal : 0;

  const pedidosEntrega = filteredOrders.filter(o => o.delivery !== "Balcão").length;
  const taxaEntrega = pedidosTotal > 0 ? (pedidosEntrega / pedidosTotal) * 100 : 0;
  const taxaBalcao = 100 - taxaEntrega;

  const statusCounts: Record<string, number> = {
    "Recebido": 0,
    "Triagem": 0,
    "Lavagem": 0,
    "Secagem": 0,
    "Finalização": 0,
    "Pronto": 0,
    "Entregue": 0,
    "Cancelado": 0,
    "Em Rota": 0,
    "Atraso": 0
  };

  filteredOrders.forEach(o => {
    if (o.status && statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    }
  });

  const catMap: Record<string, number> = {};
  const payMap: Record<string, number> = {};

  filteredOrders.forEach(o => {
    // Payment Method
    const pMethod = o.paymentMethod || "Outros";
    const items = Array.isArray(o.items) ? o.items : [];
    const oTotal = items.reduce((sum, i) => sum + ((Number(i.qty) || 0) * (Number(i.unitPrice) || 0)), 0);
    payMap[pMethod] = (payMap[pMethod] || 0) + oTotal;

    // Categories (Services)
    items.forEach(item => {
      const cat = item.service || "Geral";
      const itemTotal = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
      catMap[cat] = (catMap[cat] || 0) + itemTotal;
    });
  });

  const categoryRevenue = Object.entries(catMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const paymentMethodRevenue = Object.entries(payMap)
    .map(([method, value]) => ({ method, value }))
    .sort((a, b) => b.value - a.value);

  // Simple chart daily data for the range
  const chartData: { date: string; atual: number; anterior: number }[] = [];
  const days = range === "hoje" ? 12 : range === "7d" ? 7 : 30;
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    if (range === "hoje") {
        d.setHours(now.getHours() - i);
    } else {
        d.setDate(now.getDate() - i);
    }
    
    const label = range === "hoje" ? `${d.getHours()}:00` : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    
    const dayOrders = filteredOrders.filter(o => {
      if (!o.createdAt) return false;
      try {
        const orderDate = new Date(o.createdAt);
        if (range === "hoje") return orderDate.getHours() === d.getHours() && orderDate.toDateString() === now.toDateString();
        return orderDate.toDateString() === d.toDateString();
      } catch {
        return false;
      }
    });

    const dayValue = dayOrders.reduce((acc, o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      return acc + items.reduce((sum, i) => sum + ((Number(i.qty) || 0) * (Number(i.unitPrice) || 0)), 0);
    }, 0);
    
    chartData.push({
      date: label,
      atual: dayValue,
      anterior: 0 // Default to zero comparison instead of random to avoid hydration mismatch
    });
  }

  return {
    faturamento,
    pedidosTotal,
    pedidosAbertos,
    ticketMedio,
    taxaEntrega,
    taxaBalcao,
    statusCounts,
    categoryRevenue,
    paymentMethodRevenue,
    chartData
  };
}
