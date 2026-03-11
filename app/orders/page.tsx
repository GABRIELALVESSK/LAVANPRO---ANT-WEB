"use client";

import { Sidebar } from "@/components/sidebar";
import { AccessGuard } from "@/components/access-guard";
import {
    Truck, CheckCircle2, AlertCircle, Clock, Activity, History, Timer,
    X, User, Phone, Mail, CreditCard, Home, ChevronDown, Search,
    Plus, Trash2, Printer, QrCode, Filter, ArrowRight, Package,
    CalendarDays, StickyNote, MapPin, ChevronRight, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const SERVICES = [
    { name: "Lavagem Completa", price: 45 },
    { name: "Apenas Passar", price: 25 },
    { name: "Lavagem a Seco", price: 80 },
    { name: "Edredom / Cobertor", price: 60 },
    { name: "Enxoval (kg)", price: 12 },
    { name: "Tapete Pequeno", price: 35 },
    { name: "Tapete Grande", price: 75 },
    { name: "Terno / Blazer", price: 90 },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; progress: number; textColor: string }> = {
    "Recebido": { color: "text-slate-400", bg: "bg-slate-400", progress: 5, textColor: "text-slate-400" },
    "Em Triagem": { color: "text-violet-400", bg: "bg-violet-500", progress: 16, textColor: "text-violet-400" },
    "Em Lavagem": { color: "text-brand-primary", bg: "bg-brand-primary", progress: 32, textColor: "text-brand-primary" },
    "Em Secagem": { color: "text-amber-500", bg: "bg-amber-500", progress: 50, textColor: "text-amber-500" },
    "Em Finalização": { color: "text-blue-400", bg: "bg-blue-400", progress: 72, textColor: "text-blue-400" },
    "Pronto": { color: "text-teal-400", bg: "bg-teal-400", progress: 90, textColor: "text-teal-400" },
    "Entregue": { color: "text-emerald-500", bg: "bg-emerald-500", progress: 100, textColor: "text-emerald-500" },
    "Cancelado": { color: "text-rose-500", bg: "bg-rose-500", progress: 0, textColor: "text-rose-500" },
};

const PAYMENT_STATUSES = ["A Pagar", "Pago - PIX", "Pago - Cartão", "Pago - Dinheiro", "Faturado"];

interface OrderItem { service: string; qty: number; unitPrice: number; }
interface HistoryEntry { time: string; status: string; note: string; }
interface Order {
    id: string; client: string; phone: string; email: string; address: string;
    paymentMethod: string; paymentStatus: string; delivery: string;
    items: OrderItem[]; status: string; progress: number; bgColor: string;
    textColor: string; observations: string; estimatedDelivery: string;
    history: HistoryEntry[]; createdAt: string;
}

const seedOrders: Order[] = [
    { id: "#ORD-2856", client: "Carlos Machado", phone: "(11) 98765-4321", email: "carlos.machado@email.com", address: "Rua Augusta, 1500 - Consolação", paymentMethod: "Cartão de Crédito", paymentStatus: "Pago - Cartão", delivery: "Entrega em Domicílio", items: [{ service: "Lavagem Completa", qty: 3, unitPrice: 45 }], status: "Em Lavagem", progress: 32, bgColor: "bg-brand-primary", textColor: "text-brand-primary", observations: "Cliente pediu amaciante extra.", estimatedDelivery: "2026-03-09", history: [{ time: "08:00", status: "Recebido", note: "Pedido registrado." }, { time: "08:30", status: "Em Triagem", note: "Triagem concluída." }, { time: "09:15", status: "Em Lavagem", note: "Iniciado processo de lavagem." }], createdAt: "2026-03-08" },
    { id: "#ORD-2854", client: "Maria Oliveira", phone: "(11) 91234-5678", email: "maria.oli@email.com", address: "Av. Paulista, 1000 - Bela Vista", paymentMethod: "PIX", paymentStatus: "Pago - PIX", delivery: "Retirada no Balcão", items: [{ service: "Edredom / Cobertor", qty: 2, unitPrice: 60 }], status: "Em Secagem", progress: 50, bgColor: "bg-amber-500", textColor: "text-amber-500", observations: "", estimatedDelivery: "2026-03-08", history: [{ time: "07:00", status: "Recebido", note: "" }, { time: "08:00", status: "Em Lavagem", note: "" }, { time: "11:00", status: "Em Secagem", note: "Passou para secagem." }], createdAt: "2026-03-08" },
    { id: "#ORD-2851", client: "João Silva", phone: "(11) 99999-1111", email: "jao.silva@email.com", address: "Rua Xuxa, 20 - Centro", paymentMethod: "Dinheiro", paymentStatus: "A Pagar", delivery: "Entrega em Domicílio", items: [{ service: "Apenas Passar", qty: 5, unitPrice: 25 }], status: "Em Finalização", progress: 72, bgColor: "bg-blue-400", textColor: "text-blue-400", observations: "Não usar alta temperatura.", estimatedDelivery: "2026-03-08", history: [{ time: "06:00", status: "Recebido", note: "" }, { time: "07:30", status: "Em Lavagem", note: "" }, { time: "10:00", status: "Em Secagem", note: "" }, { time: "12:00", status: "Em Finalização", note: "" }], createdAt: "2026-03-07" },
    { id: "#ORD-2850", client: "Ana Paula", phone: "(11) 98888-2222", email: "ana.p@email.com", address: "Av. Brigadeiro, 500 - Jardins", paymentMethod: "Cartão de Débito", paymentStatus: "Pago - Cartão", delivery: "Entrega em Domicílio", items: [{ service: "Lavagem a Seco", qty: 1, unitPrice: 80 }, { service: "Terno / Blazer", qty: 2, unitPrice: 90 }], status: "Entregue", progress: 100, bgColor: "bg-emerald-500", textColor: "text-emerald-500", observations: "", estimatedDelivery: "2026-03-08", history: [{ time: "09:00", status: "Recebido", note: "" }, { time: "10:00", status: "Em Lavagem", note: "" }, { time: "13:00", status: "Pronto", note: "Pedido separado." }, { time: "15:00", status: "Entregue", note: "Confirmado pelo cliente." }], createdAt: "2026-03-07" },
    { id: "#ORD-2849", client: "Hotel Bela Vista", phone: "(11) 97777-3333", email: "contato@hotelbelavista.com", address: "Rua Oscar Freire, 1200", paymentMethod: "Boleto", paymentStatus: "Faturado", delivery: "Entrega em Domicílio", items: [{ service: "Enxoval (kg)", qty: 50, unitPrice: 12 }], status: "Cancelado", progress: 0, bgColor: "bg-rose-500", textColor: "text-rose-500", observations: "URGENTE: Pedido cancelado pelo cliente.", estimatedDelivery: "2026-03-10", history: [{ time: "14:00", status: "Recebido", note: "" }, { time: "15:30", status: "Cancelado", note: "Cliente solicitou cancelamento." }], createdAt: "2026-03-08" },
];

function calcTotal(items: OrderItem[]) { return items.reduce((s, i) => s + i.qty * i.unitPrice, 0); }
function formatCurrency(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>(seedOrders);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isStatusDropdown, setIsStatusDropdown] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("Todos");
    const [filterPayment, setFilterPayment] = useState("Todos");

    // New order form
    const blankItem: OrderItem = { service: SERVICES[0].name, qty: 1, unitPrice: SERVICES[0].price };
    const [newOrder, setNewOrder] = useState({
        client: "", phone: "", email: "", address: "",
        delivery: "Entrega em Domicílio",
        paymentMethod: "PIX",
        paymentStatus: "A Pagar",
        estimatedDelivery: "",
        observations: "",
        items: [{ ...blankItem }],
    });

    useEffect(() => {
        const saved = localStorage.getItem("lavanpro_orders_v3");
        if (saved) { try { setOrders(JSON.parse(saved)); } catch { } }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) localStorage.setItem("lavanpro_orders_v3", JSON.stringify(orders));
    }, [orders, isLoaded]);

    const filteredOrders = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return orders.filter(o => {
            const matchSearch = !q || o.client.toLowerCase().includes(q) || o.phone.includes(q) || o.id.toLowerCase().includes(q);
            const matchStatus = filterStatus === "Todos" || o.status === filterStatus;
            const matchPayment = filterPayment === "Todos" || o.paymentStatus === filterPayment;
            return matchSearch && matchStatus && matchPayment;
        });
    }, [orders, searchQuery, filterStatus, filterPayment]);

    const stats = [
        { label: "Em Andamento", value: orders.filter(o => !["Entregue", "Cancelado"].includes(o.status)).length, icon: Activity, color: "text-brand-primary", bg: "bg-brand-primary/10" },
        { label: "Entregues", value: orders.filter(o => o.status === "Entregue").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "A Receber", value: formatCurrency(orders.filter(o => o.paymentStatus === "A Pagar").reduce((s, o) => s + calcTotal(o.items), 0)), icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10", wide: true },
        { label: "Cancelados", value: orders.filter(o => o.status === "Cancelado").length, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
    ];

    const handleAddItem = () => setNewOrder(n => ({ ...n, items: [...n.items, { ...blankItem }] }));
    const handleRemoveItem = (idx: number) => setNewOrder(n => ({ ...n, items: n.items.filter((_, i) => i !== idx) }));
    const handleItemChange = (idx: number, field: keyof OrderItem, value: string | number) => {
        setNewOrder(n => {
            const items = [...n.items];
            if (field === "service") {
                const svc = SERVICES.find(s => s.name === value);
                items[idx] = { ...items[idx], service: value as string, unitPrice: svc?.price ?? items[idx].unitPrice };
            } else {
                items[idx] = { ...items[idx], [field]: Number(value) };
            }
            return { ...n, items };
        });
    };

    const handleCreateOrder = () => {
        if (!newOrder.client || newOrder.items.length === 0) return;
        const idNum = Math.floor(Math.random() * 9000) + 1000;
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5);
        const freshOrder: Order = {
            id: `#ORD-${idNum}`,
            client: newOrder.client, phone: newOrder.phone, email: newOrder.email,
            address: newOrder.address, delivery: newOrder.delivery,
            paymentMethod: newOrder.paymentMethod, paymentStatus: newOrder.paymentStatus,
            items: newOrder.items, status: "Triagem", progress: 10,
            bgColor: "bg-brand-primary", textColor: "text-brand-primary",
            observations: newOrder.observations,
            estimatedDelivery: newOrder.estimatedDelivery,
            history: [{ time: timeStr, status: "Triagem", note: "Pedido criado." }],
            createdAt: now.toISOString().slice(0, 10),
        };
        setOrders(prev => [freshOrder, ...prev]);
        setIsNewOrderOpen(false);
        setNewOrder({ client: "", phone: "", email: "", address: "", delivery: "Entrega em Domicílio", paymentMethod: "PIX", paymentStatus: "A Pagar", estimatedDelivery: "", observations: "", items: [{ ...blankItem }] });
    };

    const handleStatusChange = (statusOption: string) => {
        if (!selectedOrder) return;

        const cfg = STATUS_CONFIG[statusOption];
        const now = new Date().toTimeString().slice(0, 5);
        const updated: Order = {
            ...selectedOrder,
            status: statusOption,
            progress: cfg?.progress ?? selectedOrder.progress,
            bgColor: cfg?.bg ?? selectedOrder.bgColor,
            textColor: cfg?.textColor ?? selectedOrder.textColor,
            history: [...selectedOrder.history, { time: now, status: statusOption, note: "" }],
        };
        setSelectedOrder(updated);
        setIsStatusDropdown(false);
    };

    const handleSaveOrder = () => {
        if (!selectedOrder) return;

        // Verifica se o pedido foi salvo como Entregue e se tem QR Code vinculado
        if (selectedOrder.status === "Entregue") {
            try {
                const savedLabels = localStorage.getItem("lavanpro_labels");
                if (savedLabels) {
                    const labels = JSON.parse(savedLabels);
                    // Garante a extração correta do ID removendo `#` e espaços
                    const cleanId = String(selectedOrder.id).replace("#", "").trim();
                    const linkedLabel = labels.find((l: any) => String(l.currentOrderId).trim() === cleanId);

                    if (linkedLabel) {
                        const confirmRelease = window.confirm(`O pedido ${selectedOrder.id} está vinculado à etiqueta ${linkedLabel.code}. Deseja desvincular e liberar a etiqueta agora?`);
                        if (confirmRelease) {
                            const updatedLabels = labels.map((l: any) =>
                                l.id === linkedLabel.id ? { ...l, status: "available", currentOrderId: null } : l
                            );
                            localStorage.setItem("lavanpro_labels", JSON.stringify(updatedLabels));

                            // Também atualiza histórico se existir
                            const savedHistory = localStorage.getItem("lavanpro_label_history");
                            if (savedHistory) {
                                const history = JSON.parse(savedHistory);
                                const updatedHistory = history.map((h: any) =>
                                    (h.labelId === linkedLabel.id && h.orderId === cleanId && !h.releasedAt)
                                        ? { ...h, releasedAt: new Date().toISOString() }
                                        : h
                                );
                                localStorage.setItem("lavanpro_label_history", JSON.stringify(updatedHistory));
                            }

                            // Dispara evento de storage para a página de Etiquetas atualizar
                            window.dispatchEvent(new Event("storage"));
                        }
                    }
                }
            } catch (e) {
                console.error("Erro ao processar desvínculo de QR Code:", e);
            }
        }

        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? selectedOrder : o));
        setSelectedOrder(null);
        setIsStatusDropdown(false);
    };

    return (
        <AccessGuard permission="orders">
            <div className="flex h-screen bg-brand-bg text-brand-text font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <div className="max-w-[1600px] mx-auto space-y-6">

                            {/* Header */}
                            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h1 className="text-3xl font-black text-brand-text tracking-tight">Gestão de Pedidos</h1>
                                    <p className="text-brand-muted text-sm font-medium flex items-center gap-2 mt-1">
                                        <Activity className="size-4 animate-pulse text-emerald-500" />
                                        Fluxo completo de ordens de serviço
                                    </p>
                                </motion.div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsHistoryOpen(true)} className="px-4 py-2 bg-brand-card border border-brand-darkBorder rounded-lg text-xs font-bold text-brand-text hover:bg-brand-darkBorder transition-all flex items-center gap-2">
                                        <History className="size-4" /> Histórico
                                    </button>
                                    <button onClick={() => setIsNewOrderOpen(true)} className="px-5 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2">
                                        <Plus className="size-4" /> Novo Pedido
                                    </button>
                                </div>
                            </header>

                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {stats.map((stat, idx) => (
                                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                                        className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                        <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl shrink-0`}><stat.icon className="size-5" /></div>
                                        <div>
                                            <p className="text-2xl font-black text-brand-text">{stat.value}</p>
                                            <p className="text-xs text-brand-muted font-semibold uppercase tracking-wide">{stat.label}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Search & Filters */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="bg-brand-card border border-brand-darkBorder rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por código, cliente ou telefone..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand-muted pointer-events-none" />
                                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                            className="pl-9 pr-8 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                            <option>Todos</option>
                                            {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand-muted pointer-events-none" />
                                        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
                                            className="pl-9 pr-8 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                            <option>Todos</option>
                                            {PAYMENT_STATUSES.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <span className="text-xs text-brand-muted font-semibold self-center whitespace-nowrap">
                                    {filteredOrders.length} pedido(s)
                                </span>
                            </motion.div>

                            {/* Orders Table */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                className="bg-brand-card rounded-2xl border border-brand-darkBorder shadow-xl overflow-hidden">
                                <div className="p-5 border-b border-brand-darkBorder flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg"><Package className="size-5" /></div>
                                        <div>
                                            <h3 className="text-base font-bold text-brand-text">Ordens de Serviço</h3>
                                            <p className="text-xs text-brand-muted">Clique em um pedido para ver detalhes completos</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[780px]">
                                        <thead>
                                            <tr className="border-b border-brand-darkBorder text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                                                <th className="p-4 pl-6">Pedido</th>
                                                <th className="p-4">Cliente</th>
                                                <th className="p-4">Itens</th>
                                                <th className="p-4">Total</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">Pagamento</th>
                                                <th className="p-4 pr-6">Entrega Prev.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-darkBorder">
                                            {filteredOrders.length === 0 && (
                                                <tr><td colSpan={7} className="text-center py-12 text-brand-muted text-sm">Nenhum pedido encontrado.</td></tr>
                                            )}
                                            {filteredOrders.map((order) => {
                                                const cfg = STATUS_CONFIG[order.status];
                                                return (
                                                    <tr key={order.id} onClick={() => setSelectedOrder(order)}
                                                        className="hover:bg-white/5 transition-colors cursor-pointer group">
                                                        <td className="p-4 pl-6">
                                                            <span className="font-bold text-brand-text group-hover:text-brand-primary transition-colors">{order.id}</span>
                                                            <p className="text-[10px] text-brand-muted mt-0.5">{order.createdAt}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="text-sm font-semibold text-brand-text">{order.client}</p>
                                                            <p className="text-[11px] text-brand-muted">{order.phone}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="text-sm text-brand-muted">{order.items.map(i => `${i.qty}x ${i.service}`).join(", ").slice(0, 32)}{order.items.map(i => `${i.qty}x ${i.service}`).join("").length > 32 ? "…" : ""}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-sm font-bold text-brand-text">{formatCurrency(calcTotal(order.items))}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="relative w-20 h-1.5 bg-brand-bg rounded-full overflow-hidden">
                                                                    <div className={`absolute h-full rounded-full ${order.bgColor}`} style={{ width: `${order.progress}%` }} />
                                                                </div>
                                                                <span className={`text-xs font-bold ${order.textColor}`}>{order.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${order.paymentStatus === "A Pagar" ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                                : order.paymentStatus === "Faturado" ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                }`}>{order.paymentStatus}</span>
                                                        </td>
                                                        <td className="p-4 pr-6 text-sm text-brand-muted font-semibold">
                                                            {order.estimatedDelivery || "—"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>

                        </div>
                    </main>
                </div>

                <AnimatePresence>

                    {/* --- MODAL: Novo Pedido --- */}
                    {isNewOrderOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-brand-card w-full max-w-2xl rounded-2xl border border-brand-darkBorder shadow-2xl flex flex-col max-h-[90vh]">
                                <div className="p-5 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                                    <h3 className="text-lg font-bold text-brand-text flex items-center gap-2"><Plus className="size-5 text-brand-primary" /> Novo Pedido</h3>
                                    <button onClick={() => setIsNewOrderOpen(false)} className="text-brand-muted hover:text-brand-text bg-brand-bg p-2 rounded-lg border border-brand-darkBorder"><X className="size-4" /></button>
                                </div>
                                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">

                                    {/* Client Info */}
                                    <section>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2"><User className="size-3.5" /> Dados do Cliente</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                { label: "Nome do Cliente", field: "client", type: "text", placeholder: "João da Silva" },
                                                { label: "Telefone", field: "phone", type: "text", placeholder: "(11) 9 0000-0000" },
                                                { label: "E-mail", field: "email", type: "email", placeholder: "cliente@email.com" },
                                            ].map(({ label, field, type, placeholder }) => (
                                                <div key={field} className="space-y-1.5">
                                                    <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">{label}</label>
                                                    <input type={type} placeholder={placeholder} value={(newOrder as any)[field]}
                                                        onChange={e => setNewOrder(n => ({ ...n, [field]: e.target.value }))}
                                                        className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                                                </div>
                                            ))}
                                            <div className="space-y-1.5 sm:col-span-2">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Endereço</label>
                                                <input type="text" placeholder="Av. Paulista, 1000 - Centro" value={newOrder.address}
                                                    onChange={e => setNewOrder(n => ({ ...n, address: e.target.value }))}
                                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Items */}
                                    <section>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2"><Package className="size-3.5" /> Itens do Pedido</h4>
                                        <div className="space-y-2">
                                            {newOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-2 items-center bg-brand-bg border border-brand-darkBorder rounded-xl p-3">
                                                    <select value={item.service} onChange={e => handleItemChange(idx, "service", e.target.value)}
                                                        className="flex-1 bg-transparent text-sm font-semibold text-brand-text outline-none appearance-none cursor-pointer">
                                                        {SERVICES.map(s => <option key={s.name} value={s.name} className="bg-brand-card">{s.name}</option>)}
                                                    </select>
                                                    <input type="number" min={1} value={item.qty} onChange={e => handleItemChange(idx, "qty", e.target.value)}
                                                        className="w-14 text-center bg-brand-card border border-brand-darkBorder rounded-lg text-sm font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary py-1" />
                                                    <span className="text-xs font-bold text-emerald-500 w-20 text-right">{formatCurrency(item.qty * item.unitPrice)}</span>
                                                    {newOrder.items.length > 1 && (
                                                        <button onClick={() => handleRemoveItem(idx)} className="text-rose-500 hover:text-rose-400 p-1"><Trash2 className="size-4" /></button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={handleAddItem} className="mt-2 w-full py-2 border border-dashed border-brand-darkBorder rounded-xl text-xs font-bold text-brand-muted hover:text-brand-primary hover:border-brand-primary transition-all flex items-center justify-center gap-2">
                                            <Plus className="size-3.5" /> Adicionar Item
                                        </button>
                                        <div className="mt-3 flex justify-end">
                                            <span className="text-sm font-black text-brand-text">Total: <span className="text-brand-primary">{formatCurrency(calcTotal(newOrder.items))}</span></span>
                                        </div>
                                    </section>

                                    {/* Logistics & Payment */}
                                    <section>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2"><Truck className="size-3.5" /> Logística e Pagamento</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Método de Entrega</label>
                                                <select value={newOrder.delivery} onChange={e => setNewOrder(n => ({ ...n, delivery: e.target.value }))}
                                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                                    <option>Entrega em Domicílio</option>
                                                    <option>Retirada no Balcão</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Forma de Pagamento</label>
                                                <select value={newOrder.paymentMethod} onChange={e => setNewOrder(n => ({ ...n, paymentMethod: e.target.value }))}
                                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                                    <option>PIX</option><option>Cartão de Crédito</option><option>Cartão de Débito</option><option>Dinheiro</option><option>Boleto</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Status do Pagamento</label>
                                                <select value={newOrder.paymentStatus} onChange={e => setNewOrder(n => ({ ...n, paymentStatus: e.target.value }))}
                                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                                    {PAYMENT_STATUSES.map(p => <option key={p}>{p}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Previsão de Entrega</label>
                                                <input type="date" value={newOrder.estimatedDelivery} onChange={e => setNewOrder(n => ({ ...n, estimatedDelivery: e.target.value }))}
                                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Observations */}
                                    <section>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2"><StickyNote className="size-3.5" /> Observações Internas</h4>
                                        <textarea rows={3} placeholder="Anotações internas, instruções especiais, alertas..." value={newOrder.observations}
                                            onChange={e => setNewOrder(n => ({ ...n, observations: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none" />
                                    </section>
                                </div>
                                <div className="p-5 border-t border-brand-darkBorder">
                                    <button onClick={handleCreateOrder} disabled={!newOrder.client || newOrder.items.length === 0}
                                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        <CheckCircle2 className="size-4" /> Registrar Pedido
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* --- MODAL: Histórico --- */}
                    {isHistoryOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-brand-card w-full max-w-2xl rounded-2xl border border-brand-darkBorder shadow-2xl flex flex-col max-h-[85vh]">
                                <div className="p-5 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                                    <h3 className="text-lg font-bold text-brand-text flex items-center gap-2"><History className="size-5 text-brand-primary" /> Histórico de Pedidos</h3>
                                    <button onClick={() => setIsHistoryOpen(false)} className="text-brand-muted hover:text-brand-text bg-brand-bg p-2 rounded-lg border border-brand-darkBorder"><X className="size-4" /></button>
                                </div>
                                <div className="p-5 overflow-y-auto custom-scrollbar space-y-2 flex-1">
                                    {orders.filter(o => ["Entregue", "Cancelado"].includes(o.status)).map(o => (
                                        <div key={o.id} className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-primary/50 transition-colors cursor-pointer" onClick={() => { setSelectedOrder(o); setIsHistoryOpen(false); }}>
                                            <div>
                                                <p className="font-bold text-brand-text text-sm">{o.id} — {o.client}</p>
                                                <p className="text-xs text-brand-muted mt-0.5">{o.items.map(i => `${i.qty}x ${i.service}`).join(", ")} • {formatCurrency(calcTotal(o.items))}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-[11px] font-bold rounded-lg border ${o.status === 'Cancelado' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>{o.status}</span>
                                                <ChevronRight className="size-4 text-brand-muted" />
                                            </div>
                                        </div>
                                    ))}
                                    {orders.filter(o => ["Entregue", "Cancelado"].includes(o.status)).length === 0 && (
                                        <p className="text-center text-brand-muted text-sm py-10">Nenhum pedido finalizado ainda.</p>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* --- MODAL: Detalhes do Pedido --- */}
                    {selectedOrder && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-brand-card w-full max-w-2xl rounded-2xl border border-brand-darkBorder shadow-2xl flex flex-col max-h-[92vh]">
                                <div className="p-5 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                                    <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                                        <Activity className="size-5 text-brand-primary" />
                                        Detalhes: <span className="text-brand-primary">{selectedOrder.id}</span>
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button title="Imprimir Ticket" className="p-2 bg-brand-bg border border-brand-darkBorder rounded-lg text-brand-muted hover:text-brand-text transition-colors"><Printer className="size-4" /></button>
                                        <button title="Gerar Etiqueta QR" onClick={() => { setSelectedOrder(null); router.push(`/labels?order=${selectedOrder.id.replace('#', '')}`); }} className="p-2 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-brand-primary hover:bg-brand-primary/20 transition-colors"><QrCode className="size-4" /></button>
                                        <button onClick={() => { setSelectedOrder(null); setIsStatusDropdown(false); }} className="text-brand-muted hover:text-brand-text bg-brand-bg p-2 rounded-lg border border-brand-darkBorder"><X className="size-4" /></button>
                                    </div>
                                </div>
                                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">

                                    {/* Status bar */}
                                    <div className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Status Operacional</span>
                                            <div className="relative">
                                                <button onClick={() => setIsStatusDropdown(!isStatusDropdown)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedOrder.textColor} bg-current/10`} style={{ borderColor: 'currentColor', opacity: 1 }}>
                                                    <span className="relative flex h-2 w-2">
                                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedOrder.bgColor}`} />
                                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedOrder.bgColor}`} />
                                                    </span>
                                                    {selectedOrder.status}
                                                    <ChevronDown className={`size-3 transition-transform ${isStatusDropdown ? "rotate-180" : ""}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {isStatusDropdown && (
                                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                                            className="absolute right-0 top-full mt-2 w-40 bg-brand-card border border-brand-darkBorder rounded-xl shadow-2xl overflow-hidden z-[60]">
                                                            {Object.keys(STATUS_CONFIG).map(s => (
                                                                <button key={s} onClick={() => handleStatusChange(s)}
                                                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-white/5 ${selectedOrder.status === s ? "text-brand-primary bg-brand-primary/5" : "text-brand-muted hover:text-brand-text"}`}>
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        <div className="relative h-2 w-full bg-brand-card rounded-full overflow-hidden">
                                            <motion.div animate={{ width: `${selectedOrder.progress}%` }} transition={{ duration: 0.8 }}
                                                className={`absolute h-full rounded-full ${selectedOrder.bgColor}`} />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-brand-muted uppercase mt-2">
                                            {["Recebido", "Triagem", "Lavagem", "Secagem", "Finaliz.", "Pronto", "Entregue"].map(l => <span key={l}>{l}</span>)}
                                        </div>
                                    </div>

                                    {/* Client & Service Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { icon: User, label: "Cliente", field: "client", type: "text" },
                                            { icon: Phone, label: "Telefone", field: "phone", type: "text" },
                                            { icon: Mail, label: "Email", field: "email", type: "email" },
                                            { icon: MapPin, label: "Endereço", field: "address", type: "text" },
                                        ].map(({ icon: Icon, label, field, type }) => (
                                            <div key={field} className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                                <div className="p-2 bg-white/5 border border-white/10 rounded-lg shrink-0"><Icon className="size-3.5 text-brand-muted" /></div>
                                                <div className="w-full overflow-hidden">
                                                    <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">{label}</p>
                                                    <input type={type} value={(selectedOrder as any)[field]}
                                                        onChange={e => setSelectedOrder({ ...selectedOrder, [field]: e.target.value })}
                                                        className="w-full bg-transparent outline-none text-sm font-bold text-brand-text border-b border-transparent focus:border-brand-primary transition-colors pb-0.5 truncate" />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-white/5 border border-white/10 rounded-lg shrink-0"><Home className="size-3.5 text-brand-muted" /></div>
                                            <div className="w-full">
                                                <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">Entrega</p>
                                                <select value={selectedOrder.delivery} onChange={e => setSelectedOrder({ ...selectedOrder, delivery: e.target.value })}
                                                    className="w-full bg-transparent text-sm font-bold text-brand-text outline-none appearance-none cursor-pointer">
                                                    <option className="bg-brand-card">Entrega em Domicílio</option>
                                                    <option className="bg-brand-card">Retirada no Balcão</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-white/5 border border-white/10 rounded-lg shrink-0"><CalendarDays className="size-3.5 text-brand-muted" /></div>
                                            <div className="w-full">
                                                <p className="text-[10px] text-brand-muted uppercase font-bold mb-0.5">Previsão de Entrega</p>
                                                <input type="date" value={selectedOrder.estimatedDelivery}
                                                    onChange={e => setSelectedOrder({ ...selectedOrder, estimatedDelivery: e.target.value })}
                                                    className="w-full bg-transparent text-sm font-bold text-brand-text outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2"><Package className="size-3.5" /> Itens do Pedido</h4>
                                        <div className="bg-brand-bg border border-brand-darkBorder rounded-xl overflow-hidden divide-y divide-brand-darkBorder">
                                            {selectedOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-brand-text">{item.service}</p>
                                                        <p className="text-xs text-brand-muted">{item.qty}x {formatCurrency(item.unitPrice)}</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-emerald-500">{formatCurrency(item.qty * item.unitPrice)}</span>
                                                </div>
                                            ))}
                                            <div className="flex items-center justify-between px-4 py-3 bg-white/5">
                                                <span className="text-sm font-black text-brand-text">Total</span>
                                                <span className="text-sm font-black text-brand-primary">{formatCurrency(calcTotal(selectedOrder.items))}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1">Forma de Pagamento</p>
                                            <select value={selectedOrder.paymentMethod} onChange={e => setSelectedOrder({ ...selectedOrder, paymentMethod: e.target.value })}
                                                className="w-full bg-transparent text-sm font-bold text-brand-text outline-none appearance-none cursor-pointer">
                                                <option className="bg-brand-card">PIX</option><option className="bg-brand-card">Cartão de Crédito</option><option className="bg-brand-card">Cartão de Débito</option><option className="bg-brand-card">Dinheiro</option><option className="bg-brand-card">Boleto</option>
                                            </select>
                                        </div>
                                        <div className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1">Status do Pagamento</p>
                                            <select value={selectedOrder.paymentStatus} onChange={e => setSelectedOrder({ ...selectedOrder, paymentStatus: e.target.value })}
                                                className="w-full bg-transparent text-sm font-bold text-brand-text outline-none appearance-none cursor-pointer">
                                                {PAYMENT_STATUSES.map(p => <option key={p} className="bg-brand-card">{p}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Observations */}
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2"><StickyNote className="size-3.5" /> Observações Internas</h4>
                                        <textarea rows={2} placeholder="Nenhuma observação..." value={selectedOrder.observations}
                                            onChange={e => setSelectedOrder({ ...selectedOrder, observations: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none" />
                                    </div>

                                    {/* Timeline */}
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2"><History className="size-3.5" /> Histórico de Movimentação</h4>
                                        <div className="relative pl-5 space-y-3">
                                            <div className="absolute left-2 top-1 bottom-1 w-px bg-brand-darkBorder" />
                                            {selectedOrder.history.map((h, idx) => (
                                                <div key={idx} className="relative flex items-start gap-3">
                                                    <div className="absolute -left-3 top-1.5 size-2.5 rounded-full border-2 border-brand-primary bg-brand-bg" />
                                                    <div className="bg-brand-bg border border-brand-darkBorder rounded-xl px-3 py-2 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-black text-brand-primary">{h.status}</span>
                                                            <span className="text-[10px] text-brand-muted font-semibold flex items-center gap-1"><Timer className="size-3" />{h.time}</span>
                                                        </div>
                                                        {h.note && <p className="text-xs text-brand-muted mt-0.5">{h.note}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 border-t border-brand-darkBorder">
                                    <button onClick={handleSaveOrder}
                                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="size-4" /> Salvar Alterações
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                </AnimatePresence>
                <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
            `}</style>
            </div>
        </AccessGuard>
    );
}
