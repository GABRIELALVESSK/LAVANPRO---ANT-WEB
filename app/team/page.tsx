"use client";

import { Sidebar } from "@/components/sidebar";
import {
    Users, Search, Plus, X, Phone, Mail, MapPin,
    CheckCircle2, Edit3, Trash2, Calendar, Shield,
    UserCircle, ShieldCheck, Building2, TrendingUp,
    ToggleLeft, ToggleRight, Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "Administrador" | "Gerente" | "Atendente" | "Operador de Máquinas" | "Motorista";

interface Staff {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    unit: string;
    active: boolean;
    hasSystemAccess: boolean; // Controls login permission
    processedOrders: number;   // Productivity placeholder
    joinDate: string;
}

type StaffFormData = Omit<Staff, "id" | "processedOrders" | "joinDate">;

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES: Role[] = ["Administrador", "Gerente", "Atendente", "Operador de Máquinas", "Motorista"];
const UNITS = ["Matriz Centro", "Filial Jardins", "Filial Pinheiros", "Todas as Unidades"];

// ─── Seed data ────────────────────────────────────────────────────────────────
const seedStaff: Staff[] = [
    {
        id: "USR-001", name: "Gabriel Alves", email: "gabriel23900@gmail.com", phone: "(11) 98888-0001",
        role: "Administrador", unit: "Todas as Unidades", active: true, hasSystemAccess: true, processedOrders: 1450, joinDate: "2025-01-10"
    },
    {
        id: "USR-002", name: "Ana Beatriz", email: "ana.beatriz@lavanpro.com", phone: "(11) 98888-0002",
        role: "Gerente", unit: "Matriz Centro", active: true, hasSystemAccess: true, processedOrders: 840, joinDate: "2025-03-15"
    },
    {
        id: "USR-003", name: "Carlos Magno", email: "carlos@lavanpro.com", phone: "(11) 98888-0003",
        role: "Operador de Máquinas", unit: "Matriz Centro", active: true, hasSystemAccess: false, processedOrders: 2310, joinDate: "2025-04-01"
    },
    {
        id: "USR-004", name: "Ricardo Santos", email: "ricardo@lavanpro.com", phone: "(11) 98888-0004",
        role: "Motorista", unit: "Filial Jardins", active: true, hasSystemAccess: false, processedOrders: 950, joinDate: "2025-08-20"
    },
    {
        id: "USR-005", name: "Marta Nogueira", email: "marta@lavanpro.com", phone: "(11) 98888-0005",
        role: "Atendente", unit: "Filial Pinheiros", active: false, hasSystemAccess: false, processedOrders: 420, joinDate: "2025-09-10"
    },
];

const blankStaff = (): StaffFormData => ({
    name: "", email: "", phone: "", role: "Atendente", unit: UNITS[0], active: true, hasSystemAccess: false
});

// ─────────────────────────────────────────────────────────────────────────────
// Staff Modal
// ─────────────────────────────────────────────────────────────────────────────
interface StaffModalProps {
    data: StaffFormData;
    onChange: (field: keyof StaffFormData, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
    title: string;
}

function StaffModal({ data, onChange, onSave, onCancel, title }: StaffModalProps) {
    const isAdmin = data.role === "Administrador" || data.role === "Gerente";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-brand-card w-full max-w-xl rounded-2xl border border-brand-darkBorder shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                    <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                        {data.role === "Administrador" ? <ShieldCheck className="size-5 text-brand-primary" /> : <UserCircle className="size-5 text-brand-primary" />}
                        {title}
                    </h3>
                    <button onClick={onCancel} className="text-brand-muted hover:text-brand-text bg-brand-bg p-2 rounded-lg border border-brand-darkBorder">
                        <X className="size-4" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    {/* Basic Info */}
                    <section className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2"><UserCircle className="size-3.5" /> Informações Pessoais</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Nome Completo</label>
                                <input type="text" placeholder="Ex: João da Silva" value={data.name} onChange={e => onChange("name", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">E-mail Profissional</label>
                                <input type="email" placeholder="joao@empresa.com" value={data.email} onChange={e => onChange("email", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Celular / WhatsApp</label>
                                <input type="text" placeholder="(11) 9 0000-0000" value={data.phone} onChange={e => onChange("phone", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-brand-darkBorder" />

                    {/* Operational */}
                    <section className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2"><Building2 className="size-3.5" /> Papel Operacional</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Perfil de Cargo</label>
                                <select value={data.role} onChange={e => onChange("role", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                    {ROLES.map(r => <option key={r} value={r} className="bg-brand-card">{r}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Unidade de Vínculo</label>
                                <select value={data.unit} onChange={e => onChange("unit", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                    {UNITS.map(u => <option key={u} value={u} className="bg-brand-card">{u}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-brand-darkBorder" />

                    {/* Settings & Access */}
                    <section className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2"><Shield className="size-3.5" /> Acesso e Status</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => onChange("hasSystemAccess", !data.hasSystemAccess)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${data.hasSystemAccess ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" : "bg-brand-bg border-brand-darkBorder text-brand-muted"}`}
                            >
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-sm font-bold flex items-center gap-1.5"><ShieldCheck className="size-4" /> Acesso ao Sistema</span>
                                    <span className="text-[10px] opacity-70">Pode fazer login no painel</span>
                                </div>
                                {data.hasSystemAccess ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => onChange("active", !data.active)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${data.active ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500"}`}
                            >
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-sm font-bold flex items-center gap-1.5"><UserCircle className="size-4" /> Colaborador Ativo</span>
                                    <span className="text-[10px] opacity-70">Pode receber ordens de serviço</span>
                                </div>
                                {data.active ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                            </button>
                        </div>
                        {isAdmin && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-500">
                                <Shield className="size-4 shrink-0 mt-0.5" />
                                <p className="text-xs font-semibold leading-relaxed">
                                    Ao vincular um perfil de Administrador ou Gerente, este colaborador terá acesso avançado (financeiro, relatórios, configurações e gestão de equipe).
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="p-5 border-t border-brand-darkBorder">
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={!data.name || (data.hasSystemAccess && !data.email)}
                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle2 className="size-4" /> Salvar Colaborador
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TeamPage() {
    const [staffList, setStaffList] = useState<Staff[]>(seedStaff);

    // Filters
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("Todos");
    const [filterUnit, setFilterUnit] = useState("Todas");
    const [filterStatus, setFilterStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<StaffFormData>(blankStaff());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Handlers
    const handleFormChange = (field: keyof StaffFormData, value: any) => setForm(f => ({ ...f, [field]: value }));

    const handleSave = () => {
        if (!form.name) return;
        if (editingId) {
            setStaffList(prev => prev.map(s => s.id === editingId ? { ...s, ...form } : s));
        } else {
            const id = `USR-${String(staffList.length + 1).padStart(3, "0")}`;
            const joinDate = new Date().toISOString().slice(0, 10);
            setStaffList(prev => [{ ...form, id, processedOrders: 0, joinDate }, ...prev]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        setStaffList(prev => prev.filter(s => s.id !== id));
        setDeleteConfirmId(null);
    };

    const openEdit = (s: Staff) => {
        setForm(s);
        setEditingId(s.id);
        setIsModalOpen(true);
    };

    const openNew = () => {
        setForm(blankStaff());
        setEditingId(null);
        setIsModalOpen(true);
    };

    // Computations
    const filteredStaff = useMemo(() => {
        const q = search.toLowerCase();
        return staffList.filter(s => {
            const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q);
            const matchRole = filterRole === "Todos" || s.role === filterRole;
            const matchUnit = filterUnit === "Todas" || s.unit === filterUnit;
            const matchStatus = filterStatus === "Todos" || (filterStatus === "Ativo" ? s.active : !s.active);
            return matchSearch && matchRole && matchUnit && matchStatus;
        });
    }, [staffList, search, filterRole, filterUnit, filterStatus]);

    const stats = {
        total: staffList.length,
        active: staffList.filter(s => s.active).length,
        admins: staffList.filter(s => s.role === "Administrador" || s.role === "Gerente").length,
        mostProductive: [...staffList].sort((a, b) => b.processedOrders - a.processedOrders)[0]
    };

    return (
        <div className="flex h-screen bg-brand-bg text-brand-text font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto space-y-6">

                        {/* Header */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <h1 className="text-3xl font-black text-brand-text tracking-tight">Gestão de Equipe</h1>
                                <p className="text-brand-muted text-sm font-medium mt-1">Colaboradores, permissões de acesso e controle operacional</p>
                            </motion.div>
                            <button
                                onClick={openNew}
                                className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 self-start md:self-auto"
                            >
                                <Plus className="size-4" /> Novo Colaborador
                            </button>
                        </header>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }} className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0"><Users className="size-5" /></div>
                                <div>
                                    <p className="text-2xl font-black text-brand-text">{stats.total}</p>
                                    <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Total Equipe</p>
                                </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0"><CheckCircle2 className="size-5" /></div>
                                <div>
                                    <p className="text-2xl font-black text-brand-text">{stats.active}</p>
                                    <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Ativos</p>
                                </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0"><Shield className="size-5" /></div>
                                <div>
                                    <p className="text-2xl font-black text-brand-text">{stats.admins}</p>
                                    <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Administradores</p>
                                </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0"><TrendingUp className="size-5" /></div>
                                <div className="truncate w-full pr-2">
                                    <p className="text-sm font-black text-brand-text truncate">{stats.mostProductive?.name || "—"}</p>
                                    <p className="text-xs text-brand-muted font-bold uppercase tracking-wider truncate cursor-help" title={`${stats.mostProductive?.processedOrders || 0} pedidos processados`}>Tops Produtividade</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Search & Filters */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-brand-card border border-brand-darkBorder rounded-2xl p-4 flex flex-wrap gap-3 items-center">
                            <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-darkBorder relative w-full sm:w-auto overflow-x-auto custom-scrollbar">
                                {(["Todos", "Ativo", "Inativo"] as const).map(s => (
                                    <button key={s} onClick={() => setFilterStatus(s)}
                                        className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all relative z-10 whitespace-nowrap ${filterStatus === s ? "text-white" : "text-brand-muted hover:text-brand-text"}`}>
                                        {filterStatus === s && <motion.div layoutId="teamStatus" className="absolute inset-0 bg-brand-primary rounded-lg -z-10 shadow-sm" />}
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <Settings className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand-muted" />
                                <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                                    className="pl-9 pr-8 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-text appearance-none hover:border-brand-primary/50 transition-colors">
                                    <option>Todos</option>
                                    {ROLES.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>

                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand-muted" />
                                <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)}
                                    className="pl-9 pr-8 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-text appearance-none hover:border-brand-primary/50 transition-colors">
                                    <option>Todas</option>
                                    {UNITS.map(u => <option key={u}>{u}</option>)}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[200px] relative ml-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
                                <input type="text" placeholder="Buscar colaborador..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                            </div>
                        </motion.div>

                        {/* Staff Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {filteredStaff.length === 0 && (
                                    <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-16 text-brand-muted text-sm border border-brand-darkBorder rounded-2xl bg-brand-card">
                                        Nenhum colaborador encontrado com estes filtros.
                                    </div>
                                )}
                                {filteredStaff.map((staff, idx) => (
                                    <motion.div key={staff.id}
                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.04 }}
                                        className={`bg-brand-card border ${staff.active ? "border-brand-darkBorder" : "border-rose-500/20 bg-rose-500/5"} rounded-2xl p-5 hover:border-brand-primary/40 transition-all group flex flex-col gap-4 relative overflow-hidden`}
                                    >
                                        {!staff.active && <div className="absolute inset-0 bg-brand-bg/50 backdrop-blur-[1px] -z-10 pointer-events-none" />}

                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className={`size-12 rounded-full flex items-center justify-center font-black text-lg border ${staff.role === "Administrador" || staff.role === "Gerente" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-brand-primary/10 text-brand-primary border-brand-primary/20"}`}>
                                                        {staff.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                    </div>
                                                    {staff.hasSystemAccess && (
                                                        <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-brand-card rounded-full" title="Tem acesso ao sistema" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-brand-text text-sm group-hover:text-brand-primary transition-colors flex items-center gap-1.5 line-clamp-1">{staff.name}</p>
                                                    <p className="text-[10px] text-brand-muted font-bold uppercase mt-0.5 tracking-wider">{staff.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(staff)} className="p-1.5 bg-brand-bg rounded-lg text-brand-muted hover:text-brand-primary hover:border-brand-primary/30 border border-brand-darkBorder transition-all"><Edit3 className="size-3.5" /></button>
                                                <button onClick={() => setDeleteConfirmId(staff.id)} className="p-1.5 bg-brand-bg rounded-lg text-brand-muted hover:text-rose-500 hover:border-rose-500/30 border border-brand-darkBorder transition-all"><Trash2 className="size-3.5" /></button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-xs text-brand-muted mt-2">
                                            <div className="flex items-center gap-2"><Mail className="size-3.5" /> <span className="line-clamp-1">{staff.email || "—"}</span></div>
                                            <div className="flex items-center gap-2"><Phone className="size-3.5" /> <span>{staff.phone || "—"}</span></div>
                                            <div className="flex items-center gap-2"><MapPin className="size-3.5" /> <span className="font-semibold text-brand-text">{staff.unit}</span></div>
                                        </div>

                                        <div className="h-px bg-brand-darkBorder my-1" />

                                        <div className="flex items-center justify-between mt-auto">
                                            <div title="Pedidos Processados">
                                                <p className="text-[10px] uppercase font-bold text-brand-muted">Produtividade</p>
                                                <p className="text-sm font-black text-brand-primary flex items-center gap-1"><TrendingUp className="size-3.5" /> {staff.processedOrders} <span className="text-[10px] font-semibold text-brand-muted ml-0.5">OS</span></p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${staff.active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                                                    {staff.active ? "ATIVO" : "INATIVO"}
                                                </span>
                                                <p className="text-[9px] text-brand-muted mt-1 uppercase">Entrou {staff.joinDate.slice(0, 7)}</p>
                                            </div>
                                        </div>

                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <StaffModal
                        key="staff-modal"
                        data={form}
                        onChange={handleFormChange}
                        onSave={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                        title={editingId ? "Editar Colaborador" : "Novo Colaborador"}
                    />
                )}
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-brand-card w-full max-w-sm rounded-2xl border border-rose-500/20 shadow-2xl p-6 text-center space-y-4">
                            <div className="mx-auto size-14 bg-rose-500/10 rounded-full flex items-center justify-center">
                                <Trash2 className="size-6 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-bold text-brand-text">Desligar / Excluir?</h3>
                            <p className="text-sm text-brand-muted">Recomendamos apenas desativar (Tornar Inativo) para preservar os relatórios de produtividade. Tem certeza que deseja excluir?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 border border-brand-darkBorder rounded-xl font-bold text-brand-text text-sm hover:bg-white/5 transition-all">Cancelar</button>
                                <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all">Excluir Base</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
            `}</style>
        </div>
    );
}
