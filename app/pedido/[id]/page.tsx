"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
    Package, User, Clock, CheckCircle2, 
    AlertCircle, Truck, MapPin, Phone, 
    History, Receipt, ChevronLeft 
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface OrderItem {
    service: string;
    qty: number;
    unitPrice: number;
}

interface HistoryEntry {
    time: string;
    status: string;
    note: string;
}

interface Order {
    id: string;
    client: string;
    phone: string;
    email: string;
    address: string;
    status: string;
    progress: number;
    items: OrderItem[];
    createdAt: string;
    estimatedDelivery: string;
    history: HistoryEntry[];
    paymentStatus: string;
    delivery: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
    "Recebido": { color: "text-slate-400", bg: "bg-slate-400", icon: Package },
    "Em Triagem": { color: "text-violet-400", bg: "bg-violet-500", icon: Clock },
    "Em Lavagem": { color: "text-brand-primary", bg: "bg-brand-primary", icon: ActivityIcon },
    "Em Secagem": { color: "text-amber-500", bg: "bg-amber-500", icon: Clock },
    "Em Finalização": { color: "text-blue-400", bg: "bg-blue-400", icon: CheckCircle2 },
    "Pronto": { color: "text-teal-400", bg: "bg-teal-400", icon: CheckCircle2 },
    "Entregue": { color: "text-emerald-500", bg: "bg-emerald-500", icon: Truck },
    "Cancelado": { color: "text-rose-500", bg: "bg-rose-500", icon: AlertCircle },
};

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}

export default function OrderTrackingPage() {
    const params = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            const orderId = params.id as string;
            const cleanId = orderId.replace("#", "").trim();
            
            try {
                // Puxa diretamente do Supabase via RPC para garantir dados reais
                const { data, error } = await supabase.rpc('get_laundry_data');
                
                if (!error && data) {
                    const allOrders: Order[] = data.orders || [];
                    const found = allOrders.find(o => 
                        o.id === orderId || 
                        o.id === `#${orderId}` || 
                        o.id.replace("#", "") === cleanId
                    );
                    
                    if (found) {
                        setOrder(found);
                    }
                }
            } catch (e) {
                console.error("Erro ao buscar pedido no Supabase:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center">
                <div className="size-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
                <div className="size-20 bg-brand-card rounded-3xl border border-brand-darkBorder flex items-center justify-center mb-6">
                    <Package className="size-10 text-brand-muted opacity-50" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Pedido não encontrado</h1>
                <p className="text-brand-muted max-w-xs mb-8">Não conseguimos localizar as informações para o código informado.</p>
                <Link href="/" className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold hover:opacity-90 transition-all">
                    Voltar ao Início
                </Link>
            </div>
        );
    }

    const currentStatus = STATUS_CONFIG[order.status] || STATUS_CONFIG["Recebido"];
    const totalItems = order.items.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = order.items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);

    return (
        <div className="min-h-screen bg-brand-bg font-sans text-brand-text flex flex-col items-center py-8 px-4">
            <div className="w-full max-w-md space-y-6">
                
                {/* Header Tracking */}
                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="p-2 bg-brand-card border border-brand-darkBorder rounded-xl hover:border-brand-primary transition-all">
                        <ChevronLeft className="size-4" />
                    </Link>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Acompanhamento Online</p>
                        <h1 className="text-lg font-black text-white">{order.id}</h1>
                    </div>
                    <div className="size-8" /> {/* Spacer */}
                </div>

                {/* Status Hero */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-card border border-brand-darkBorder rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-bg">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${order.progress}%` }}
                            className={`h-full ${currentStatus.bg}`}
                        />
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className={`size-20 rounded-3xl ${currentStatus.bg}/20 flex items-center justify-center border border-${currentStatus.bg}/30 relative`}>
                            <currentStatus.icon className={`size-10 ${currentStatus.color}`} />
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={`absolute -top-1 -right-1 size-4 rounded-full ${currentStatus.bg} border-2 border-brand-card`}
                            />
                        </div>
                    </div>

                    <h2 className={`text-2xl font-black ${currentStatus.color} tracking-tight mb-2`}>{order.status}</h2>
                    <p className="text-brand-muted text-sm font-medium">Seu pedido está sendo processado com cuidado.</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-8 border-t border-brand-darkBorder pt-6">
                        <div className="text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">Entrada</p>
                            <p className="text-xs font-bold text-white">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">Previsão</p>
                            <p className="text-xs font-bold text-emerald-400">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('pt-BR') : 'A definir'}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Customer Info */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-brand-card border border-brand-darkBorder rounded-3xl p-6 space-y-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                            <User className="size-6 text-brand-primary" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted">Cliente</p>
                            <h3 className="text-base font-bold text-white">{order.client}</h3>
                        </div>
                    </div>
                    {order.address && (
                        <div className="flex items-start gap-4 pt-2 border-t border-brand-darkBorder">
                            <MapPin className="size-4 text-brand-muted mt-1" />
                            <p className="text-xs text-brand-muted leading-relaxed">{order.address}</p>
                        </div>
                    )}
                </motion.div>

                {/* Summary Items */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-brand-card border border-brand-darkBorder rounded-3xl overflow-hidden"
                >
                    <div className="p-6 border-b border-brand-darkBorder flex justify-between items-center">
                        <h3 className="font-bold text-sm text-brand-text flex items-center gap-2">
                            <Receipt className="size-4 text-brand-primary" /> Detalhes do Pedido
                        </h3>
                        <span className="text-[10px] font-black bg-brand-bg px-2 py-1 rounded-lg text-brand-muted">{totalItems} Peças</span>
                    </div>
                    <div className="p-6 space-y-4">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 bg-brand-bg rounded-lg flex items-center justify-center text-[10px] font-black text-brand-primary border border-brand-darkBorder">
                                        {item.qty}
                                    </div>
                                    <p className="text-sm font-bold text-white transition-colors">{item.service}</p>
                                </div>
                                <p className="text-xs font-semibold text-brand-muted">
                                    {(item.qty * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                        ))}
                        
                        <div className="pt-4 border-t border-brand-darkBorder flex justify-between items-center">
                            <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Total Estimado</p>
                            <p className="text-lg font-black text-brand-primary">
                                {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>

                        <div className={`mt-4 p-3 rounded-2xl text-[10px] font-bold text-center border ${
                            order.paymentStatus.includes("Pago") 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                            {order.paymentStatus}
                        </div>
                    </div>
                </motion.div>

                {/* Timeline / History */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-brand-card border border-brand-darkBorder rounded-3xl p-6"
                >
                    <h3 className="font-bold text-sm text-brand-text flex items-center gap-2 mb-6">
                        <History className="size-4 text-brand-primary" /> Linha do Tempo
                    </h3>
                    <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-brand-darkBorder">
                        {order.history.map((h, i) => (
                            <div key={i} className="relative pl-8">
                                <div className={`absolute left-0 top-1.5 size-4 rounded-full border-4 border-brand-card ${
                                    i === order.history.length - 1 ? currentStatus.bg : 'bg-brand-darkBorder'
                                }`} />
                                <div className="flex justify-between items-start mb-1">
                                    <p className={`text-xs font-bold ${i === order.history.length - 1 ? 'text-white' : 'text-brand-muted'}`}>
                                        {h.status}
                                    </p>
                                    <span className="text-[10px] font-medium text-brand-muted">{h.time}</span>
                                </div>
                                {h.note && <p className="text-[10px] text-brand-muted italic">{h.note}</p>}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="text-[10px] text-center text-brand-muted py-4">
                    © 2026 LavanPro - Sistema de Gestão de Lavanderias
                </p>
            </div>
        </div>
    );
}
