"use client";

import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/sidebar";
import { Filters } from "@/components/filters";
import { StatsCards } from "@/components/stats-cards";
import { DonutChart } from "@/components/donut-chart";
import { BarChart } from "@/components/bar-chart";
import { TransactionTable } from "@/components/transaction-table";
import {
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ArrowRight,
  Lock,
  Crown,
  Waves,
  Zap,
  PackageCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanGuard } from "@/components/plan-guard";
import { Order } from "@/lib/orders-data";
import { calculateDashboardMetrics } from "@/lib/dashboard-utils";
import { UnitSelector } from "@/components/unit-selector";

// Dynamic imports to avoid SSR issues with heavy/DOM-based components
const MainChart = dynamic(() => import("@/components/main-chart").then(mod => mod.MainChart), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-brand-card animate-pulse rounded-2xl border border-brand-darkBorder" />
});

export default function Page() {
  const router = useRouter();
  const { plan, isEnterprise } = useSubscription();
  const [activeRange, setActiveRange] = useState("30d");
  const [customDates, setCustomDates] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [activeUnit, setActiveUnit] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Set initial dates on client side only to avoid hydration mismatch
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = new Date().toISOString().split("T")[0];
    setCustomDates({ start, end });

    // Load initial unit preference
    const savedUnit = localStorage.getItem("lavanpro_selected_unit");
    if (savedUnit) setActiveUnit(savedUnit);

    const loadAndPurge = () => {
      const saved = localStorage.getItem("lavanpro_orders_v3");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          // Purge mock data to ensure "zeroed-out" state as requested
          const mockIDs = ["#ORD-2856", "#ORD-2855", "#ORD-2854", "#ORD-2853", "#ORD-2852", "#ORD-2851", "#ORD-3792", "ORD-2856", "ORD-3792"];
          const mockNames = ["Carlos Machado", "Hotel Bela Vista", "Maria Oliveira", "João Silva", "Augusto Silveira", "Mariana Souza", "Rodrigo Santos", "Gabriel Rodrigues Alves (Mock)"];
          
          const filtered = parsed.filter((o: any) => 
            !mockIDs.includes(o.id) && 
            !mockNames.includes(o.client) &&
            !o.id.includes("3792") && // Specifically target this one from user screenshot
            !o.id.includes("2856")
          );

          if (filtered.length !== parsed.length) {
            localStorage.setItem("lavanpro_orders_v3", JSON.stringify(filtered));
          }
          setOrders(filtered);
        } catch (e) {
          console.error("Error loading orders", e);
        }
      }
    };

    loadAndPurge();

    // Cleanup other mock legacy data
    const savedCust = localStorage.getItem("lavanpro_customers");
    if (savedCust) {
        try {
            const parsed = JSON.parse(savedCust);
            const filtered = parsed.filter((c: any) => !["Carlos Machado", "Hotel Bela Vista", "Maria Oliveira", "João Silva", "Mariana Souza", "Rodrigo Santos", "Gabriel Rodrigues Alves (Mock)"].includes(c.name));
            if (filtered.length !== parsed.length) localStorage.setItem("lavanpro_customers", JSON.stringify(filtered));
        } catch(e) {}
    }

    // Listener for sidebar unit changes
    const handleUnitChange = (e: any) => {
      setActiveUnit(e.detail);
    };
    window.addEventListener("unit-changed", handleUnitChange);
    return () => window.removeEventListener("unit-changed", handleUnitChange);
  }, []);

  const metrics = useMemo(() => {
    // If dates are not yet initialized, use placeholder values to avoid errors
    if (!customDates.start) {
      return calculateDashboardMetrics(orders, activeRange, {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      }, activeUnit);
    }
    return calculateDashboardMetrics(orders, activeRange, customDates, activeUnit);
  }, [orders, activeRange, customDates, activeUnit]);

  const handleNavigate = (route: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => params.append(key, value));
    }
    // Context persistence
    params.set("range", activeRange);
    params.set("unit", activeUnit);
    
    const queryString = params.toString();
    router.push(`${route}${queryString ? `?${queryString}` : ""}`);
  };

  const operationalData = [
    { 
      label: "Em Lavagem", 
      value: metrics.statusCounts["Lavagem"] || 0, 
      icon: Waves, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10", 
      dot: "bg-blue-500",
      route: "/orders",
      filters: { status: "Em Lavagem" }
    },
    { 
      label: "Prontos p/ Retirada", 
      value: metrics.statusCounts["Pronto"] || 0, 
      icon: PackageCheck, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10", 
      dot: "bg-emerald-500",
      route: "/orders",
      filters: { status: "Pronto" }
    },
    { 
      label: "Aguardando Coleta", 
      value: metrics.statusCounts["Recebido"] || 0, 
      icon: Clock, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10", 
      dot: "bg-amber-500",
      route: "/orders",
      filters: { status: "Recebido" }
    },
    { 
      label: "Em Rota", 
      value: metrics.statusCounts["Em Rota"] || 0, 
      icon: Truck, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10", 
      dot: "bg-purple-500",
      route: "/orders",
      filters: { status: "Em Rota" }
    },
    { 
      label: "Alertas", 
      value: metrics.statusCounts["Atraso"] || 0, 
      icon: AlertTriangle, 
      color: "text-rose-500", 
      bg: "bg-rose-500/10", 
      dot: "bg-rose-500",
      route: "/orders",
      filters: { status: "Atraso" }
    },
  ];

  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-brand-bg custom-scrollbar">
          {/* Stats & Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-8 pt-8">
            <Filters
              activeRange={activeRange}
              onChange={setActiveRange}
              customDates={customDates}
              onCustomDatesChange={setCustomDates}
            />
            
            <div className="flex items-center gap-4">
              {!isEnterprise && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <Crown className="size-3 text-amber-500" />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Plano Pro</span>
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-8 space-y-8 pb-16 max-w-[1800px] mx-auto">

            {/* Operational Quick View */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-brand-muted uppercase tracking-widest">Visão Operacional em Tempo Real</h2>
                <button 
                  onClick={() => router.push('/orders')}
                  className="flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline transition-all"
                >
                  Ver todos os pedidos <ArrowRight className="size-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {operationalData.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      onClick={() => handleNavigate(item.route, item.filters)}
                      className="bg-brand-card rounded-2xl border border-brand-darkBorder p-5 flex flex-col items-center gap-4 hover:border-brand-primary/40 hover:shadow-2xl hover:shadow-brand-primary/5 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      {/* Interactive glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className={`p-4 rounded-xl ${item.bg} group-hover:scale-110 transition-transform duration-300 shadow-inner relative z-10`}>
                        <Icon className={`size-6 ${item.color}`} />
                      </div>
                      <div className="text-center relative z-10">
                        <p className="text-3xl font-black text-brand-text tracking-tight group-hover:text-brand-primary transition-colors">{item.value}</p>
                        <p className="text-[11px] font-black text-brand-muted uppercase tracking-widest mt-1">{item.label}</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted bg-white/5 px-3 py-1 rounded-full relative z-10 group-hover:bg-brand-primary/10 transition-colors">
                        <span className={`size-1.5 rounded-full ${item.dot} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                        Status Ativo
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Revenue Cards */}
            <section>
              <h2 className="text-sm font-bold text-brand-muted uppercase tracking-widest mb-4">Métricas Financeiras</h2>
              <StatsCards 
                activeRange={activeRange} 
                customDates={customDates} 
                metrics={metrics}
              />
            </section>

            {/* Main Chart */}
            <MainChart 
                activeRange={activeRange} 
                customDates={customDates} 
                chartData={metrics.chartData}
                totalFaturado={metrics.faturamento}
                pedidosTotal={metrics.pedidosTotal}
            />

            {/* Dashboard BI - Enterprise Only Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                  Análise de BI e Mix de Produtos
                  {!isEnterprise && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-[9px] font-black border border-brand-darkBorder uppercase"><Crown className="size-2.5" /> Enterprise</span>}
                </h2>
              </div>

              <div className="relative">
                {!isEnterprise && (
                  <div className="absolute inset-0 z-10 bg-brand-bg/60 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-brand-darkBorder group">
                    <div className="p-4 bg-brand-card rounded-2xl border border-brand-darkBorder shadow-2xl text-center max-w-xs animate-in zoom-in-95 duration-300">
                      <div className="size-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="size-6 text-amber-500" />
                      </div>
                      <h3 className="text-sm font-bold text-brand-text mb-1 text-center">Gráficos Avançados Bloqueados</h3>
                      <p className="text-[11px] text-brand-muted mb-4 text-center">A análise detalhada de mix de produtos e performance por período é exclusiva para assinantes Enterprise.</p>
                      <button
                        onClick={() => router.push('/settings?tab=status')}
                        className="px-4 py-2 bg-brand-primary text-white text-[10px] font-black rounded-lg hover:bg-brand-primaryHover transition-all flex items-center gap-2 mx-auto"
                      >
                        Fazer Upgrade Agora <ArrowRight className="size-3" />
                      </button>
                    </div>
                  </div>
                )}

                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${!isEnterprise ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                    <DonutChart activeRange={activeRange} data={metrics.categoryRevenue} />
                    <BarChart activeRange={activeRange} data={metrics.paymentMethodRevenue} />
                  </div>
              </div>
            </section>

            {/* Transaction Table */}
            <TransactionTable activeRange={activeRange} customDates={customDates} orders={orders} />

          </div>
        </main>
        <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
      </div>
    </div>
  );
}
