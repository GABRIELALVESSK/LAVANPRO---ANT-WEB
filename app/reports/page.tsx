"use client";

import { Sidebar } from "@/components/sidebar";
import { AccessGuard } from "@/components/access-guard";
import { PlanGuard } from "@/components/plan-guard";
import { Filters } from "@/components/filters";
import { UnitSelector } from "@/components/unit-selector";
import { useEffect, useState, useMemo } from "react";
import { useUnit } from "@/hooks/useUnit";
import { Download, Wallet, Activity, Users } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// ─── Data Helpers ─────────────────────────────────────────────────────────────
function formatCurrency(v: number) { 
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); 
}

function calcOrderTotal(items: any[]) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, i) => sum + (Number(i.qty || 0) * Number(i.unitPrice || 0)), 0);
}

// --- COMPONENTS ---

function CustomTooltip({ active, payload, label, prefix = "R$ " }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-card border border-brand-darkBorder text-brand-text p-3 rounded-xl shadow-2xl text-xs z-10 min-w-[140px]">
        <p className="font-bold text-brand-muted mb-2 uppercase tracking-wider text-[10px]">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 mt-1">
            <span className="text-brand-muted">{p.name}</span>
            <span className="font-bold">
              {prefix}{Number(p.value).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function ReportsPage() {
  const [activeRange, setActiveRange] = useState("30d");
  const { unitId: selectedUnit } = useUnit();
  const [customDates, setCustomDates] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [units, setUnits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("financeiro");
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Load Units
    const savedUnits = localStorage.getItem("lavanpro_units");
    if (savedUnits) {
      try { setUnits(JSON.parse(savedUnits)); } catch (e) {}
    }

    // Load Orders
    const savedOrders = localStorage.getItem("lavanpro_orders_v3");
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch (e) {}
    }

    // Load Customers
    const savedCustomers = localStorage.getItem("lavanpro_customers");
    if (savedCustomers) {
      try { setCustomers(JSON.parse(savedCustomers)); } catch (e) {}
    }

    // Load Finance
    const savedFinance = localStorage.getItem("lavanpro_finance_transactions");
    if (savedFinance) {
        try { setFinanceTransactions(JSON.parse(savedFinance)); } catch(e) {}
    }

    // Stock Alerts (Existing)
    const savedProducts = localStorage.getItem("lavanpro_stock_products_v2");
    if (savedProducts) {
      try {
        const products = JSON.parse(savedProducts);
        const alerts = products
          .filter((p: any) => p.currentStock <= (p.minStock || 0))
          .map((p: any) => ({
            name: p.name,
            current: p.currentStock,
            min: p.minStock,
            status: p.currentStock === 0 ? "Esgotado" : "Crítico",
            percent: p.minStock > 0 ? (p.currentStock / p.minStock) * 100 : 0,
            unit: p.unit || "un"
          }))
          .sort((a: any, b: any) => a.percent - b.percent);
        setStockAlerts(alerts);
      } catch (e) {
        console.error("Erro ao ler estoque para relatórios:", e);
      }
    }

  }, []);

  // ─── Filtered Data ────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let result = orders;
    
    // Unit filter
    if (selectedUnit !== "all") {
        result = result.filter(o => o.unitId === selectedUnit);
    }

    // Date filter
    const start = new Date(customDates.start + "T00:00:00");
    const end = new Date(customDates.end + "T23:59:59");
    
    return result.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
    });
  }, [orders, selectedUnit, customDates]);

  // ─── Metrics Calculation ──────────────────────────────────────────────────
  
  const filteredFinance = useMemo(() => {
    if (!selectedUnit || selectedUnit === "all") return financeTransactions;
    return financeTransactions.filter(t => t.unitId === selectedUnit);
  }, [financeTransactions, selectedUnit]);

  const filteredCustomers = useMemo(() => {
    if (!selectedUnit || selectedUnit === "all") return customers;
    return customers.filter(c => c.unitId === selectedUnit);
  }, [customers, selectedUnit]);
  
  // 1. Faturamento vs Ticket Médio (Daily)
  const faturamentoData = useMemo(() => {
    const map: Record<string, { faturamento: number; count: number }> = {};
    
    // Initialize last 7 days or range
    filteredOrders.forEach(o => {
        const dateKey = new Date(o.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        if (!map[dateKey]) map[dateKey] = { faturamento: 0, count: 0 };
        const total = calcOrderTotal(o.items);
        map[dateKey].faturamento += total;
        map[dateKey].count += 1;
    });

    return Object.entries(map).map(([date, data]) => ({
        date,
        faturamento: data.faturamento,
        ticket: data.count > 0 ? data.faturamento / data.count : 0
    })).sort((a,b) => {
        const [da, ma] = a.date.split("/").map(Number);
        const [db, mb] = b.date.split("/").map(Number);
        return (ma * 100 + da) - (mb * 100 + db);
    });
  }, [filteredOrders]);

  // 2. Serviços mais vendidos
  const servicosData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
        o.items.forEach((i: any) => {
            map[i.service] = (map[i.service] || 0) + (Number(i.qty) * Number(i.unitPrice));
        });
    });

    const colors = ["#8b5cf6", "#6366f1", "#a78bfa", "#ddd6fe", "#7c3aed", "#4f46e5"];
    return Object.entries(map)
        .map(([name, value], idx) => ({ name, value, color: colors[idx % colors.length] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
  }, [filteredOrders]);

  // 3. A Receber vs A Pagar
  const contasData = useMemo(() => {
    // Weekly grouping for the last 4 weeks or range
    const result = [
        { name: "Semana 1", aReceber: 0, aPagar: 0 },
        { name: "Semana 2", aReceber: 0, aPagar: 0 },
        { name: "Semana 3", aReceber: 0, aPagar: 0 },
        { name: "Semana 4", aReceber: 0, aPagar: 0 },
    ];

    // Simple placeholder logic: group by quarter of the filtered orders
    if (filteredOrders.length === 0) return result;

    filteredOrders.forEach((o, idx) => {
        const weekIdx = Math.min(3, Math.floor((idx / filteredOrders.length) * 4));
        const total = calcOrderTotal(o.items);
        if (o.paymentStatus === "A Pagar" || o.paymentStatus === "Faturado") {
            result[weekIdx].aReceber += total;
        }
    });

    // Add real expenses if available
    filteredFinance.forEach(t => {
        if (t.type === "DESPESA" && t.status !== "PAGO") {
            // Very simple mapping for now
            result[2].aPagar += t.value; 
        }
    });

    return result;
  }, [filteredOrders, filteredFinance]);

  // 4. Status de Pedidos
  const statusData = useMemo(() => {
    if (filteredOrders.length === 0) return [];
    
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
        map[o.status] = (map[o.status] || 0) + 1;
    });

    const colors: Record<string, string> = {
        "Entregue": "#10b981",
        "Lavagem": "#3b82f6",
        "Triagem": "#f59e0b",
        "Cancelado": "#ef4444",
        "Recebido": "#64748b",
        "Em Rota": "#8b5cf6"
    };

    return Object.entries(map).map(([name, count]) => ({
        name,
        value: Math.round((count / filteredOrders.length) * 100),
        color: colors[name] || "#a855f7"
    })).sort((a,b) => b.value - a.value);
  }, [filteredOrders]);

  // 5. Top Clientes
  const topClientesData = useMemo(() => {
    const map: Record<string, { nome: string; pedidos: number; valor: number; ultima: string }> = {};
    
    filteredOrders.forEach(o => {
        if (!map[o.client]) {
            map[o.client] = { nome: o.client, pedidos: 0, valor: 0, ultima: o.createdAt };
        }
        map[o.client].pedidos += 1;
        map[o.client].valor += calcOrderTotal(o.items);
        if (new Date(o.createdAt) > new Date(map[o.client].ultima)) {
            map[o.client].ultima = o.createdAt;
        }
    });

    return Object.entries(map)
        .map(([id, data]) => ({ 
            id, 
            nome: data.nome, 
            pedidos: data.pedidos, 
            valor: formatCurrency(data.valor), 
            ultima: new Date(data.ultima).toLocaleDateString("pt-BR")
        }))
        .sort((a, b) => {
            const valA = parseFloat(a.valor.replace(/[R$\.\s]/g, '').replace(',', '.'));
            const valB = parseFloat(b.valor.replace(/[R$\.\s]/g, '').replace(',', '.'));
            return valB - valA;
        })
        .slice(0, 5);
  }, [filteredOrders]);

  // 6. Produtividade (Just a placeholder based on unit distribution)
  const produtividadeData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
        const unit = o.unitId || "Default";
        map[unit] = (map[unit] || 0) + o.items.reduce((s: number, i: any) => s + (Number(i.qty) || 0), 0);
    });
    
    return Object.entries(map).map(([id, pecas]) => {
        const unit = units.find(u => u.id === id);
        // Map to unit.responsible or unit.name or "Default/Admin"
        const displayName = unit ? (unit.responsible || unit.name) : (id === "default" || id === "Default" ? "Gabriel Alves" : id);
        return { name: displayName, pecas };
    });
  }, [filteredOrders, units]);

  const tabs = [
    { id: "financeiro", label: "Financeiro e Vendas", icon: Wallet },
    { id: "operacional", label: "Operacional", icon: Activity },
    { id: "clientes", label: "Clientes", icon: Users },
  ];

  return (
    <AccessGuard permission="reports">
      <div className="flex min-h-screen bg-brand-bg text-brand-text font-sans">
        <Sidebar />
        <PlanGuard moduleName="Relatórios" requiredPlan="enterprise">
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <main className="flex-1 overflow-y-auto bg-brand-bg">
                <div className="px-8 pt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <Filters
                    title="Relatórios e Análises"
                    subtitle="Explore dados detalhados para tomada de decisão"
                    activeRange={activeRange}
                    onChange={setActiveRange}
                    customDates={customDates}
                    onCustomDatesChange={setCustomDates}
                  />
                  <div className="self-end md:self-auto" />
                </div>

              <div className="px-8 py-8 space-y-8 pb-16 max-w-[1800px] mx-auto">
                {/* Header / Export / Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 p-1 bg-brand-card border border-brand-darkBorder rounded-xl w-fit">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                            ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                            : "text-brand-muted hover:text-brand-text hover:bg-brand-primary/5"
                            }`}
                        >
                          <Icon className="size-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <button className="flex items-center gap-2 px-4 py-2 bg-brand-card hover:bg-brand-primary/10 hover:text-brand-primary text-brand-text border border-brand-darkBorder rounded-xl text-sm font-bold transition-colors">
                    <Download className="size-4" />
                    Exportar Relatório (PDF)
                  </button>
                </div>

                {/* TAB CONTENT: Financeiro e Vendas */}
                {activeTab === "financeiro" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Row 1: Vendas e Contas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Faturamento x Ticket Médio */}
                      <div className="bg-brand-card rounded-2xl border border-brand-darkBorder p-6 shadow-xl">
                        <div className="mb-6">
                          <h3 className="text-base font-bold text-brand-text">Faturamento vs Ticket Médio</h3>
                          <p className="text-xs text-brand-muted">Evolução no período selecionado</p>
                        </div>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={faturamentoData}>
                              <defs>
                                <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                              <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v / 1000}k`} tick={{ fontSize: 11, fill: "#64748b" }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area yAxisId="left" type="monotone" dataKey="faturamento" name="Faturamento" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorFat)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Contas a Pagar x Receber */}
                      <div className="bg-brand-card rounded-2xl border border-brand-darkBorder p-6 shadow-xl">
                        <div className="mb-6">
                          <h3 className="text-base font-bold text-brand-text">A Receber vs A Pagar</h3>
                          <p className="text-xs text-brand-muted">Fluxo de caixa previsto no período</p>
                        </div>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contasData} margin={{ top: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v / 1000}k`} tick={{ fontSize: 11, fill: "#64748b" }} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                              <Bar dataKey="aReceber" name="A Receber" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                              <Bar dataKey="aPagar" name="A Pagar" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                      {/* Serviços mais vendidos */}
                      <div className="bg-brand-card rounded-2xl border border-brand-darkBorder p-6 shadow-xl">
                        <div className="mb-6 flex justify-between items-center">
                          <div>
                            <h3 className="text-base font-bold text-brand-text">Serviços Mais Vendidos</h3>
                            <p className="text-xs text-brand-muted">Ranking por volume financeiro</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {servicosData.length > 0 ? servicosData.map((s, i) => (
                            <div key={s.name} className="flex items-center gap-4">
                              <span className="text-sm font-bold text-brand-muted w-4">{i + 1}</span>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-semibold text-brand-text">{s.name}</span>
                                  <span className="font-bold text-brand-muted">
                                    R$ {s.value.toLocaleString("pt-BR")}
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-brand-bg rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${(s.value / servicosData[0].value) * 100}%`, backgroundColor: s.color }} />
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-8 text-brand-muted text-sm">Sem dados de serviço no período.</div>
                          )}
                        </div>
                      </div>
                  </div>
                )}

                {/* TAB CONTENT: Operacional */}
                {activeTab === "operacional" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Status dos Pedidos */}
                      <div className="bg-brand-card rounded-2xl border border-brand-darkBorder p-6 shadow-xl flex flex-col">
                        <div className="mb-6">
                          <h3 className="text-base font-bold text-brand-text">Pedidos por Status</h3>
                          <p className="text-xs text-brand-muted">Distribuição percentual no período</p>
                        </div>
                        <div className="flex-1 flex items-center justify-center h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              >
                                {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip prefix="" />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {statusData.map(s => (
                            <div key={s.name} className="flex items-center gap-2">
                              <span className="size-3 rounded-full" style={{ backgroundColor: s.color }} />
                              <span className="text-sm text-brand-muted font-medium">{s.name}</span>
                              <span className="ml-auto text-sm font-bold text-brand-text">{s.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Produtividade */}
                      <div className="bg-brand-card rounded-2xl border border-brand-darkBorder p-6 shadow-xl">
                        <div className="mb-6">
                          <h3 className="text-base font-bold text-brand-text">Produtividade por Colaborador</h3>
                          <p className="text-xs text-brand-muted">Peças processadas/atendimentos</p>
                        </div>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={produtividadeData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#e2e8f0", fontWeight: 600 }} width={80} />
                              <Tooltip content={<CustomTooltip prefix="" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                              <Bar dataKey="pecas" name="Peças Processadas" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Alerta de Estoque Dinâmico */}
                    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder p-6 shadow-xl">
                      <div className="mb-6">
                        <h3 className="text-base font-bold text-brand-text">Alerta de Consumo de Estoque</h3>
                        <p className="text-xs text-brand-muted">Itens com nível crítico ou abaixo do mínimo</p>
                      </div>
                      
                      {stockAlerts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {stockAlerts.map((alert, i) => (
                            <div key={i} className="p-4 bg-brand-bg rounded-xl border border-brand-darkBorder flex flex-col gap-3">
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-sm text-white">{alert.name}</p>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                                  alert.status === "Esgotado" ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500"
                                }`}>
                                  {alert.status}
                                </span>
                              </div>
                              
                              <div className="flex justify-between text-xs text-brand-muted">
                                <span>Atual: <b className="text-white">{alert.current} {alert.unit}</b></span>
                                <span>Mínimo: <b>{alert.min} {alert.unit}</b></span>
                              </div>

                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${alert.status === "Esgotado" ? "bg-rose-500" : "bg-brand-primary"}`} 
                                  style={{ width: `${Math.min(100, Math.max(5, alert.percent))}%` }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-8 bg-brand-bg rounded-xl border border-brand-darkBorder border-dashed">
                          <p className="text-sm text-brand-muted">Todos os itens de estoque estão em níveis normais.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Clientes */}
                {activeTab === "clientes" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-xl overflow-hidden">
                      <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-bold text-brand-text">Clientes Mais Recorrentes</h3>
                          <p className="text-xs text-brand-muted">Ranking de clientes por volume de pedidos e valor no período</p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                          <thead>
                            <tr className="border-b border-brand-darkBorder bg-brand-bg/40">
                              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Posição</th>
                              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Cliente</th>
                              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Total de Pedidos</th>
                              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Volume Gerado</th>
                              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Último Pedido</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topClientesData.length > 0 ? topClientesData.map((cliente, i) => (
                              <tr key={cliente.id} className="border-b border-brand-darkBorder last:border-0 hover:bg-brand-primary/5 transition-colors">
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-bold ${i === 0 ? "bg-amber-500/20 text-amber-500" :
                                    i === 1 ? "bg-slate-300/20 text-slate-300" :
                                      i === 2 ? "bg-amber-700/20 text-amber-600" :
                                        "text-brand-muted"
                                    }`}>
                                    {i + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-semibold text-brand-text">{cliente.nome}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 bg-brand-bg rounded-md text-sm font-bold text-brand-primary border border-brand-darkBorder/50">
                                    {cliente.pedidos}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-emerald-500">{cliente.valor}</td>
                                <td className="px-6 py-4 text-sm text-brand-muted">{cliente.ultima}</td>
                              </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-brand-muted text-sm">Sem dados de clientes no período.</td>
                                </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </PlanGuard>
      </div>
    </AccessGuard>
  );
}
