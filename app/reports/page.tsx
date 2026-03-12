"use client";

import { Sidebar } from "@/components/sidebar";
import { AccessGuard } from "@/components/access-guard";
import { PlanGuard } from "@/components/plan-guard";
import { Filters } from "@/components/filters";
import { useState } from "react";
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

// --- MOCK DATA ---

const faturamentoData = [
  { date: "01/05", faturamento: 4500, ticket: 85 },
  { date: "05/05", faturamento: 5200, ticket: 82 },
  { date: "10/05", faturamento: 4800, ticket: 90 },
  { date: "15/05", faturamento: 6100, ticket: 88 },
  { date: "20/05", faturamento: 5900, ticket: 95 },
  { date: "25/05", faturamento: 7500, ticket: 84 },
  { date: "30/05", faturamento: 8200, ticket: 89 },
];

const servicosData = [
  { name: "Lavagem Completa", value: 12500, color: "#8b5cf6" },
  { name: "Dry Clean", value: 8400, color: "#6366f1" },
  { name: "Apenas Passar", value: 4200, color: "#a78bfa" },
  { name: "Enxoval", value: 2100, color: "#ddd6fe" },
];

const contasData = [
  { name: "Semana 1", aReceber: 3200, aPagar: 1500 },
  { name: "Semana 2", aReceber: 4100, aPagar: 2100 },
  { name: "Semana 3", aReceber: 3800, aPagar: 1800 },
  { name: "Semana 4", aReceber: 5200, aPagar: 2900 },
];

const statusData = [
  { name: "Concluído", value: 65, color: "#10b981" },
  { name: "Em Lavagem", value: 20, color: "#3b82f6" },
  { name: "Aguardando", value: 10, color: "#f59e0b" },
  { name: "Cancelado", value: 5, color: "#ef4444" },
];

const produtividadeData = [
  { name: "Carlos", pecas: 450 },
  { name: "Mariana", pecas: 380 },
  { name: "João", pecas: 420 },
  { name: "Ana", pecas: 510 },
];

const topClientes = [
  { id: 1, nome: "Hotel Bela Vista", pedidos: 24, valor: "R$ 4.250,00", ultima: "Ontem" },
  { id: 2, nome: "Pousada Rio Verde", pedidos: 18, valor: "R$ 3.100,00", ultima: "Hoje" },
  { id: 3, nome: "Ana Paula Silva", pedidos: 12, valor: "R$ 1.840,00", ultima: "Há 2 dias" },
  { id: 4, nome: "Restaurante Sabor", pedidos: 10, valor: "R$ 1.500,00", ultima: "Há 4 dias" },
  { id: 5, nome: "Clínica Saúde", pedidos: 8, valor: "R$ 1.250,00", ultima: "Há 1 semana" },
];

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
  const [selectedUnit, setSelectedUnit] = useState("Todas as Unidades");
  const [customDates, setCustomDates] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [activeTab, setActiveTab] = useState("financeiro");

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
              <Filters
                title="Relatórios e Análises"
                subtitle="Explore dados detalhados para tomada de decisão"
                activeRange={activeRange}
                onChange={setActiveRange}
                customDates={customDates}
                onCustomDatesChange={setCustomDates}
                selectedUnit={selectedUnit}
                onUnitChange={setSelectedUnit}
              />

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

                    {/* Row 2: Serviços mais vendidos */}
                    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder p-6 shadow-xl">
                      <div className="mb-6 flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-bold text-brand-text">Serviços Mais Vendidos</h3>
                          <p className="text-xs text-brand-muted">Ranking por volume financeiro</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {servicosData.map((s, i) => (
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
                        ))}
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

                    {/* Consumo de Estoque Placeholder */}
                    <div className="bg-brand-card rounded-2xl border border-brand-darkBorder p-6 shadow-xl">
                      <div className="mb-6 flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-bold text-brand-text">Alerta de Consumo de Estoque</h3>
                          <p className="text-xs text-brand-muted">Itens com giro rápido no período</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center p-8 bg-brand-bg rounded-xl border border-brand-darkBorder border-dashed">
                        <p className="text-sm text-brand-muted">Os dados de estoque serão conectados em breve.</p>
                      </div>
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
                            {topClientes.map((cliente, i) => (
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
                            ))}
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
