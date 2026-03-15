"use client";
export const dynamic = "force-dynamic";

import { Sidebar, MobileHeader } from "@/components/sidebar";
import { AccessGuard } from "@/components/access-guard";
import {
    Truck, CheckCircle2, AlertCircle, Clock, Activity, History, Timer,
    X, User, Phone, Mail, CreditCard, Home, ChevronDown, Search,
    Plus, Trash2, Printer, QrCode, Filter, ArrowRight, Package,
    CalendarDays, StickyNote, MapPin, ChevronRight, Edit2, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Order, OrderItem, HistoryEntry, SERVICES as initialServices } from "../../lib/orders-data";
import { Customer, seedCustomers } from "../../lib/customers-data";
import { useState, useEffect, useMemo } from "react";
import { UnitSelector } from "@/components/unit-selector";
import { useRouter } from "next/navigation";
import { useUnit } from "@/hooks/useUnit";
import { useAuth } from "@/hooks/useAuth";
import { syncData, pushDataToServer, syncSave } from "@/lib/dataSync";
import { useBusinessData } from "@/components/business-data-provider";

const StatusColors: Record<string, string> = {
    "Recebido": "bg-slate-500",
    "Em Triagem": "bg-violet-500",
    "Em Lavagem": "bg-blue-500",
    "Em Secagem": "bg-amber-500",
    "Em Finalização": "bg-cyan-500",
    "Pronto": "bg-emerald-500",
    "Entregue": "bg-teal-500",
    "Cancelado": "bg-rose-500",
};

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

const seedOrders: Order[] = [];
function calcTotal(items: OrderItem[]) { return items.reduce((s: number, i: OrderItem) => s + i.qty * i.unitPrice, 0); }
function formatCurrency(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function OrdersPage() {
    const router = useRouter();
    const { staffName } = useAuth();
    const { data: businessData, refresh } = useBusinessData();
    const orders = businessData.orders;
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isStatusDropdown, setIsStatusDropdown] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("Todos");
    const [filterPayment, setFilterPayment] = useState("Todos");
    const { unitId: activeUnit } = useUnit();

    // New order form
    const allCustomers = businessData.customers;
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustSuggestions, setShowCustSuggestions] = useState(false);
    const [activeServiceIdx, setActiveServiceIdx] = useState<number | null>(null);
    const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
    const blankItem: OrderItem = { service: "", qty: 1, unitPrice: 0 };
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
        setIsLoaded(true);
        refresh("lavanpro_orders_v3");
    }, []);

    // A remoção do useEffect que salvava 'orders' no localStorage é intencional.
    // Agora salvamos explicitamente usando syncSave() em cada ação do usuário.


    // Init filters from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get("status");
        const search = params.get("search");
        if (status) setFilterStatus(status);
        if (search) setSearchQuery(search);
    }, []);

    const filteredOrders = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return orders.filter(o => {
            const matchesSearch = o.id.toLowerCase().includes(q) || o.client.toLowerCase().includes(q);
            const matchesStatus = filterStatus === "Todos" || o.status === filterStatus;
            const matchesPayment = filterPayment === "Todos" || o.paymentStatus === filterPayment;

            // MASTER UNIT FILTER
            const matchesUnit = !activeUnit || activeUnit === "all" || o.unitId === activeUnit;

            return matchesSearch && matchesStatus && matchesPayment && matchesUnit;
        });
    }, [orders, searchQuery, filterStatus, filterPayment, activeUnit]);

    const stats = useMemo(() => [
        { label: "Em Andamento", value: filteredOrders.filter(o => !["Entregue", "Cancelado"].includes(o.status)).length, icon: Activity, color: "text-brand-primary", bg: "bg-brand-primary/10" },
        { label: "Entregues", value: filteredOrders.filter(o => o.status === "Entregue").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "A Receber", value: formatCurrency(filteredOrders.filter(o => o.paymentStatus === "A Pagar").reduce((s, o) => s + calcTotal(o.items), 0)), icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10", wide: true },
        { label: "Cancelados", value: filteredOrders.filter(o => o.status === "Cancelado").length, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
    ], [filteredOrders]);

    const handleAddItem = () => setNewOrder(n => ({ ...n, items: [...n.items, { ...blankItem }] }));
    const handleRemoveItem = (idx: number) => setNewOrder(n => ({ ...n, items: n.items.filter((_, i) => i !== idx) }));
    const handleItemChange = (idx: number, field: keyof OrderItem, value: string | number) => {
        setNewOrder(n => {
            const items = [...n.items];
            if (field === "service") {
                const svc = currentServices.find(s => s.name === value);
                items[idx] = {
                    ...items[idx],
                    service: value as string,
                    unitPrice: svc ? svc.price : items[idx].unitPrice
                };
            } else if (field === "unitPrice") {
                items[idx] = { ...items[idx], unitPrice: Number(value) };
            } else {
                items[idx] = { ...items[idx], [field]: Number(value) };
            }
            return { ...n, items };
        });
    };

    const handleAddSelectedItem = () => {
        if (!selectedOrder) return;
        setSelectedOrder({ ...selectedOrder, items: [...selectedOrder.items, { ...blankItem }] });
    };

    const handleRemoveSelectedItem = (idx: number) => {
        if (!selectedOrder) return;
        setSelectedOrder({ ...selectedOrder, items: selectedOrder.items.filter((_, i) => i !== idx) });
    };

    const handleSelectedItemChange = (idx: number, field: keyof OrderItem, value: string | number) => {
        if (!selectedOrder) return;
        const items = [...selectedOrder.items];
        if (field === "service") {
            const svc = currentServices.find(s => s.name === value);
            items[idx] = {
                ...items[idx],
                service: value as string,
                unitPrice: svc ? svc.price : items[idx].unitPrice
            };
        } else if (field === "unitPrice") {
            items[idx] = { ...items[idx], unitPrice: Number(value) };
        } else {
            items[idx] = { ...items[idx], [field]: Number(value) };
        }
        setSelectedOrder({ ...selectedOrder, items });
    };

    const handleCreateOrder = () => {
        if (!newOrder.client || newOrder.items.length === 0) return;

        const idNum = Math.floor(Math.random() * 9000) + 1000;
        const orderId = `#ORD-${idNum}`;
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5);
        const dateStr = now.toISOString().slice(0, 10);

        const newOrderEntry = {
            id: orderId,
            date: dateStr,
            service: newOrder.items.map((i: OrderItem) => i.service).join(", "),
            value: calcTotal(newOrder.items),
            status: "Triagem"
        };

        // Sync with Customers Database
        const existingCustIdx = allCustomers.findIndex((c: Customer) => c.name.toLowerCase() === newOrder.client.toLowerCase());
        let updatedCusts = [...allCustomers];

        if (existingCustIdx !== -1) {
            // Update existing customer history
            const target = updatedCusts[existingCustIdx];
            updatedCusts[existingCustIdx] = {
                ...target,
                phone: newOrder.phone || target.phone,
                email: newOrder.email || target.email,
                address: newOrder.address || target.address,
                orders: [newOrderEntry, ...target.orders]
            };
        } else {
            // Register new customer
            const newCust = {
                id: `C${String(allCustomers.length + 1).padStart(3, "0")}`,
                name: newOrder.client,
                phone: newOrder.phone,
                email: newOrder.email,
                address: newOrder.address,
                origin: "Balcão",
                notes: "",
                active: true,
                createdAt: dateStr,
                tags: ["Recorrente"],
                orders: [newOrderEntry],
                unitId: activeUnit === "all" ? "default" : activeUnit
            };
            updatedCusts = [newCust, ...updatedCusts];
        }

        syncSave("lavanpro_customers", updatedCusts);


        const freshOrder: Order = {
            id: orderId,
            client: newOrder.client, phone: newOrder.phone, email: newOrder.email,
            address: newOrder.address, delivery: newOrder.delivery,
            paymentMethod: newOrder.paymentMethod, paymentStatus: newOrder.paymentStatus,
            items: newOrder.items, status: "Triagem", progress: 10,
            bgColor: "bg-brand-primary", textColor: "text-brand-primary",
            observations: newOrder.observations,
            estimatedDelivery: newOrder.estimatedDelivery,
            history: [{ time: timeStr, status: "Triagem", note: "Pedido criado.", staffName }],
            createdAt: dateStr,
            unitId: activeUnit === "all" ? "default" : activeUnit,
            createdBy: staffName,
            lastUpdatedBy: staffName
        };

        const currentOrders = orders;
        const updatedOrders = [freshOrder, ...currentOrders];
        
        syncSave("lavanpro_orders_v3", updatedOrders);

        setIsNewOrderOpen(false);

        setCustomerSearch("");
        setShowCustSuggestions(false);
        setNewOrder({ client: "", phone: "", email: "", address: "", delivery: "Entrega em Domicílio", paymentMethod: "PIX", paymentStatus: "A Pagar", estimatedDelivery: "", observations: "", items: [{ ...blankItem }] });

        // Sincronização automática via syncSave acima

    };

    useEffect(() => {
        const handleClick = () => {
            setShowCustSuggestions(false);
            setShowServiceSuggestions(false);
        };
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    const realServices = businessData.services;

    const currentServices = realServices.length > 0 ? realServices : initialServices;

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return [];
        return allCustomers.filter(c =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            (c.phone && c.phone.includes(customerSearch))
        ).slice(0, 5);
    }, [allCustomers, customerSearch]);

    const selectCustomer = (c: any) => {
        setNewOrder(n => ({
            ...n,
            client: c.name,
            phone: c.phone || "",
            email: c.email || "",
            address: c.address || ""
        }));
        setCustomerSearch(c.name);
        setShowCustSuggestions(false);
    };

    const handleStatusChange = async (statusOption: string) => {
        if (!selectedOrder) return;

        const cfg = STATUS_CONFIG[statusOption];
        const now = new Date().toTimeString().slice(0, 5);

        // --- MOTOR DE BAIXA DE ESTOQUE ---
        // Gatilho: Quando entra em "Em Lavagem" e ainda não foi debitado
        if (statusOption === "Em Lavagem" && !(selectedOrder as any).stockDeducted) {
            const products = [...(businessData.stock_products || [])];
            const movements = [...(businessData.stock_movements || [])];

            if (products.length > 0) {
                try {
                    let hasStockIssue = false;

                    selectedOrder.items.forEach((item: OrderItem) => {
                        const service = (businessData.services || []).find((s: any) => s.name === item.service);
                        if (service && service.recipe && service.recipe.length > 0) {
                            service.recipe.forEach((recipeItem: any) => {
                                const productIdx = products.findIndex((p: any) => p.id === recipeItem.productId);
                                if (productIdx !== -1) {
                                    const totalQtyToDeduct = recipeItem.quantity * item.qty;

                                    // Registra Movimentação de Saída
                                    const newMovement = {
                                        id: `MOV-AUTO-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
                                        date: new Date().toISOString().slice(0, 10),
                                        type: "SAIDA",
                                        productId: recipeItem.productId,
                                        quantity: totalQtyToDeduct,
                                        unitCost: products[productIdx].unitCost || 0,
                                        reason: `Consumo Pedido ${selectedOrder.id}`,
                                        user: "Sistema (Automação)"
                                    };
                                    movements.unshift(newMovement);

                                    // Atualiza Estoque Atual
                                    products[productIdx].currentStock = Math.max(0, (products[productIdx].currentStock || 0) - totalQtyToDeduct);
                                }
                            });
                        }
                    });

                    // Persiste as alterações no estoque via syncSave
                    await syncSave("lavanpro_stock_products_v2", products);
                    await syncSave("lavanpro_stock_movements_v2", movements);

                    // Marca o pedido como debitado para não repetir a lógica
                    (selectedOrder as any).stockDeducted = true;
                } catch (e) {
                    console.error("Erro na automação de estoque:", e);
                }
            }
        }

        const updated: Order = {
            ...selectedOrder,
            status: statusOption,
            progress: cfg?.progress ?? selectedOrder.progress,
            bgColor: cfg?.bg ?? selectedOrder.bgColor,
            textColor: cfg?.textColor ?? selectedOrder.textColor,
            history: [
                ...selectedOrder.history,
                {
                    time: now,
                    status: statusOption,
                    note: statusOption === "Em Lavagem" ? "Iniciado processo e estoque baixado." : "",
                    staffName
                }
            ],
            lastUpdatedBy: staffName
        };
        setSelectedOrder(updated);
        setIsStatusDropdown(false);

        // Se marcou como "Entregue", desvincular automaticamente a etiqueta QR
        if (statusOption === "Entregue") {
            try {
                const allLabels = businessData.labels || [];
                const cleanId = String(selectedOrder.id).replace("#", "").trim();
                const linkedLabel = allLabels.find((l: any) => String(l.currentOrderId || "").trim() === cleanId);

                if (linkedLabel) {
                    const updatedLabels = allLabels.map((l: any) =>
                        l.id === linkedLabel.id ? { ...l, status: "available", currentOrderId: null } : l
                    );
                    syncSave("lavanpro_labels", updatedLabels);
                }
            } catch (e) {
                console.error("Erro ao desvincular etiqueta:", e);
            }
        }
    };

    const handleDeleteOrder = (id: string) => {
        if (confirm("Tem certeza que deseja excluir este pedido? Esta ação é irreversível e removerá o pedido de todos os registros.")) {
            const updated = orders.filter(o => o.id !== id);
            syncSave("lavanpro_orders_v3", updated);
            setSelectedOrder(null);

        }
    };

    const handleSaveOrder = () => {
        if (!selectedOrder) return;

        // Sync with Customers Database if name/contact changed
        const existingCustIdx = allCustomers.findIndex((c: Customer) => c.id === selectedOrder.client); // Assuming client field might store ID or we match by name
        // (Simplified sync for now based on name if ID isn't clear)
        const updatedCusts = allCustomers.map((c: Customer) => {
            if (c.name === selectedOrder.client) {
                return {
                    ...c,
                    phone: selectedOrder.phone || c.phone,
                    email: selectedOrder.email || c.email,
                    address: selectedOrder.address || c.address
                };
            }
            return c;
        });
        syncSave("lavanpro_customers", updatedCusts);


        // Desvincula QR automaticamente quando pedido está como Entregue
        if (selectedOrder.status === "Entregue") {
            try {
                const labels = businessData.labels;
                const cleanId = String(selectedOrder.id).replace("#", "").trim();
                const linkedLabel = labels.find((l: any) => String(l.currentOrderId || "").trim() === cleanId);

                if (linkedLabel) {
                    const updatedLabels = labels.map((l: any) =>
                        l.id === linkedLabel.id ? { ...l, status: "available", currentOrderId: null } : l
                    );
                    syncSave("lavanpro_labels", updatedLabels);

                    try {
                        const history = businessData.label_history || [];
                        const updatedHistory = history.map((h: any) =>
                            h.labelId === linkedLabel.id && h.releasedAt === null
                                ? { ...h, releasedAt: new Date().toISOString() }
                                : h
                        );
                        syncSave("lavanpro_label_history", updatedHistory);
                    } catch (err) {
                        console.error("Erro ao atualizar histórico da etiqueta:", err);
                    }
                    window.dispatchEvent(new Event("storage"));
                }
            } catch (e) {
                console.error("Erro ao desvincular etiqueta:", e);
            }
        }

        const updatedOrdersList = orders.map(o => o.id === selectedOrder.id ? selectedOrder : o);
        syncSave("lavanpro_orders_v3", updatedOrdersList);
        setSelectedOrder(null);
        setIsStatusDropdown(false);

    };

    return (
        <AccessGuard permission="orders">
            <div className="flex min-h-screen bg-brand-bg text-brand-text font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <MobileHeader title="Pedidos" />
                    <main className="flex-1 overflow-y-auto responsive-px py-6 lg:py-8 custom-scrollbar">
                        <div className="max-w-[1600px] mx-auto space-y-6 safe-bottom">

                            {/* Header */}
                            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h1 className="text-3xl font-black text-brand-text tracking-tight">Gestão de Pedidos</h1>
                                    <p className="text-brand-muted text-sm font-medium flex items-center gap-2 mt-1">
                                        <Activity className="size-4 animate-pulse text-emerald-500" />
                                        Fluxo completo de ordens de serviço
                                    </p>
                                </motion.div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="w-full sm:w-64">
                                        <UnitSelector showAllOption={true} />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setIsHistoryOpen(true)} className="px-4 py-2 bg-brand-card border border-brand-darkBorder rounded-lg text-xs font-bold text-brand-text hover:bg-brand-darkBorder transition-all flex items-center gap-2">
                                            <History className="size-4" /> Histórico
                                        </button>
                                        <button onClick={() => setIsNewOrderOpen(true)} className="px-5 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2">
                                            <Plus className="size-4" /> Novo Pedido
                                        </button>
                                    </div>
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
                                                <th className="p-4">Entrega Prev.</th>
                                                <th className="p-4 pr-6 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-darkBorder">
                                            {filteredOrders.length === 0 && (
                                                <tr><td colSpan={8} className="text-center py-12 text-brand-muted text-sm">Nenhum pedido encontrado.</td></tr>
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
                                                        <td className="p-4 text-sm text-brand-muted font-semibold">
                                                            {order.estimatedDelivery || "—"}
                                                        </td>
                                                        <td className="p-4 pr-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                                                                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg border border-rose-500/20 transition-all opacity-0 group-hover:opacity-100"
                                                                    title="Excluir Pedido"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                                                    className="p-2.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg border border-brand-primary/20 transition-all opacity-0 group-hover:opacity-100"
                                                                    title="Editar Pedido"
                                                                >
                                                                    <Edit2 className="size-4" />
                                                                </button>
                                                            </div>
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

                    {/* --- MODAL: Novo Pedido (REFORMULADO PREMIUM) --- */}
                    {isNewOrderOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                className="bg-[#0f111a]/95 w-full max-w-3xl rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col max-h-[94vh] overflow-hidden"
                            >
                                {/* Header Minimalista */}
                                <div className="px-10 py-8 flex justify-between items-center">
                                    <div className="flex items-center gap-5">
                                        <div className="size-14 rounded-[1.25rem] bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                                            <Plus className="size-7 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tight">Novo Pedido</h3>
                                            <p className="text-xs text-brand-muted font-bold uppercase tracking-widest mt-0.5">Registro de Entrada de Serviço</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsNewOrderOpen(false)} className="size-12 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 rounded-2xl text-brand-muted hover:text-rose-400 transition-all flex items-center justify-center group">
                                        <X className="size-5 group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10 space-y-10">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* Coluna 1: Cliente e Logística */}
                                        <div className="space-y-10">
                                            <section>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="h-5 w-1 bg-brand-primary rounded-full" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Informações Relevantes</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {/* Nome do Cliente com Autocomplete */}
                                                    <div className="relative group">
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors">
                                                            <User className="size-4 text-brand-muted group-focus-within:text-brand-primary" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Ex: João da Silva"
                                                            value={customerSearch}
                                                            onFocus={() => setShowCustSuggestions(true)}
                                                            onClick={e => e.stopPropagation()}
                                                            onChange={e => {
                                                                setCustomerSearch(e.target.value);
                                                                setNewOrder(n => ({ ...n, client: e.target.value }));
                                                                setShowCustSuggestions(true);
                                                            }}
                                                            className="w-full pl-14 pr-5 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-brand-muted focus:bg-white/[0.05] focus:border-brand-primary/50 focus:outline-none transition-all"
                                                        />
                                                        <label className="absolute left-5 -top-2 px-2 bg-[#0f111a] text-[10px] font-bold text-brand-muted uppercase tracking-wider group-focus-within:text-brand-primary transition-colors">
                                                            Nome do Cliente
                                                        </label>

                                                        {/* Sugestões de Clientes */}
                                                        <AnimatePresence>
                                                            {showCustSuggestions && filteredCustomers.length > 0 && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                                    className="absolute left-0 right-0 top-full mt-2 bg-[#161925] border border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden"
                                                                >
                                                                    {filteredCustomers.map(c => (
                                                                        <button key={c.id} onClick={() => selectCustomer(c)}
                                                                            className="w-full text-left px-5 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                                                            <p className="text-xs font-bold text-white">{c.name}</p>
                                                                            <p className="text-[10px] text-brand-muted">{c.phone || "Sem telefone"}</p>
                                                                        </button>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    {[
                                                        { icon: Phone, label: "Telefone / WhatsApp", field: "phone", type: "text", placeholder: "(11) 9 0000-0000" },
                                                        { icon: Mail, label: "E-mail de Contato", field: "email", type: "email", placeholder: "cliente@email.com" },
                                                        { icon: MapPin, label: "Endereço Completo", field: "address", type: "text", placeholder: "Rua, Número, Bairro - Cidade" },
                                                    ].map(({ icon: Icon, label, field, type, placeholder }) => (
                                                        <div key={field} className="relative group">
                                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors">
                                                                <Icon className="size-4 text-brand-muted group-focus-within:text-brand-primary" />
                                                            </div>
                                                            <input
                                                                type={type}
                                                                placeholder={placeholder}
                                                                value={(newOrder as any)[field]}
                                                                onChange={e => setNewOrder(n => ({ ...n, [field]: e.target.value }))}
                                                                className="w-full pl-14 pr-5 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-brand-muted focus:bg-white/[0.05] focus:border-brand-primary/50 focus:outline-none transition-all"
                                                            />
                                                            <label className="absolute left-5 -top-2 px-2 bg-[#0f111a] text-[10px] font-bold text-brand-muted uppercase tracking-wider group-focus-within:text-brand-primary transition-colors">
                                                                {label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            <section>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="h-5 w-1 bg-brand-primary rounded-full" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Configuração de Entrega</h4>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="relative group">
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                                            <Home className="size-4 text-brand-muted group-focus-within:text-brand-primary" />
                                                        </div>
                                                        <select
                                                            value={newOrder.delivery}
                                                            onChange={e => setNewOrder(n => ({ ...n, delivery: e.target.value }))}
                                                            className="w-full pl-14 pr-12 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:border-brand-primary/50 outline-none appearance-none cursor-pointer"
                                                        >
                                                            <option className="bg-[#161925]">Entrega em Domicílio</option>
                                                            <option className="bg-[#161925]">Retirada no Balcão</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 size-4 text-brand-muted pointer-events-none" />
                                                        <label className="absolute left-5 -top-2 px-2 bg-[#0f111a] text-[10px] font-bold text-brand-muted uppercase tracking-wider">Método</label>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                                            <CalendarDays className="size-4 text-brand-muted group-focus-within:text-brand-primary" />
                                                        </div>
                                                        <input
                                                            type="date"
                                                            value={newOrder.estimatedDelivery}
                                                            onChange={e => setNewOrder(n => ({ ...n, estimatedDelivery: e.target.value }))}
                                                            className="w-full pl-14 pr-5 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:border-brand-primary/50 outline-none transition-all [color-scheme:dark]"
                                                        />
                                                        <label className="absolute left-5 -top-2 px-2 bg-[#0f111a] text-[10px] font-bold text-brand-muted uppercase tracking-wider">Previsão</label>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>

                                        {/* Coluna 2: Itens e Pagamento */}
                                        <div className="space-y-10">
                                            <section>
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-5 w-1 bg-brand-primary rounded-full" />
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Serviços Adicionados</h4>
                                                    </div>
                                                    <button onClick={handleAddItem} className="flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 transition-colors">
                                                        <Plus className="size-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Adicionar</span>
                                                    </button>
                                                </div>
                                                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-4 custom-scrollbar pb-24">
                                                    {newOrder.items.map((item, idx) => (
                                                        <div key={idx} className={`group relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex flex-col gap-5 transition-all hover:bg-white/[0.04] hover:border-brand-primary/30 ${activeServiceIdx === idx ? 'z-[110]' : 'z-10'}`}>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex-1 relative">
                                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                                                                        <Search className="size-4 text-brand-muted" />
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Nome do serviço..."
                                                                        value={item.service}
                                                                        onClick={e => e.stopPropagation()}
                                                                        onChange={e => {
                                                                            handleItemChange(idx, "service", e.target.value);
                                                                            setActiveServiceIdx(idx);
                                                                            setShowServiceSuggestions(true);
                                                                        }}
                                                                        onFocus={() => {
                                                                            setActiveServiceIdx(idx);
                                                                            setShowServiceSuggestions(true);
                                                                        }}
                                                                        className="w-full bg-transparent pl-7 text-sm font-black text-white outline-none placeholder:text-brand-muted"
                                                                    />

                                                                    <AnimatePresence>
                                                                        {showServiceSuggestions && activeServiceIdx === idx && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                exit={{ opacity: 0, y: 10 }}
                                                                                className="absolute top-[calc(100%+12px)] left-0 w-full min-w-[320px] bg-[#1a1d29] border border-white/10 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] z-[120] overflow-hidden max-h-[280px] overflow-y-auto custom-scrollbar backdrop-blur-3xl"
                                                                            >
                                                                                {currentServices
                                                                                    .filter(s => s.name.toLowerCase().includes(item.service.toLowerCase()))
                                                                                    .map((s, sIdx) => (
                                                                                        <button
                                                                                            key={sIdx}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleItemChange(idx, "service", s.name);
                                                                                                setShowServiceSuggestions(false);
                                                                                                setActiveServiceIdx(null);
                                                                                            }}
                                                                                            className="w-full text-left px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex justify-between items-center gap-4 group/item"
                                                                                        >
                                                                                            <span className="text-xs font-bold text-white group-hover/item:text-brand-primary transition-colors flex-1">{s.name}</span>
                                                                                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg shrink-0">{formatCurrency(s.price)}</span>
                                                                                        </button>
                                                                                    ))}
                                                                                {currentServices.filter(s => s.name.toLowerCase().includes(item.service.toLowerCase())).length === 0 && (
                                                                                    <div className="px-5 py-3 text-[10px] text-brand-muted italic">Serviço novo (preço manual)</div>
                                                                                )}
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="flex items-center gap-2 bg-black/40 rounded-lg px-2 py-1">
                                                                        <span className="text-[10px] font-black text-brand-muted">R$</span>
                                                                        <input
                                                                            type="number"
                                                                            value={item.unitPrice}
                                                                            onChange={e => handleItemChange(idx, "unitPrice", e.target.value)}
                                                                            className="w-16 bg-transparent text-sm font-black text-emerald-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center bg-black/40 rounded-lg p-1">
                                                                    <button onClick={() => handleItemChange(idx, "qty", Math.max(1, item.qty - 1))} className="size-8 flex items-center justify-center text-brand-muted hover:text-white">-</button>
                                                                    <span className="w-10 text-center text-xs font-black text-brand-primary">{item.qty}</span>
                                                                    <button onClick={() => handleItemChange(idx, "qty", item.qty + 1)} className="size-8 flex items-center justify-center text-brand-muted hover:text-white">+</button>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <p className="text-lg font-black text-emerald-400">{formatCurrency(item.qty * item.unitPrice)}</p>
                                                                    {newOrder.items.length > 1 && (
                                                                        <button onClick={() => handleRemoveItem(idx)} className="text-rose-500 hover:text-rose-400 transition-colors p-2 bg-white/5 rounded-xl"><Trash2 className="size-4" /></button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-6 p-5 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Total Acumulado</span>
                                                    <span className="text-2xl font-black text-brand-primary">{formatCurrency(calcTotal(newOrder.items))}</span>
                                                </div>
                                            </section>

                                            <section>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="h-5 w-1 bg-brand-primary rounded-full" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Financeiro e Notas</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="relative group">
                                                            <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                                                <CreditCard className="size-4 text-brand-muted group-focus-within:text-brand-primary" />
                                                            </div>
                                                            <select value={newOrder.paymentMethod} onChange={e => setNewOrder(n => ({ ...n, paymentMethod: e.target.value }))}
                                                                className="w-full pl-14 pr-10 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:border-brand-primary/50 outline-none appearance-none cursor-pointer">
                                                                <option className="bg-[#161925]">PIX</option><option className="bg-[#161925]">Cartão</option><option className="bg-[#161925]">Dinheiro</option>
                                                            </select>
                                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 size-4 text-brand-muted pointer-events-none" />
                                                        </div>
                                                        <div className="relative group">
                                                            <select value={newOrder.paymentStatus} onChange={e => setNewOrder(n => ({ ...n, paymentStatus: e.target.value }))}
                                                                className="w-full px-5 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white focus:border-brand-primary/50 outline-none appearance-none cursor-pointer">
                                                                {PAYMENT_STATUSES.map(p => <option key={p} className="bg-[#161925]">{p}</option>)}
                                                            </select>
                                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 size-4 text-brand-muted pointer-events-none" />
                                                        </div>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute left-5 top-5">
                                                            <StickyNote className="size-4 text-brand-muted group-focus-within:text-brand-primary" />
                                                        </div>
                                                        <textarea
                                                            rows={3}
                                                            placeholder="Observações especiais..."
                                                            value={newOrder.observations}
                                                            onChange={e => setNewOrder(n => ({ ...n, observations: e.target.value }))}
                                                            className="w-full pl-14 pr-5 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-brand-muted focus:bg-white/[0.05] focus:border-brand-primary/50 outline-none transition-all resize-none shadow-inner"
                                                        />
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-10 py-8 bg-white/[0.02] border-t border-white/5">
                                    <button
                                        onClick={handleCreateOrder}
                                        disabled={!newOrder.client || newOrder.items.length === 0}
                                        className="w-full group relative py-6 bg-brand-primary text-white rounded-[1.75rem] font-black text-sm tracking-[0.2em] uppercase overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-[0_20px_40px_-10px_rgba(139,92,246,0.4)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <span className="relative flex items-center justify-center gap-4">
                                            <CheckCircle2 className="size-6" />
                                            Registrar Entrada de Pedido
                                        </span>
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

                    {/* --- MODAL: Detalhes do Pedido (REFORMULADO PREMIUM) --- */}
                    {selectedOrder && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                className="bg-[#0f111a]/95 w-full max-w-4xl rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col max-h-[94vh] overflow-hidden"
                            >
                                {/* Header Minimalista */}
                                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                                            <Package className="size-6 text-brand-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-black text-white tracking-tight">Voucher do Pedido</h3>
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">{selectedOrder.id}</span>
                                            </div>
                                            <p className="text-xs text-brand-muted font-bold mt-1">Registrado em {selectedOrder.createdAt} • Alta Prioridade</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleDeleteOrder(selectedOrder.id)}
                                            className="p-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-2xl text-rose-500 transition-all flex items-center gap-2 group/del"
                                            title="Excluir Pedido"
                                        >
                                            <Trash2 className="size-5 group-hover/del:scale-110 transition-transform" />
                                        </button>
                                        <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-brand-muted hover:text-white transition-all"><Printer className="size-5" /></button>
                                        {(() => {
                                            const labels = businessData.labels || [];
                                            const cleanId = String(selectedOrder.id).replace("#", "").trim();
                                            const linked = labels.find((l: any) => String(l.currentOrderId || "").trim() === cleanId && l.status === "assigned");
                                            
                                            if (linked) {
                                                return (
                                                    <div className="px-5 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-black text-xs tracking-widest uppercase flex items-center gap-3 cursor-default" title={`Já vinculado à ${linked.code}`}>
                                                        <QrCode className="size-5" /> {linked.code} ✓
                                                    </div>
                                                );
                                            }
                                            return (
                                                <button onClick={() => { setSelectedOrder(null); router.push(`/labels?order=${selectedOrder.id.replace('#', '')}`); }} className="px-5 py-4 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 rounded-2xl text-brand-primary font-black text-xs tracking-widest uppercase transition-all flex items-center gap-3">
                                                    <QrCode className="size-5" /> Vincular QR
                                                </button>
                                            );
                                        })()}
                                        <button onClick={() => setSelectedOrder(null)} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-brand-muted hover:text-white transition-all"><X className="size-5" /></button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                                    {/* Status Flow Moderno */}
                                    <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 shadow-inner">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="relative size-3">
                                                    <span className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-20" />
                                                    <span className="relative block size-3 rounded-full bg-brand-primary" />
                                                </div>
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary">Estágio da Operação</h4>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsStatusDropdown(!isStatusDropdown)}
                                                    className={`group flex items-center gap-4 px-6 py-3 rounded-2xl text-xs font-black border transition-all ${selectedOrder.textColor} bg-white/5 border-white/10 hover:border-brand-primary/50 shadow-lg`}
                                                >
                                                    {selectedOrder.status}
                                                    <ChevronDown className={`size-4 transition-transform duration-300 ${isStatusDropdown ? "rotate-180" : ""}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {isStatusDropdown && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            className="absolute right-0 top-full mt-4 w-64 bg-[#161925] border border-white/10 rounded-[1.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden z-[70] p-2"
                                                        >
                                                            {Object.keys(STATUS_CONFIG).map(s => (
                                                                <button key={s} onClick={() => handleStatusChange(s)}
                                                                    className={`w-full text-left px-5 py-3.5 text-xs font-bold transition-all rounded-xl ${selectedOrder.status === s ? "text-brand-primary bg-brand-primary/10" : "text-brand-muted hover:text-white hover:bg-white/5"}`}>
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="relative px-4">
                                            {/* Linha de fundo */}
                                            <div className="absolute top-[22px] left-4 right-4 h-1.5 bg-white/[0.05] rounded-full" />
                                            {/* Linha de progresso ativa */}
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `calc(${selectedOrder.progress}% - 32px)` }}
                                                className={`absolute top-[22px] left-4 h-1.5 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)] ${selectedOrder.bgColor}`}
                                            />

                                            <div className="relative flex justify-between">
                                                {["Recebido", "Triagem", "Lavagem", "Secagem", "Finaliz.", "Pronto", "Entregue"].map((label, idx) => {
                                                    const stepProgress = (idx / 6) * 100;
                                                    const isActive = selectedOrder.progress >= stepProgress;
                                                    const isCurrent = selectedOrder.status === label || (label === "Finaliz." && selectedOrder.status === "Em Finalização") || (label === "Triagem" && selectedOrder.status === "Em Triagem") || (label === "Lavagem" && selectedOrder.status === "Em Lavagem") || (label === "Secagem" && selectedOrder.status === "Em Secagem");

                                                    return (
                                                        <div key={label} className="flex flex-col items-center group">
                                                            <div className={`size-12 rounded-full border-[5px] ${isActive ? 'bg-[#0f111a] border-brand-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-[#0f111a] border-white/5'} flex items-center justify-center transition-all duration-700 z-10 ${isCurrent ? 'scale-125 border-brand-primary shadow-[0_0_30px_rgba(139,92,246,0.5)]' : ''}`}>
                                                                {isActive ? <CheckCircle2 className="size-5 text-brand-primary" /> : <div className="size-2 rounded-full bg-white/10" />}
                                                            </div>
                                                            <span className={`mt-5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-white' : 'text-brand-muted'}`}>{label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </section>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Coluna 1: Dados do Cliente e Logística */}
                                        <div className="space-y-8">
                                            <section>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted mb-4 flex items-center gap-2">
                                                    <div className="size-1.5 rounded-full bg-brand-primary" /> Perfil do Cliente
                                                </h4>
                                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                                                    {[
                                                        { icon: User, label: "Titular", field: "client", type: "text" },
                                                        { icon: Phone, label: "WhatsApp", field: "phone", type: "text" },
                                                        { icon: MapPin, label: "Localização", field: "address", type: "text" },
                                                    ].map(({ icon: Icon, label, field, type }) => (
                                                        <div key={field} className="flex items-center gap-6 p-5 hover:bg-white/[0.02] transition-colors group">
                                                            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-muted group-hover:text-brand-primary transition-colors">
                                                                <Icon className="size-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">{label}</p>
                                                                <input
                                                                    type={type}
                                                                    value={(selectedOrder as any)[field]}
                                                                    onChange={e => setSelectedOrder({ ...selectedOrder, [field]: e.target.value })}
                                                                    className="w-full bg-transparent text-sm font-bold text-white outline-none focus:text-brand-primary transition-colors"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            <section>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted mb-4 flex items-center gap-2">
                                                    <div className="size-1.5 rounded-full bg-brand-primary" /> Planejamento Logístico
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl group">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-3">Modalidade</p>
                                                        <select
                                                            value={selectedOrder.delivery}
                                                            onChange={e => setSelectedOrder({ ...selectedOrder, delivery: e.target.value })}
                                                            className="w-full bg-transparent text-xs font-black text-white outline-none appearance-none cursor-pointer"
                                                        >
                                                            <option className="bg-[#161925]">Domicílio</option>
                                                            <option className="bg-[#161925]">Balcão</option>
                                                        </select>
                                                    </div>
                                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-3">Estimativa</p>
                                                        <input
                                                            type="date"
                                                            value={selectedOrder.estimatedDelivery}
                                                            onChange={e => setSelectedOrder({ ...selectedOrder, estimatedDelivery: e.target.value })}
                                                            className="w-full bg-transparent text-xs font-black text-white outline-none [color-scheme:dark]"
                                                        />
                                                    </div>
                                                </div>
                                            </section>
                                        </div>

                                        {/* Coluna 2: Itens e Pagamento */}
                                        <div className="space-y-8">
                                            <section>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted flex items-center gap-2">
                                                        <div className="size-1.5 rounded-full bg-brand-primary" /> Especificação do Pedido
                                                    </h4>
                                                    <button onClick={handleAddSelectedItem} className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 rounded-xl transition-all group">
                                                        <Plus className="size-3.5 text-brand-primary" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Adicionar</span>
                                                    </button>
                                                </div>
                                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-inner">
                                                    <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                                        {selectedOrder.items.map((item: OrderItem, idx: number) => (
                                                            <div key={idx} className={`group/item relative bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 transition-all hover:bg-white/[0.05] ${activeServiceIdx === idx ? 'z-[110]' : 'z-10'}`}>
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex-1 relative">
                                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2">
                                                                            <Search className="size-4 text-brand-muted" />
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Serviço..."
                                                                            value={item.service}
                                                                            onClick={e => e.stopPropagation()}
                                                                            onFocus={() => { setActiveServiceIdx(idx); setShowServiceSuggestions(true); }}
                                                                            onChange={e => handleSelectedItemChange(idx, "service", e.target.value)}
                                                                            className="w-full bg-transparent pl-8 text-sm font-black text-white outline-none placeholder:text-brand-muted"
                                                                        />

                                                                        <AnimatePresence>
                                                                            {showServiceSuggestions && activeServiceIdx === idx && (
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, y: 10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    exit={{ opacity: 0, y: 10 }}
                                                                                    className="absolute top-[calc(100%+12px)] left-0 w-full min-w-[320px] bg-[#1a1d29] border border-white/10 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] z-[120] overflow-hidden max-h-[280px] overflow-y-auto custom-scrollbar backdrop-blur-3xl"
                                                                                >
                                                                                    {currentServices
                                                                                        .filter(s => s.name.toLowerCase().includes(item.service.toLowerCase()))
                                                                                        .map((s, sIdx) => (
                                                                                            <button
                                                                                                key={sIdx}
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleSelectedItemChange(idx, "service", s.name);
                                                                                                    setShowServiceSuggestions(false);
                                                                                                    setActiveServiceIdx(null);
                                                                                                }}
                                                                                                className="w-full text-left px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex justify-between items-center gap-4 group/opt"
                                                                                            >
                                                                                                <span className="text-xs font-bold text-white group-hover/opt:text-brand-primary transition-colors flex-1">{s.name}</span>
                                                                                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg shrink-0">{formatCurrency(s.price)}</span>
                                                                                            </button>
                                                                                        ))}
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                    <button onClick={() => handleRemoveSelectedItem(idx)} className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all">
                                                                        <Trash2 className="size-4" />
                                                                    </button>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-1">
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">Quant.</span>
                                                                        <div className="flex items-center gap-3">
                                                                            <button onClick={() => handleSelectedItemChange(idx, "qty", Math.max(1, item.qty - 1))} className="size-6 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-white">-</button>
                                                                            <input type="number" value={item.qty} onChange={e => handleSelectedItemChange(idx, "qty", e.target.value)} className="w-8 bg-transparent text-center text-sm font-black text-white outline-none" />
                                                                            <button onClick={() => handleSelectedItemChange(idx, "qty", item.qty + 1)} className="size-6 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-white">+</button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-1 text-right">
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">Preço Unit.</span>
                                                                        <input type="number" value={item.unitPrice} onChange={e => handleSelectedItemChange(idx, "unitPrice", e.target.value)} className="w-full bg-transparent text-right text-sm font-black text-emerald-400 outline-none" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="px-8 py-6 bg-brand-primary/10 border-t border-brand-primary/20 flex items-center justify-between">
                                                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary">Valor Total Bruto</span>
                                                        <span className="text-3xl font-black text-brand-primary tracking-tighter">{formatCurrency(calcTotal(selectedOrder.items))}</span>
                                                    </div>
                                                </div>
                                            </section>

                                            <section>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted mb-4 flex items-center gap-2">
                                                    <div className="size-1.5 rounded-full bg-brand-primary" /> Gestão Financeira
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-3">Método</p>
                                                        <select value={selectedOrder.paymentMethod} onChange={e => setSelectedOrder({ ...selectedOrder, paymentMethod: e.target.value })}
                                                            className="w-full bg-transparent text-xs font-black text-white outline-none appearance-none cursor-pointer">
                                                            <option className="bg-[#161925]">PIX</option><option className="bg-[#161925]">Cartão</option><option className="bg-[#161925]">Dinheiro</option><option className="bg-[#161925]">Faturado</option>
                                                        </select>
                                                    </div>
                                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-3">Status Atual</p>
                                                        <select value={selectedOrder.paymentStatus}
                                                            onChange={e => {
                                                                const status = e.target.value;
                                                                const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                                                                setSelectedOrder({
                                                                    ...selectedOrder,
                                                                    paymentStatus: status,
                                                                    lastUpdatedBy: staffName,
                                                                    history: [
                                                                        ...selectedOrder.history,
                                                                        { time: now, status: `Pagamento: ${status}`, note: `Status de pagamento alterado para ${status}.`, staffName }
                                                                    ]
                                                                });
                                                            }}
                                                            className="w-full bg-transparent text-xs font-black text-white outline-none appearance-none cursor-pointer">
                                                            {PAYMENT_STATUSES.map(p => <option key={p} className="bg-[#161925]">{p}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>

                                    {/* Observações e Timeline */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <section>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted mb-4 flex items-center gap-2">
                                                <div className="size-1.5 rounded-full bg-brand-primary" /> Notas do Operador
                                            </h4>
                                            <textarea
                                                rows={3}
                                                placeholder="Adicionar detalhes técnicos..."
                                                value={selectedOrder.observations}
                                                onChange={e => setSelectedOrder({ ...selectedOrder, observations: e.target.value })}
                                                className="w-full p-5 bg-white/[0.03] border border-white/5 rounded-2xl text-sm font-medium text-white placeholder:text-brand-muted focus:bg-white/[0.05] focus:border-brand-primary/50 outline-none transition-all resize-none shadow-inner"
                                            />
                                        </section>

                                        <section>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted mb-4 flex items-center gap-2">
                                                <div className="size-1.5 rounded-full bg-brand-primary" /> Histórico de Eventos
                                            </h4>
                                            <div className="space-y-4 max-h-[120px] overflow-y-auto px-2 custom-scrollbar">
                                                {selectedOrder.history.map((h: HistoryEntry, idx: number) => (
                                                    <div key={idx} className="relative pl-8 pb-5 last:pb-0">
                                                        <div className="absolute left-0 top-1.5 w-px h-full bg-white/5" />
                                                        <div className="absolute left-[-4px] top-2 size-2.5 rounded-full border-2 border-brand-primary bg-[#0f111a] shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-black text-white uppercase tracking-wider">{h.status}</span>
                                                                <div className="flex items-center gap-2">
                                                                    {h.staffName && <span className="text-[8px] font-black uppercase text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md border border-brand-primary/20">{h.staffName}</span>}
                                                                    <span className="text-[9px] text-brand-muted font-black bg-white/5 px-2.5 py-1 rounded-full">{h.time}</span>
                                                                </div>
                                                            </div>
                                                            {h.note && <p className="text-[10px] text-brand-muted mt-2 font-medium leading-relaxed italic">"{h.note}"</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/[0.02] border-t border-white/5">
                                    <button
                                        onClick={handleSaveOrder}
                                        className="w-full group relative py-4 bg-brand-primary text-white rounded-2xl font-black text-sm tracking-[0.3em] uppercase overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_24px_48px_-12px_rgba(139,92,246,0.5)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <span className="relative flex items-center justify-center gap-4">
                                            <CheckCircle2 className="size-6" />
                                            Salvar Alterações do Pedido
                                        </span>
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                </AnimatePresence>
                <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 8px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); border: 2px solid transparent; background-clip: content-box; }
            `}</style>
            </div>
        </AccessGuard>
    );
}
