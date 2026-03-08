"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import {
    Truck,
    CheckCircle2,
    AlertCircle,
    Clock,
    MapPin,
    Navigation,
    ArrowRight,
    ChevronRight,
    MoreVertical,
    Activity,
    History,
    Timer
} from "lucide-react";
import { motion } from "framer-motion";

export default function OrdersPage() {
    const stats = [
        { label: "Em Rota", value: "12", icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Prontos", value: "28", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Alertas", value: "05", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
        { label: "Novos", value: "14", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];

    const routes = [
        { driver: "Ricardo Camargo", status: "Rota Norte • Em movimento", icon: Activity, progress: 65 },
        { driver: "André Machado", status: "Rota Sul • Coleta", icon: MapPin, progress: 30 },
        { driver: "Lucas Mendes", status: "Oeste • Em pausa", icon: Timer, progress: 85 },
    ];

    const alerts = [
        { id: "#ORD-2849", type: "Atraso", desc: "Excedeu 4h do tempo de lavagem.", color: "text-rose-500" },
        { id: "#ORD-2710", type: "Ausente", desc: "Cliente ausente (3ª tentativa).", color: "text-amber-500" },
        { id: "#ORD-2855", type: "Validação", desc: "Requer validação de peça especial.", color: "text-blue-500" },
    ];

    return (
        <div className="flex h-screen bg-brand-bg text-brand-text font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto space-y-8">
                        {/* Header Section */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                    Gestão de Pedidos
                                </h1>
                                <p className="text-brand-muted text-sm font-medium flex items-center gap-2 mt-1">
                                    <Activity className="size-4 animate-pulse text-emerald-500" />
                                    Monitoramento e ações geolocalizadas em tempo real
                                </p>
                            </motion.div>

                            <div className="flex items-center gap-3">
                                <button className="px-4 py-2 bg-brand-card border border-brand-darkBorder rounded-lg text-xs font-bold text-white hover:bg-brand-darkBorder transition-all flex items-center gap-2">
                                    <History className="size-4" /> Ver Histórico
                                </button>
                                <button className="px-5 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2">
                                    Novo Pedido <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </header>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-brand-card p-6 rounded-2xl border border-brand-darkBorder hover:border-brand-primary/30 transition-all group relative overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full opacity-20 -mr-6 -mt-6 transition-transform group-hover:scale-110`} />
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl`}>
                                            <stat.icon className="size-6" />
                                        </div>
                                        <MoreVertical className="text-brand-muted size-5 cursor-pointer hover:text-white" />
                                    </div>
                                    <h3 className="text-4xl font-black text-white mb-1">{stat.value}</h3>
                                    <p className="text-brand-muted text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                            {/* GPS Tracking Section */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="xl:col-span-2 bg-brand-card rounded-2xl border border-brand-darkBorder shadow-2xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-brand-darkBorder flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                            <Navigation className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Pedidos por Rota / Motorista</h3>
                                            <p className="text-xs text-brand-muted">Posicionamento GPS em tempo real</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-brand-primary hover:underline">Expandir Mapa</button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {routes.map((route, idx) => (
                                        <div key={route.driver} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-full bg-brand-bg border border-brand-darkBorder flex items-center justify-center text-white font-bold text-xs uppercase">
                                                        {route.driver.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{route.driver}</p>
                                                        <p className="text-xs text-brand-muted flex items-center gap-1">
                                                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            {route.status}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                    <MapPin className="size-4" />
                                                </button>
                                            </div>
                                            <div className="relative h-1.5 w-full bg-brand-bg rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${route.progress}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + idx * 0.2 }}
                                                    className="absolute h-full bg-brand-primary rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Mock Map Background Container */}
                                    <div className="mt-8 relative h-64 bg-brand-bg border border-brand-darkBorder rounded-xl overflow-hidden group">
                                        <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AG-M0yG0Lp7m1_yK-W4d-qJt7Rz4f8v_tA-m3q0o5PzY=s2048')] opacity-30 mix-blend-overlay grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent" />

                                        {/* Animated Pulse Points */}
                                        <div className="absolute top-1/4 left-1/3 size-4 bg-brand-primary rounded-full">
                                            <div className="absolute inset-0 animate-ping bg-brand-primary rounded-full opacity-50" />
                                        </div>
                                        <div className="absolute bottom-1/3 right-1/4 size-4 bg-emerald-500 rounded-full">
                                            <div className="absolute inset-0 animate-ping bg-emerald-500 rounded-full opacity-50" />
                                        </div>

                                        <div className="absolute bottom-4 left-4 bg-brand-card/80 backdrop-blur-md p-3 rounded-lg border border-brand-darkBorder flex items-center gap-3">
                                            <div className="size-8 bg-brand-primary rounded-lg flex items-center justify-center">
                                                <Truck className="size-4 text-white" />
                                            </div>
                                            <p className="text-xs font-bold text-white">3 veículos ativos no momento</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Sidebar Content: Alerts & Actions */}
                            <div className="space-y-8">
                                {/* Critical Alerts Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-brand-card rounded-2xl border border-brand-darkBorder overflow-hidden"
                                >
                                    <div className="p-6 border-b border-brand-darkBorder flex items-center gap-3">
                                        <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                                            <AlertCircle className="size-5" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">Alertas Críticos</h3>
                                    </div>
                                    <div className="divide-y divide-brand-darkBorder">
                                        {alerts.map((alert) => (
                                            <div key={alert.id} className="p-6 hover:bg-white/5 transition-all cursor-pointer group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-black text-brand-primary">{alert.id}</span>
                                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${alert.color.replace('text', 'bg')}/10 ${alert.color}`}>
                                                        {alert.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-white mb-1 group-hover:translate-x-1 transition-transform">{alert.desc}</p>
                                                <button className="text-[11px] font-bold text-brand-muted hover:text-white flex items-center gap-1 transition-colors">
                                                    Resolver agora <ArrowRight className="size-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Operational Actions Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-brand-card rounded-2xl border border-brand-darkBorder overflow-hidden"
                                >
                                    <div className="p-6 border-b border-brand-darkBorder">
                                        <h3 className="text-lg font-bold text-white">Fila de Ações</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-4 group cursor-pointer hover:border-brand-primary transition-all">
                                            <div className="size-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                                                <CheckCircle2 className="size-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white">Faturamento Pendente</p>
                                                <p className="text-xs text-brand-muted">8 pedidos aguardando nota</p>
                                            </div>
                                            <ArrowRight className="size-4 text-brand-muted group-hover:text-white" />
                                        </div>

                                        <div className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-4 group cursor-pointer hover:border-brand-primary transition-all">
                                            <div className="size-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                                                <ArrowRight className="size-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white">Liberar para Rota</p>
                                                <p className="text-xs text-brand-muted">Rota Sul carregando</p>
                                            </div>
                                            <ArrowRight className="size-4 text-brand-muted group-hover:text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
        </div>
    );
}
