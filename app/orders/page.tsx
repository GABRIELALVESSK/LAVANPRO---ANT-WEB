"use client";

import { Sidebar } from "@/components/sidebar";
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
    Timer,
    X,
    User,
    Phone,
    Mail,
    CreditCard,
    Home,
    ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function OrdersPage() {
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [activeList, setActiveList] = useState<string | null>(null);
    const [selectedAction, setSelectedAction] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

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

    const [orders, setOrders] = useState([
        { id: "#ORD-2856", client: "Carlos Machado", phone: "(11) 98765-4321", email: "carlos.machado@email.com", address: "Rua Augusta, 1500 - Consolação", payment: "Cartão de Crédito - Pago", delivery: "Entrega em Domicílio", service: "Lavagem Completa", status: "Lavando", time: "45 min", progress: 30, bgColor: "bg-brand-primary", textColor: "text-brand-muted" },
        { id: "#ORD-2854", client: "Maria Oliveira", phone: "(11) 91234-5678", email: "maria.oli@email.com", address: "Av. Paulista, 1000 - Bela Vista", payment: "PIX - Pago", delivery: "Retirada no Balcão", service: "Edredom", status: "Secando", time: "2h 15m", progress: 65, bgColor: "bg-amber-500", textColor: "text-amber-500" },
        { id: "#ORD-2851", client: "João Silva", phone: "(11) 99999-1111", email: "jao.silva@email.com", address: "Rua Xuxa, 20 - Centro", payment: "Dinheiro - A Pagar", delivery: "Entrega em Domicílio", service: "Apenas Passar", status: "Passando", time: "1h 30m", progress: 85, bgColor: "bg-blue-500", textColor: "text-blue-500" },
        { id: "#ORD-2850", client: "Ana Paula", phone: "(11) 98888-2222", email: "ana.p@email.com", address: "Av. Brigadeiro, 500 - Jardins", payment: "Cartão de Débito - Pago", delivery: "Entrega em Domicílio", service: "Lavagem a Seco", status: "Finalizado", time: "3h", progress: 100, bgColor: "bg-emerald-500", textColor: "text-emerald-500" },
        { id: "#ORD-2849", client: "Roberto Dias", phone: "(11) 97777-3333", email: "roberto@email.com", address: "Rua Oscar Freire, 1200", payment: "PIX - Pago", delivery: "Retirada no Balcão", service: "Lavagem Completa", status: "Parado", time: "4h 10m", progress: 40, bgColor: "bg-rose-500", textColor: "text-rose-500" },
        { id: "#ORD-2848", client: "Pousada Sol", phone: "(11) 96666-4444", email: "contato@pousadasol.com", address: "Rua das Flores, 55 - Pinheiros", payment: "Boleto (Faturado)", delivery: "Entrega em Domicílio", service: "Enxoval (50kg)", status: "Triagem", time: "15 min", progress: 10, bgColor: "bg-brand-primary", textColor: "text-brand-muted" },
    ]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedOrders = localStorage.getItem('lavanpro_orders');
        if (savedOrders) {
            try {
                setOrders(JSON.parse(savedOrders));
            } catch (e) {
                console.error("Failed to parse orders from localStorage", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('lavanpro_orders', JSON.stringify(orders));
        }
    }, [orders, isLoaded]);

    const alerts = [
        { id: "#ORD-2849", type: "Atraso", desc: "Excedeu 4h do tempo de lavagem.", color: "text-rose-500", fullDesc: "Motorista Ricardo Camargo preso no trânsito próximo à Av. Paulista. Previsão de chegada estendida em 40 minutos." },
        { id: "#ORD-2710", type: "Ausente", desc: "Cliente ausente (3ª tentativa).", color: "text-amber-500", fullDesc: "O cliente não estava em casa na 3ª tentativa de entrega. Retornar amanhã ou entrar em contato." },
        { id: "#ORD-2855", type: "Validação", desc: "Requer validação de peça especial.", color: "text-blue-500", fullDesc: "Vestido de seda recebido com mancha de vinho não declarada. Requer contato com cliente." },
    ];

    return (
        <div className="flex h-screen bg-brand-bg text-brand-text font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">

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
                                <button onClick={() => setIsHistoryModalOpen(true)} className="px-4 py-2 bg-brand-card border border-brand-darkBorder rounded-lg text-xs font-bold text-white hover:bg-brand-darkBorder transition-all flex items-center gap-2">
                                    <History className="size-4" /> Ver Histórico
                                </button>
                                <button onClick={() => setIsNewOrderModalOpen(true)} className="px-5 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2">
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
                                    onClick={() => setActiveList(stat.label)}
                                    className="bg-brand-card p-6 rounded-2xl border border-brand-darkBorder hover:border-brand-primary/30 transition-all cursor-pointer group relative overflow-hidden"
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

                            {/* Orders In Progress Section */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="xl:col-span-2 bg-brand-card rounded-2xl border border-brand-darkBorder shadow-2xl overflow-hidden flex flex-col"
                            >
                                <div className="p-6 border-b border-brand-darkBorder flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
                                            <Activity className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Pedidos em Andamento</h3>
                                            <p className="text-xs text-brand-muted">Acompanhamento das ordens de serviço atuais</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-brand-primary hover:underline">Ver Todos</button>
                                </div>

                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="border-b border-brand-darkBorder text-xs font-bold uppercase tracking-wider text-brand-muted">
                                                <th className="p-4 pl-6 font-semibold">Pedido</th>
                                                <th className="p-4 font-semibold">Cliente</th>
                                                <th className="p-4 font-semibold">Serviço</th>
                                                <th className="p-4 font-semibold">Status</th>
                                                <th className="p-4 pr-6 text-right font-semibold">Tempo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-darkBorder">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                                    <td className="p-4 pl-6">
                                                        <span className="font-bold text-white group-hover:text-brand-primary transition-colors">{order.id}</span>
                                                    </td>
                                                    <td className="p-4 text-sm text-brand-muted font-medium">{order.client}</td>
                                                    <td className="p-4 text-sm text-brand-muted">{order.service}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative w-24 h-1.5 bg-brand-bg rounded-full overflow-hidden">
                                                                <div className={`absolute h-full rounded-full ${order.bgColor}`} style={{ width: `${order.progress}%` }} />
                                                            </div>
                                                            <span className={`text-xs font-bold ${order.textColor}`}>{order.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 pr-6 text-right font-bold text-white text-sm">{order.time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
                                            <div key={alert.id} onClick={() => setSelectedAction({ type: 'Alerta', title: alert.type, desc: alert.fullDesc, id: alert.id })} className="p-6 hover:bg-white/5 transition-all cursor-pointer group">
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
                                        <div onClick={() => setSelectedAction({ type: 'Ação', title: 'Faturamento Pendente', desc: 'Existem 8 pedidos que já foram entregues mas aguardam emissão de Nota Fiscal.', id: 'Ação-Faturamento' })} className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-4 group cursor-pointer hover:border-brand-primary transition-all">
                                            <div className="size-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                                                <CheckCircle2 className="size-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white">Faturamento Pendente</p>
                                                <p className="text-xs text-brand-muted">8 pedidos aguardando nota</p>
                                            </div>
                                            <ArrowRight className="size-4 text-brand-muted group-hover:text-white" />
                                        </div>

                                        <div onClick={() => setSelectedAction({ type: 'Ação', title: 'Liberar para Rota', desc: 'A Rota Sul já foi parcialmente carregada. Deseja liberar o motorista?', id: 'Ação-Rota' })} className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-4 group cursor-pointer hover:border-brand-primary transition-all">
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

                                {/* Reduced GPS Tracking Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-brand-card rounded-2xl border border-brand-darkBorder overflow-hidden"
                                >
                                    <div className="p-5 border-b border-brand-darkBorder flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
                                                <Navigation className="size-4" />
                                            </div>
                                            <h3 className="text-base font-bold text-white">Rotas Ativas</h3>
                                        </div>
                                        <button onClick={() => setIsMapExpanded(true)} className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider">Expandir Mapa</button>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        {routes.map((route, idx) => (
                                            <div key={route.driver} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-brand-bg border border-brand-darkBorder flex items-center justify-center text-white font-bold text-xs uppercase">
                                                            {route.driver.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{route.driver}</p>
                                                            <p className="text-[10px] text-brand-muted flex items-center gap-1">
                                                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                {route.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setIsMapExpanded(true)} className="p-1.5 text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                        <MapPin className="size-3" />
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
                                    </div>
                                </motion.div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>

            {/* Modals are rendered here conditionally using AnimatePresence for smooth transitions */}
            <AnimatePresence>
                {/* Modal: Novo Pedido */}
                {isNewOrderModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-brand-card w-full max-w-lg rounded-2xl border border-brand-darkBorder shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="size-5 text-brand-primary" /> Novo Pedido</h3>
                                <button onClick={() => setIsNewOrderModalOpen(false)} className="text-brand-muted hover:text-white transition-colors bg-brand-bg p-2 rounded-lg border border-brand-darkBorder"><X className="size-4" /></button>
                            </div>
                            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nome do Cliente</label>
                                        <input type="text" placeholder="Ex: João da Silva..." className="w-full px-4 py-3 bg-brand-bg border border-brand-darkBorder rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-white text-sm transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Telefone</label>
                                        <input type="text" placeholder="(11) 90000-0000" className="w-full px-4 py-3 bg-brand-bg border border-brand-darkBorder rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-white text-sm transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">E-mail</label>
                                        <input type="email" placeholder="cliente@email.com" className="w-full px-4 py-3 bg-brand-bg border border-brand-darkBorder rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-white text-sm transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Serviço Desejado</label>
                                        <select className="w-full px-4 py-3 bg-brand-bg border border-brand-darkBorder rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-white text-sm transition-all appearance-none cursor-pointer">
                                            <option value="" disabled selected hidden>Selecione um Serviço</option>
                                            <option>Lavagem Completa</option>
                                            <option>Apenas Passar</option>
                                            <option>Lavagem a Seco</option>
                                            <option>Lavagem de Edredom/Tapetes</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Endereço Completo</label>
                                        <input type="text" placeholder="Av. Paulista, 1000 - Centro, São Paulo - SP..." className="w-full px-4 py-3 bg-brand-bg border border-brand-darkBorder rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-white text-sm transition-all" />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Método de Entrega / Retirada</label>
                                        <select className="w-full px-4 py-3 bg-brand-bg border border-brand-darkBorder rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-white text-sm transition-all appearance-none cursor-pointer">
                                            <option>Entrega em Domicílio</option>
                                            <option>Retirada no Balcão</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button onClick={() => setIsNewOrderModalOpen(false)} className="w-full py-3.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20">Cadastrar Pedido Completo</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Modal: Histórico */}
                {isHistoryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-brand-card w-full max-w-2xl rounded-2xl border border-brand-darkBorder shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><History className="size-5 text-brand-primary" /> Histórico de Pedidos</h3>
                                <button onClick={() => setIsHistoryModalOpen(false)} className="text-brand-muted hover:text-white transition-colors bg-brand-bg p-2 rounded-lg border border-brand-darkBorder"><X className="size-4" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div key={i} className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl flex justify-between items-center hover:border-brand-primary/50 transition-colors">
                                        <div>
                                            <p className="font-bold text-white text-sm">Pedido #28{50 - i}</p>
                                            <p className="text-xs text-brand-muted mt-0.5">Concluído há {i} dias</p>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-lg border border-emerald-500/20">Finalizado</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Modal: Expandir Mapa */}
                {isMapExpanded && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-brand-card w-full max-w-6xl h-full max-h-[90vh] rounded-2xl border border-brand-darkBorder shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-brand-darkBorder flex justify-between items-center bg-brand-card/90 backdrop-blur z-10">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Navigation className="size-5 text-brand-primary" /> Tracking em Tempo Real</h3>
                                <button onClick={() => setIsMapExpanded(false)} className="text-brand-muted hover:text-white transition-colors bg-brand-bg p-2 rounded-lg border border-brand-darkBorder"><X className="size-4" /></button>
                            </div>
                            <div className="flex-1 relative bg-[url('https://lh3.googleusercontent.com/aida-public/AG-M0yG0Lp7m1_yK-W4d-qJt7Rz4f8v_tA-m3q0o5PzY=s2048')] bg-cover bg-center">
                                <div className="absolute inset-0 bg-brand-bg/60 mix-blend-overlay"></div>
                                {/* Mock Map Pins */}
                                <div className="absolute top-1/4 left-1/3 group cursor-pointer">
                                    <div className="p-3 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/50 animate-bounce relative z-10"><Truck className="size-6" /></div>
                                    <div className="absolute inset-0 bg-brand-primary rounded-full animate-ping opacity-75"></div>
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-brand-card border border-brand-darkBorder px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        <p className="text-xs font-bold text-white">Ricardo Camargo</p>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 left-1/2 group cursor-pointer">
                                    <div className="p-3 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/50 animate-bounce relative z-10"><Truck className="size-6" /></div>
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-brand-card border border-brand-darkBorder px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        <p className="text-xs font-bold text-white">André Machado</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-1/3 right-1/4 group cursor-pointer">
                                    <div className="p-3 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/50 animate-bounce relative z-10"><Truck className="size-6" /></div>
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-brand-card border border-brand-darkBorder px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        <p className="text-xs font-bold text-white">Lucas Mendes</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Modal: Lista de Pedidos (Cards clicked) */}
                {activeList && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-brand-card w-full max-w-3xl rounded-2xl border border-brand-darkBorder shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">Lista de Pedidos <span className="text-brand-primary px-2 py-0.5 bg-brand-primary/10 rounded-md text-sm">{activeList}</span></h3>
                                <button onClick={() => setActiveList(null)} className="text-brand-muted hover:text-white transition-colors bg-brand-bg p-2 rounded-lg border border-brand-darkBorder"><X className="size-4" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                                <p className="text-brand-muted text-sm mb-4 bg-brand-bg p-3 rounded-lg border border-brand-darkBorder">Exibindo os pedidos recentes para a categoria selecionada.</p>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-brand-primary hover:bg-white/5 transition-colors">
                                        <div>
                                            <p className="font-bold text-white text-base">Pedido #{Math.floor(Math.random() * 1000) + 2000}</p>
                                            <p className="text-brand-muted text-xs mt-1">Cliente: Maria Oliveira • Valor: R$ 85,90</p>
                                        </div>
                                        <button onClick={() => setActiveList(null)} className="px-4 py-2 bg-brand-card border border-brand-darkBorder text-white text-xs font-bold rounded-lg hover:border-brand-primary transition-colors hover:-translate-y-0.5 active:translate-y-0">Fechar Visualização</button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Modal: Ação / Alerta Específico */}
                {selectedAction && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-brand-card w-full max-w-md rounded-2xl border border-brand-darkBorder shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {selectedAction.type === 'Alerta' ? <AlertCircle className="size-5 text-rose-500" /> : <Activity className="size-5 text-brand-primary" />}
                                    Resolver {selectedAction.type}
                                </h3>
                                <button onClick={() => setSelectedAction(null)} className="text-brand-muted hover:text-white transition-colors bg-brand-bg p-2 rounded-lg border border-brand-darkBorder"><X className="size-4" /></button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="p-5 rounded-xl bg-brand-bg border border-brand-darkBorder shadow-inner">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 text-[10px] uppercase font-black rounded-md ${selectedAction.type === 'Alerta' ? 'bg-rose-500/10 text-rose-500' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                            {selectedAction.title}
                                        </span>
                                        <h4 className="font-bold text-white text-sm">{selectedAction.id || 'Nova Ação'}</h4>
                                    </div>
                                    <p className="text-sm text-brand-muted font-medium leading-relaxed">{selectedAction.desc}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-brand-muted flex justify-between">
                                        Ação de Tratamento
                                        <span className="text-brand-primary">Obrigatório</span>
                                    </label>
                                    <textarea rows={3} placeholder="Descreva como o problema foi solucionado..." className="w-full px-4 py-3 bg-brand-bg border border-brand-darkBorder rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-white text-sm transition-all resize-none" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setSelectedAction(null)} className="flex-1 py-3 bg-transparent border border-brand-darkBorder text-white rounded-xl font-bold hover:bg-white/5 transition-all text-sm">Cancelar / Voltar</button>
                                    <button onClick={() => setSelectedAction(null)} className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 text-sm">Marcar Resolvido</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Modal: Detalhes do Pedido */}
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-brand-card w-full max-w-2xl rounded-2xl border border-brand-darkBorder shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="size-5 text-brand-primary" /> Detalhes do Pedido <span className="text-brand-primary px-2 py-0.5 bg-brand-primary/10 rounded-md text-sm">{selectedOrder.id}</span></h3>
                                <button onClick={() => { setSelectedOrder(null); setIsStatusDropdownOpen(false); }} className="text-brand-muted hover:text-white transition-colors bg-brand-bg p-2 rounded-lg border border-brand-darkBorder"><X className="size-4" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                                {/* Info Cliente */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center justify-between">
                                        Informações do Cliente
                                        <span className="text-[10px] text-brand-primary normal-case font-bold animate-pulse">Clique nos campos para editar</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-white/5 text-white border border-white/10 rounded-lg shrink-0"><User className="size-4" /></div>
                                            <div className="w-full overflow-hidden">
                                                <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">Nome</p>
                                                <input type="text" value={selectedOrder.client} onChange={(e) => setSelectedOrder({ ...selectedOrder, client: e.target.value })} className="w-full bg-transparent outline-none text-sm font-bold text-white border-b border-transparent focus:border-brand-primary transition-colors pb-0.5" />
                                            </div>
                                        </div>
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-white/5 text-white border border-white/10 rounded-lg shrink-0"><Phone className="size-4" /></div>
                                            <div className="w-full overflow-hidden">
                                                <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">Telefone</p>
                                                <input type="text" value={selectedOrder.phone} onChange={(e) => setSelectedOrder({ ...selectedOrder, phone: e.target.value })} className="w-full bg-transparent outline-none text-sm font-bold text-white border-b border-transparent focus:border-brand-primary transition-colors pb-0.5" />
                                            </div>
                                        </div>
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-white/5 text-white border border-white/10 rounded-lg shrink-0"><Mail className="size-4" /></div>
                                            <div className="w-full overflow-hidden">
                                                <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">Email</p>
                                                <input type="email" value={selectedOrder.email} onChange={(e) => setSelectedOrder({ ...selectedOrder, email: e.target.value })} className="w-full bg-transparent outline-none text-sm font-bold text-white border-b border-transparent focus:border-brand-primary transition-colors pb-0.5 truncate" />
                                            </div>
                                        </div>
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-white/5 text-white border border-white/10 rounded-lg shrink-0"><MapPin className="size-4" /></div>
                                            <div className="w-full overflow-hidden">
                                                <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">Endereço</p>
                                                <input type="text" value={selectedOrder.address} onChange={(e) => setSelectedOrder({ ...selectedOrder, address: e.target.value })} className="w-full bg-transparent outline-none text-sm font-bold text-white border-b border-transparent focus:border-brand-primary transition-colors pb-0.5 truncate" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detalhes Serviço */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">Detalhes do Serviço</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-white/5 text-white border border-white/10 rounded-lg shrink-0"><CheckCircle2 className="size-4" /></div>
                                            <div className="w-full overflow-hidden">
                                                <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">Serviço Contratado</p>
                                                <select value={selectedOrder.service} onChange={(e) => setSelectedOrder({ ...selectedOrder, service: e.target.value })} className="w-full bg-transparent outline-none text-sm font-bold text-white border-b border-transparent focus:border-brand-primary transition-colors pb-0.5 cursor-pointer appearance-none">
                                                    <option value="Lavagem Completa" className="text-black">Lavagem Completa</option>
                                                    <option value="Apenas Passar" className="text-black">Apenas Passar</option>
                                                    <option value="Lavagem a Seco" className="text-black">Lavagem a Seco</option>
                                                    <option value="Edredom" className="text-black">Edredom</option>
                                                    <option value="Enxoval (50kg)" className="text-black">Enxoval (50kg)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-white/5 text-white border border-white/10 rounded-lg shrink-0"><CreditCard className="size-4" /></div>
                                            <div className="w-full overflow-hidden">
                                                <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">Pagamento</p>
                                                <input type="text" value={selectedOrder.payment} onChange={(e) => setSelectedOrder({ ...selectedOrder, payment: e.target.value })} className="w-full bg-transparent outline-none text-sm font-bold text-white border-b border-transparent focus:border-brand-primary transition-colors pb-0.5 truncate" />
                                            </div>
                                        </div>
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-white/5 text-white border border-white/10 rounded-lg shrink-0"><Home className="size-4" /></div>
                                            <div className="w-full overflow-hidden">
                                                <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">Método de Entrega</p>
                                                <select value={selectedOrder.delivery} onChange={(e) => setSelectedOrder({ ...selectedOrder, delivery: e.target.value })} className="w-full bg-transparent outline-none text-sm font-bold text-white border-b border-transparent focus:border-brand-primary transition-colors pb-0.5 cursor-pointer appearance-none">
                                                    <option value="Entrega em Domicílio" className="text-black">Entrega em Domicílio</option>
                                                    <option value="Retirada no Balcão" className="text-black">Retirada no Balcão</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-white/5 text-white border border-white/10 rounded-lg shrink-0"><Clock className="size-4" /></div>
                                            <div className="w-full overflow-hidden">
                                                <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">Tempo Decorrido</p>
                                                <input type="text" value={selectedOrder.time} onChange={(e) => setSelectedOrder({ ...selectedOrder, time: e.target.value })} className="w-full bg-transparent outline-none text-sm font-bold text-white border-b border-transparent focus:border-brand-primary transition-colors pb-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Editable */}
                                <div className="p-5 border border-brand-darkBorder rounded-xl bg-gradient-to-br from-brand-bg to-brand-card">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-white">Status Operacional</h4>
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white outline-none cursor-pointer transition-all shadow-md border ${selectedOrder.status === 'Parado' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'} hover:bg-white/5`}
                                            >
                                                <span className="relative flex h-2 w-2">
                                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedOrder.status === 'Parado' ? 'bg-rose-500' : 'bg-brand-primary'}`}></span>
                                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedOrder.status === 'Parado' ? 'bg-rose-500' : 'bg-brand-primary'}`}></span>
                                                </span>
                                                {selectedOrder.status}
                                                <ChevronDown className={`size-3 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isStatusDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute right-0 top-full mt-2 w-40 bg-[#161328] border border-brand-darkBorder rounded-xl shadow-2xl overflow-hidden z-[60]"
                                                    >
                                                        {['Triagem', 'Lavando', 'Secando', 'Passando', 'Finalizado', 'Parado'].map((statusOption) => (
                                                            <button
                                                                key={statusOption}
                                                                className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-white/5 ${selectedOrder.status === statusOption ? 'text-brand-primary bg-brand-primary/5' : 'text-brand-muted hover:text-white'}`}
                                                                onClick={() => {
                                                                    let progress = selectedOrder.progress;
                                                                    let bgColor = selectedOrder.bgColor;
                                                                    let textColor = selectedOrder.textColor;

                                                                    switch (statusOption) {
                                                                        case 'Triagem': progress = 10; bgColor = 'bg-brand-primary'; textColor = 'text-brand-muted'; break;
                                                                        case 'Lavando': progress = 30; bgColor = 'bg-brand-primary'; textColor = 'text-brand-muted'; break;
                                                                        case 'Secando': progress = 65; bgColor = 'bg-amber-500'; textColor = 'text-amber-500'; break;
                                                                        case 'Passando': progress = 85; bgColor = 'bg-blue-500'; textColor = 'text-blue-500'; break;
                                                                        case 'Finalizado': progress = 100; bgColor = 'bg-emerald-500'; textColor = 'text-emerald-500'; break;
                                                                        case 'Parado': progress = selectedOrder.progress; bgColor = 'bg-rose-500'; textColor = 'text-rose-500'; break;
                                                                    }

                                                                    setSelectedOrder({ ...selectedOrder, status: statusOption, progress, bgColor, textColor });
                                                                    setIsStatusDropdownOpen(false);
                                                                }}
                                                            >
                                                                {statusOption}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <div className="relative h-2 w-full bg-brand-bg rounded-full overflow-hidden mb-2 border border-brand-darkBorder">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${selectedOrder.progress}%` }}
                                            transition={{ duration: 1 }}
                                            className={`absolute h-full rounded-full ${selectedOrder.bgColor || 'bg-brand-primary'}`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-brand-muted uppercase mt-2">
                                        <span>Triagem</span>
                                        <span>Lavagem</span>
                                        <span>Secagem</span>
                                        <span>Passar</span>
                                        <span>Pronto</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={() => {
                                            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? selectedOrder : o));
                                            setSelectedOrder(null);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className="w-full py-3.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="size-4" /> Salvar Alterações do Pedido
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
