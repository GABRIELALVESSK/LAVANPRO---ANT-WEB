"use client";

import { Sidebar } from "@/components/sidebar";
import { AccessGuard } from "@/components/access-guard";
import {
    Users, Search, Plus, X, ChevronRight,
    Phone, Mail, MapPin, StickyNote, ShoppingBag, Star,
    TrendingUp, CheckCircle2, Edit3, Trash2,
    Calendar, Tag, Building2, ToggleLeft, ToggleRight, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";

import { Customer, seedCustomers } from "../../lib/customers-data";

type CustomerFormData = Omit<Customer, "id" | "createdAt" | "orders">;

// ─── Constants ────────────────────────────────────────────────────────────────
const ORIGINS = ["Indicação", "Instagram", "Google", "Walk-in", "WhatsApp", "Parcerias", "Outro"];
const TAGS_OPTIONS = ["VIP", "Comercial", "Residencial", "Pontual", "Inadimplente", "Recorrente"];
const TAG_COLORS: Record<string, string> = {
    "VIP": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "Comercial": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Residencial": "bg-teal-500/10 text-teal-500 border-teal-500/20",
    "Pontual": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Inadimplente": "bg-rose-500/10 text-rose-500 border-rose-500/20",
    "Recorrente": "bg-violet-500/10 text-violet-500 border-violet-500/20",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCustomerOrders(customerName: string, allOrders: any[]) {
    return allOrders.filter(o => o.client === customerName);
}

function totalSpent(customerName: string, allOrders: any[]) { 
    return getCustomerOrders(customerName, allOrders).reduce((s, o) => {
        const orderTotal = o.items?.reduce((sum: number, i: any) => sum + (Number(i.qty || 0) * Number(i.unitPrice || 0)), 0) || 0;
        return s + orderTotal;
    }, 0); 
}

function formatCurrency(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

function avgTicket(customerName: string, allOrders: any[]) { 
    const orders = getCustomerOrders(customerName, allOrders);
    return orders.length ? totalSpent(customerName, allOrders) / orders.length : 0; 
}
const blankCustomer = (): CustomerFormData => ({
    name: "", phone: "", email: "", address: "",
    origin: ORIGINS[0], notes: "", active: true, tags: [],
    unitId: "default"
});

// ─────────────────────────────────────────────────────────────────────────────
// EditPanel — OUTSIDE the main component to prevent recreation on every render
// ─────────────────────────────────────────────────────────────────────────────
interface EditPanelProps {
    data: CustomerFormData;
    onChange: (field: keyof CustomerFormData, value: any) => void;
    onTagToggle: (tag: string) => void;
    onSave: () => void;
    onCancel: () => void;
    title: string;
}

function EditPanel({ data, onChange, onTagToggle, onSave, onCancel, title }: EditPanelProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-brand-card w-full max-w-xl rounded-2xl border border-brand-darkBorder shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-5 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                    <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                        <User className="size-5 text-brand-primary" />{title}
                    </h3>
                    <button onClick={onCancel} className="text-brand-muted hover:text-brand-text bg-brand-bg p-2 rounded-lg border border-brand-darkBorder">
                        <X className="size-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">

                    {/* Dados de Contato */}
                    <section>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2">
                            <User className="size-3.5" />Dados de Contato
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Nome Completo / Empresa</label>
                                <input
                                    type="text"
                                    placeholder="João da Silva"
                                    value={data.name}
                                    onChange={e => onChange("name", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Telefone / WhatsApp</label>
                                <input
                                    type="text"
                                    placeholder="(11) 9 0000-0000"
                                    value={data.phone}
                                    onChange={e => onChange("phone", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">E-mail</label>
                                <input
                                    type="email"
                                    placeholder="cliente@email.com"
                                    value={data.email}
                                    onChange={e => onChange("email", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Endereço Completo</label>
                                <input
                                    type="text"
                                    placeholder="Av. Paulista, 1000 - Centro, São Paulo - SP"
                                    value={data.address}
                                    onChange={e => onChange("address", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Origem e Status */}
                    <section>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2">
                            <Building2 className="size-3.5" />Origem e Status
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Origem do Cliente</label>
                                <select
                                    value={data.origin}
                                    onChange={e => onChange("origin", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                >
                                    {ORIGINS.map(o => <option key={o} className="bg-brand-card">{o}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Status</label>
                                <button
                                    type="button"
                                    onClick={() => onChange("active", !data.active)}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${data.active ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500"}`}
                                >
                                    {data.active ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                                    {data.active ? "Ativo" : "Inativo"}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Tags */}
                    <section>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2">
                            <Tag className="size-3.5" />Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {TAGS_OPTIONS.map(tag => {
                                const active = data.tags.includes(tag);
                                return (
                                    <button
                                        type="button"
                                        key={tag}
                                        onClick={() => onTagToggle(tag)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${active ? TAG_COLORS[tag] || "bg-brand-primary/10 text-brand-primary border-brand-primary/30" : "bg-brand-bg border-brand-darkBorder text-brand-muted hover:text-brand-text"}`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Observações */}
                    <section>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2">
                            <StickyNote className="size-3.5" />Observações Internas
                        </h4>
                        <textarea
                            rows={3}
                            placeholder="Preferências, alertas, instruções especiais..."
                            value={data.notes}
                            onChange={e => onChange("notes", e.target.value)}
                            className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                        />
                    </section>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-brand-darkBorder">
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={!data.name}
                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="size-4" /> Salvar Cliente
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
    const [isLoaded, setIsLoaded] = useState(false);

    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("lavanpro_customers");
        if (saved) { try { setCustomers(JSON.parse(saved)); } catch { } }
        
        const savedOrders = localStorage.getItem("lavanpro_orders_v3");
        if (savedOrders) { try { setOrders(JSON.parse(savedOrders)); } catch { } }

        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) localStorage.setItem("lavanpro_customers", JSON.stringify(customers));
    }, [customers, isLoaded]);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos");
    const [filterTag, setFilterTag] = useState("Todos");
    const [filterOrigin, setFilterOrigin] = useState("Todos");
    const [selected, setSelected] = useState<Customer | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<CustomerFormData>(blankCustomer());
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState<CustomerFormData>(blankCustomer());
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return customers.filter(c => {
            const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
            const matchStatus = filterStatus === "Todos" || (filterStatus === "Ativo" ? c.active : !c.active);
            const matchTag = filterTag === "Todos" || c.tags.includes(filterTag);
            const matchOrigin = filterOrigin === "Todos" || c.origin === filterOrigin;
            return matchSearch && matchStatus && matchTag && matchOrigin;
        });
    }, [customers, search, filterStatus, filterTag, filterOrigin]);

    const stats = [
        { label: "Total Clientes", value: customers.length, icon: Users, color: "text-brand-primary", bg: "bg-brand-primary/10" },
        { label: "Ativos", value: customers.filter(c => c.active).length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Receita Total", value: formatCurrency(customers.reduce((s, c) => s + totalSpent(c.name, orders), 0)), icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "VIPs", value: customers.filter(c => c.tags.includes("VIP")).length, icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    ];

    // Handlers — Create
    const handleFormChange = (field: keyof CustomerFormData, value: any) =>
        setForm(f => ({ ...f, [field]: value }));
    const handleFormTagToggle = (tag: string) =>
        setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }));
    const handleCreate = () => {
        if (!form.name) return;
        const id = `C${String(customers.length + 1).padStart(3, "0")}`;
        const now = new Date().toISOString().slice(0, 10);
        setCustomers(prev => [{ ...form, id, createdAt: now, orders: [] }, ...prev]);
        setIsCreating(false);
        setForm(blankCustomer());
    };

    // Handlers — Edit
    const openEdit = (c: Customer) => {
        setEditForm({ name: c.name, phone: c.phone, email: c.email, address: c.address, origin: c.origin, notes: c.notes, active: c.active, tags: [...c.tags], unitId: c.unitId });
        setEditMode(true);
    };
    const handleEditChange = (field: keyof CustomerFormData, value: any) =>
        setEditForm(f => ({ ...f, [field]: value }));
    const handleEditTagToggle = (tag: string) =>
        setEditForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }));
    const handleSaveEdit = () => {
        if (!selected) return;
        const updated = { ...selected, ...editForm };
        setCustomers(prev => prev.map(c => c.id === selected.id ? updated : c));
        setSelected(updated);
        setEditMode(false);
    };

    // Handlers — Delete
    const handleDelete = (id: string) => {
        setCustomers(prev => prev.filter(c => c.id !== id));
        setDeleteConfirm(null);
        setSelected(null);
    };

    return (
        <AccessGuard permission="customers">
            <div className="flex h-screen bg-brand-bg text-brand-text font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <div className="max-w-[1600px] mx-auto space-y-6">

                            {/* Header */}
                            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h1 className="text-3xl font-black text-brand-text tracking-tight">Gestão de Clientes</h1>
                                    <p className="text-brand-muted text-sm font-medium mt-1">Cadastro, histórico e relacionamento com clientes</p>
                                </motion.div>
                                <button
                                    onClick={() => { setForm(blankCustomer()); setIsCreating(true); }}
                                    className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 self-start md:self-auto"
                                >
                                    <Plus className="size-4" /> Novo Cliente
                                </button>
                            </header>

                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {stats.map((s, idx) => (
                                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                                        className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                        <div className={`p-3 ${s.bg} ${s.color} rounded-xl shrink-0`}><s.icon className="size-5" /></div>
                                        <div>
                                            <p className="text-2xl font-black text-brand-text">{s.value}</p>
                                            <p className="text-xs text-brand-muted font-semibold uppercase tracking-wide">{s.label}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Search & Filters */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                className="bg-brand-card border border-brand-darkBorder rounded-2xl p-4 flex flex-wrap gap-3 items-center">
                                <div className="flex-1 min-w-[220px] relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
                                    <input type="text" placeholder="Buscar por nome, telefone ou email..."
                                        value={search} onChange={e => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {(["Todos", "Ativo", "Inativo"] as const).map(s => (
                                        <button key={s} onClick={() => setFilterStatus(s)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${filterStatus === s ? "bg-brand-primary text-white border-brand-primary" : "bg-brand-bg border-brand-darkBorder text-brand-muted hover:text-brand-text"}`}>
                                            {s}
                                        </button>
                                    ))}
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand-muted pointer-events-none" />
                                        <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
                                            className="pl-9 pr-8 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                            <option>Todos</option>
                                            {TAGS_OPTIONS.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand-muted pointer-events-none" />
                                        <select value={filterOrigin} onChange={e => setFilterOrigin(e.target.value)}
                                            className="pl-9 pr-8 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                            <option>Todos</option>
                                            {ORIGINS.map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <span className="text-xs text-brand-muted font-semibold whitespace-nowrap ml-auto">{filtered.length} cliente(s)</span>
                            </motion.div>

                            {/* Customer Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {filtered.length === 0 && (
                                        <div className="col-span-3 text-center py-16 text-brand-muted text-sm">Nenhum cliente encontrado.</div>
                                    )}
                                    {filtered.map((c, idx) => (
                                        <motion.div key={c.id}
                                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.04 }}
                                            className="bg-brand-card border border-brand-darkBorder rounded-2xl p-5 hover:border-brand-primary/40 transition-all group cursor-pointer flex flex-col gap-4"
                                            onClick={() => { setSelected(c); setEditMode(false); }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-11 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-lg shrink-0 border border-brand-primary/20">
                                                        {c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-brand-text text-sm group-hover:text-brand-primary transition-colors">{c.name}</p>
                                                        <p className="text-xs text-brand-muted mt-0.5 flex items-center gap-1"><Phone className="size-3" />{c.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                                                        {c.active ? "Ativo" : "Inativo"}
                                                    </span>
                                                    <span className="text-[10px] text-brand-muted font-medium">{c.origin}</span>
                                                </div>
                                            </div>
                                            {c.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {c.tags.map(tag => (
                                                        <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${TAG_COLORS[tag] || "bg-brand-primary/10 text-brand-primary border-brand-primary/30"}`}>{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="bg-brand-bg rounded-xl p-2 border border-brand-darkBorder">
                                                    <p className="text-sm font-black text-brand-text">{getCustomerOrders(c.name, orders).length}</p>
                                                    <p className="text-[10px] text-brand-muted font-semibold">Pedidos</p>
                                                </div>
                                                <div className="bg-brand-bg rounded-xl p-2 border border-brand-darkBorder">
                                                    <p className="text-sm font-black text-emerald-500">{formatCurrency(totalSpent(c.name, orders))}</p>
                                                    <p className="text-[10px] text-brand-muted font-semibold">Total gasto</p>
                                                </div>
                                                <div className="bg-brand-bg rounded-xl p-2 border border-brand-darkBorder">
                                                    <p className="text-sm font-black text-brand-primary">{formatCurrency(avgTicket(c.name, orders))}</p>
                                                    <p className="text-[10px] text-brand-muted font-semibold">Ticket médio</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-brand-muted">
                                                <span className="flex items-center gap-1"><Calendar className="size-3" />Cliente desde {c.createdAt.slice(0, 7).replace("-", "/")}</span>
                                                <span className="flex items-center gap-1 text-brand-primary font-semibold group-hover:translate-x-1 transition-transform">Ver Detalhes <ChevronRight className="size-3" /></span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                        </div>
                    </main>
                </div>

                {/* ── Modal: Criar cliente ── */}
                <AnimatePresence>
                    {isCreating && (
                        <EditPanel
                            key="create"
                            data={form}
                            onChange={handleFormChange}
                            onTagToggle={handleFormTagToggle}
                            onSave={handleCreate}
                            onCancel={() => setIsCreating(false)}
                            title="Cadastrar Cliente"
                        />
                    )}
                </AnimatePresence>

                {/* ── Modal: Detalhes ── */}
                <AnimatePresence>
                    {selected && !editMode && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-brand-card w-full max-w-2xl rounded-2xl border border-brand-darkBorder shadow-2xl flex flex-col max-h-[92vh]">
                                <div className="p-5 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black border border-brand-primary/20">
                                            {selected.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-brand-text">{selected.name}</h3>
                                            <p className="text-xs text-brand-muted">ID: {selected.id} · Cliente desde {selected.createdAt}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(selected)} title="Editar" className="p-2 bg-brand-bg border border-brand-darkBorder rounded-lg text-brand-muted hover:text-brand-primary transition-colors"><Edit3 className="size-4" /></button>
                                        <button onClick={() => setDeleteConfirm(selected.id)} title="Excluir" className="p-2 bg-brand-bg border border-brand-darkBorder rounded-lg text-brand-muted hover:text-rose-500 transition-colors"><Trash2 className="size-4" /></button>
                                        <button onClick={() => setSelected(null)} className="p-2 bg-brand-bg border border-brand-darkBorder rounded-lg text-brand-muted hover:text-brand-text"><X className="size-4" /></button>
                                    </div>
                                </div>
                                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { icon: Phone, label: "Telefone", val: selected.phone },
                                            { icon: Mail, label: "E-mail", val: selected.email },
                                            { icon: MapPin, label: "Endereço", val: selected.address || "—" },
                                            { icon: Building2, label: "Origem", val: selected.origin },
                                        ].map(({ icon: Icon, label, val }) => (
                                            <div key={label} className="p-3 bg-brand-bg border border-brand-darkBorder rounded-xl flex items-center gap-3">
                                                <div className="p-2 bg-white/5 border border-white/10 rounded-lg shrink-0"><Icon className="size-3.5 text-brand-muted" /></div>
                                                <div>
                                                    <p className="text-[10px] text-brand-muted uppercase font-bold">{label}</p>
                                                    <p className="text-sm font-semibold text-brand-text">{val || "—"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${selected.active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                                            {selected.active ? "✓ Ativo" : "✗ Inativo"}
                                        </span>
                                        {selected.tags.map(tag => (
                                            <span key={tag} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${TAG_COLORS[tag] || ""}`}>{tag}</span>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl text-center">
                                            <p className="text-2xl font-black text-brand-text">{getCustomerOrders(selected.name, orders).length}</p>
                                            <p className="text-xs text-brand-muted font-semibold">Pedidos</p>
                                        </div>
                                        <div className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl text-center">
                                            <p className="text-2xl font-black text-emerald-500">{formatCurrency(totalSpent(selected.name, orders))}</p>
                                            <p className="text-xs text-brand-muted font-semibold">Total gasto</p>
                                        </div>
                                        <div className="p-4 bg-brand-bg border border-brand-darkBorder rounded-xl text-center">
                                            <p className="text-2xl font-black text-brand-primary">{formatCurrency(avgTicket(selected.name, orders))}</p>
                                            <p className="text-xs text-brand-muted font-semibold">Ticket médio</p>
                                        </div>
                                    </div>
                                    {selected.notes && (
                                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                            <p className="text-[11px] font-bold uppercase text-amber-500 mb-1 flex items-center gap-1"><StickyNote className="size-3.5" />Observações</p>
                                            <p className="text-sm text-brand-text">{selected.notes}</p>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-2"><ShoppingBag className="size-3.5" />Histórico de Pedidos</h4>
                                        {getCustomerOrders(selected.name, orders).length === 0 ? (
                                            <p className="text-sm text-brand-muted text-center py-6 bg-brand-bg rounded-xl border border-brand-darkBorder">Nenhum pedido registrado ainda.</p>
                                        ) : (
                                            <div className="bg-brand-bg border border-brand-darkBorder rounded-xl overflow-hidden divide-y divide-brand-darkBorder">
                                                {getCustomerOrders(selected.name, orders).map((o: any) => (
                                                    <div key={o.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                                                        <div>
                                                            <p className="text-sm font-bold text-brand-text">{o.id}</p>
                                                            <p className="text-xs text-brand-muted">{o.createdAt} · {o.items[0]?.service || "N/A"}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-bold text-emerald-500">{formatCurrency(o.items.reduce((sum: number, i: any) => sum + (i.qty * i.unitPrice), 0))}</span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${o.status === "Entregue" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : o.status === "Cancelado" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-brand-primary/10 text-brand-primary border-brand-primary/20"}`}>{o.status}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Modal: Editar ── */}
                <AnimatePresence>
                    {selected && editMode && (
                        <EditPanel
                            key="edit"
                            data={editForm}
                            onChange={handleEditChange}
                            onTagToggle={handleEditTagToggle}
                            onSave={handleSaveEdit}
                            onCancel={() => setEditMode(false)}
                            title="Editar Cliente"
                        />
                    )}
                </AnimatePresence>

                {/* ── Modal: Confirmação de exclusão ── */}
                <AnimatePresence>
                    {deleteConfirm && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-brand-card w-full max-w-sm rounded-2xl border border-rose-500/20 shadow-2xl p-6 text-center space-y-4">
                                <div className="mx-auto size-14 bg-rose-500/10 rounded-full flex items-center justify-center">
                                    <Trash2 className="size-6 text-rose-500" />
                                </div>
                                <h3 className="text-lg font-bold text-brand-text">Excluir cliente?</h3>
                                <p className="text-sm text-brand-muted">Esta ação não pode ser desfeita. O cliente e seu histórico serão removidos.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-brand-darkBorder rounded-xl font-bold text-brand-text text-sm hover:bg-white/5 transition-all">Cancelar</button>
                                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all">Excluir</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>


                <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
            `}</style>
            </div>
        </AccessGuard>
    );
}
