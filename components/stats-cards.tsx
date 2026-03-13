"use client";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Receipt,
  Truck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { DashboardMetrics } from "@/lib/dashboard-utils";

interface StatsCardsProps {
  activeRange?: string;
  customDates?: { start: string; end: string };
  metrics: DashboardMetrics;
}

function formatCurrency(v: number) { 
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); 
}

function MiniSparkline({ color, up }: { color: string; up: boolean }) {
  const paths = {
    up: "M0 35 Q 20 28, 40 22 T 80 12 T 100 8",
    down: "M0 10 Q 30 18, 60 28 T 100 35",
    flat: "M0 20 Q 25 22, 50 18 T 100 20",
  };
  return (
    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
      <path
        d={up ? paths.up : paths.down}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
  sparkColor: string;
  extra?: string;
  extraLabel?: string;
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  trend,
  isPositive,
  sparkColor,
  extra,
  extraLabel,
}: StatCardProps) {
  return (
    <div className="bg-brand-card p-6 rounded-2xl border border-brand-darkBorder shadow-xl hover:border-brand-primary/30 hover:shadow-brand-primary/5 transition-all duration-300 group relative overflow-hidden">
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${isPositive ? "rgba(16,185,129,0.06)" : "rgba(244,63,94,0.06)"} 0%, transparent 70%)` }} />

      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${isPositive
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-rose-500/10 text-rose-500"
            }`}
        >
          {isPositive ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {trend}
        </span>
      </div>

      <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-2xl font-black text-brand-text mb-1">{value}</h3>

      {extra !== undefined && (
        <p className="text-[11px] text-brand-muted font-medium">
          <span className="text-brand-text font-bold">{extra}</span>
          {extraLabel && ` ${extraLabel}`}
        </p>
      )}

      <div className="w-full h-10 mt-3">
        <MiniSparkline color={sparkColor} up={isPositive} />
      </div>
    </div>
  );
}

export function StatsCards({ metrics }: StatsCardsProps) {
  const cards: StatCardProps[] = [
    {
      icon: <DollarSign className="size-5 text-emerald-500" />,
      iconBg: "bg-emerald-500/10",
      label: "Faturamento do Período",
      value: formatCurrency(metrics.faturamento),
      trend: "+5.4%", // Simplified trend
      isPositive: true,
      sparkColor: "#10b981",
    },
    {
      icon: <Receipt className="size-5 text-brand-primary" />,
      iconBg: "bg-brand-primary/10",
      label: "Ticket Médio",
      value: formatCurrency(metrics.ticketMedio),
      trend: "+1.2%",
      isPositive: true,
      sparkColor: "#8b5cf6",
    },
    {
      icon: <ShoppingBag className="size-5 text-blue-500" />,
      iconBg: "bg-blue-500/10",
      label: "Pedidos no Período",
      value: String(metrics.pedidosTotal),
      trend: "+8.3%",
      isPositive: true,
      sparkColor: "#3b82f6",
      extra: String(metrics.pedidosAbertos),
      extraLabel: "em aberto",
    },
    {
      icon: <Truck className="size-5 text-amber-500" />,
      iconBg: "bg-amber-500/10",
      label: "Taxa de Entrega",
      value: `${metrics.taxaEntrega.toFixed(0)}%`,
      trend: "+0.5%",
      isPositive: true,
      sparkColor: "#f59e0b",
      extra: `${metrics.taxaBalcao.toFixed(0)}%`,
      extraLabel: "retirada no balcão",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}
