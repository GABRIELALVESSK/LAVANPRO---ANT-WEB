"use client";

import { Sidebar, MobileHeader } from "@/components/sidebar";
import { AccessGuard } from "@/components/access-guard";
import { PlanGuard } from "@/components/plan-guard";
import { UnitSelector } from "@/components/unit-selector";
import {
    Users, Search, Plus, X, Phone, Mail, MapPin,
    CheckCircle2, Edit3, Trash2, Calendar, Shield,
    UserCircle, ShieldCheck, Building2, TrendingUp,
    ToggleLeft, ToggleRight, Settings, Loader2, AlertTriangle,
    Lock, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
    type Staff, type StaffFormData, type Role,
    ROLES, blankStaff,
    fetchStaff, createStaff, updateStaff, deleteStaff
} from "@/lib/staffService";
import { type Unit } from "@/lib/units-data";
import { useSubscription } from "@/hooks/useSubscription";
import { useUnit } from "@/hooks/useUnit";
import { useBusinessData } from "@/components/business-data-provider";

// ─── Toast ────────────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: "success" | "error" }

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-xl text-sm font-semibold ${t.type === "success"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                            : "bg-rose-500/15 border-rose-500/30 text-rose-500"
                            }`}
                    >
                        {t.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertTriangle className="size-4 shrink-0" />}
                        <span>{t.message}</span>
                        <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity"><X className="size-3.5" /></button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
    return (
        <div className="bg-brand-card border border-brand-darkBorder rounded-2xl p-5 animate-pulse flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-brand-darkBorder" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-brand-darkBorder rounded-lg w-3/4" />
                    <div className="h-3 bg-brand-darkBorder rounded-lg w-1/2" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-brand-darkBorder rounded-lg w-full" />
                <div className="h-3 bg-brand-darkBorder rounded-lg w-2/3" />
                <div className="h-3 bg-brand-darkBorder rounded-lg w-1/2" />
            </div>
            <div className="h-px bg-brand-darkBorder" />
            <div className="flex justify-between">
                <div className="h-4 bg-brand-darkBorder rounded-lg w-20" />
                <div className="h-5 bg-brand-darkBorder rounded-full w-14" />
            </div>
        </div>
    );
}

// ─── Staff Modal ──────────────────────────────────────────────────────────────
interface StaffModalProps {
    data: StaffFormData;
    units: Unit[];
    onChange: (field: keyof StaffFormData, value: string | boolean) => void;
    onSave: () => void;
    onCancel: () => void;
    title: string;
    saving: boolean;
}

function StaffModal({ data, units, onChange, onSave, onCancel, title, saving }: StaffModalProps) {
    const isAdmin = data.role === "Administrador" || data.role === "Gerente";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-brand-card w-full max-w-xl rounded-2xl border border-brand-darkBorder shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-5 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                    <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                        {data.role === "Administrador" ? <ShieldCheck className="size-5 text-brand-primary" /> : <UserCircle className="size-5 text-brand-primary" />}
                        {title}
                    </h3>
                    <button onClick={onCancel} className="text-brand-muted hover:text-brand-text bg-brand-bg p-2 rounded-lg border border-brand-darkBorder transition-colors">
                        <X className="size-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    {/* Personal Info */}
                    <section className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2"><UserCircle className="size-3.5" /> Informações Pessoais</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Nome Completo *</label>
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
                                    <option value="" className="bg-brand-card">Selecionar Unidade...</option>
                                    <option value="Todas as Unidades" className="bg-brand-card">Todas as Unidades</option>
                                    {units.map(u => <option key={u.id} value={u.name} className="bg-brand-card">{u.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-brand-darkBorder" />

                    {/* Access & Status */}
                    <section className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-2"><Shield className="size-3.5" /> Acesso e Status</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button type="button" onClick={() => onChange("has_system_access", !data.has_system_access)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${data.has_system_access ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" : "bg-brand-bg border-brand-darkBorder text-brand-muted"}`}>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-sm font-bold flex items-center gap-1.5"><ShieldCheck className="size-4" /> Acesso ao Sistema</span>
                                    <span className="text-[10px] opacity-70">Pode fazer login no painel</span>
                                </div>
                                {data.has_system_access ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                            </button>

                            <button type="button" onClick={() => onChange("active", !data.active)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${data.active ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500"}`}>
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

                {/* Footer */}
                <div className="p-5 border-t border-brand-darkBorder">
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={!data.name || (data.has_system_access && !data.email) || saving}
                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                        {saving ? "Salvando..." : "Salvar Colaborador"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Productivity Bar ─────────────────────────────────────────────────────────
function ProductivityBar({ value, max }: { value: number; max: number }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="w-full h-1.5 bg-brand-darkBorder rounded-full overflow-hidden mt-1">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-brand-primary to-blue-500 rounded-full"
            />
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function TeamPage() {
    // Data state
    const { unitId: globalUnitId } = useUnit();
    const { data: businessData } = useBusinessData();
    const units = (businessData.units || []) as Unit[];
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { plan, isEnterprise } = useSubscription();

    // Plan limits
    const USER_LIMITS = {
        free: 1,
        pro: 5,
        enterprise: Infinity,
    };
    const currentLimit = USER_LIMITS[plan] || 1;
    const isLimitReached = staffList.length >= currentLimit;

    // Toasts
    const [toasts, setToasts] = useState<Toast[]>([]);
    const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);
    const dismissToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

    // Filters
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("Todos");
    const [filterUnit, setFilterUnit] = useState("Todas");
    const [filterStatus, setFilterStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos");

    // Sync local filter with global sidebar
    useEffect(() => {
        if (!globalUnitId || globalUnitId === "all") {
            setFilterUnit("Todas");
        } else {
            const unit = units.find(u => u.id === globalUnitId);
            if (unit) setFilterUnit(unit.name);
        }
    }, [globalUnitId, units]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<StaffFormData>(blankStaff());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // ─── Load data ──────────────────────────────────────────────────────────
    const loadStaff = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchStaff(globalUnitId);
            setStaffList(data);
        } catch (err) {
            console.error("Erro ao carregar equipe:", err);
            addToast("Erro ao carregar equipe. Tente novamente.", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast, globalUnitId]);

    useEffect(() => { loadStaff(); }, [loadStaff]);

    // ─── Handlers ───────────────────────────────────────────────────────────
    const handleFormChange = (field: keyof StaffFormData, value: string | boolean) =>
        setForm(f => ({ ...f, [field]: value }));

    const handleSave = async () => {
        if (!form.name) return;

        // Final guard against plan limits for NEW staff
        if (!editingId && isLimitReached) {
            addToast(`Limite de ${currentLimit} colaboradores atingido no plano ${plan.toUpperCase()}. Faça upgrade!`, "error");
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                const updated = await updateStaff(editingId, form);
                setStaffList(prev => prev.map(s => s.id === editingId ? updated : s));
                addToast(`${form.name} atualizado com sucesso!`);
            } else {
                const created = await createStaff(form);
                setStaffList(prev => [created, ...prev]);
                addToast(`${form.name} cadastrado com sucesso!`);
            }
            setIsModalOpen(false);
            setEditingId(null);
        } catch (err) {
            console.error("Erro ao salvar:", err);
            addToast("Erro ao salvar colaborador. Verifique os dados.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const staffName = staffList.find(s => s.id === id)?.name || "";
        try {
            await deleteStaff(id);
            setStaffList(prev => prev.filter(s => s.id !== id));
            addToast(`${staffName} removido da base.`);
        } catch (err) {
            console.error("Erro ao excluir:", err);
            addToast("Erro ao excluir colaborador.", "error");
        }
        setDeleteConfirmId(null);
    };

    const handleToggleActive = async (staff: Staff) => {
        const newActive = !staff.active;
        try {
            const updated = await updateStaff(staff.id, { active: newActive });
            setStaffList(prev => prev.map(s => s.id === staff.id ? updated : s));
            addToast(`${staff.name} ${newActive ? "ativado" : "desativado"}.`);
        } catch (err) {
            console.error("Erro ao alterar status:", err);
            addToast("Erro ao alterar status.", "error");
        }
    };

    const openEdit = (s: Staff) => {
        setForm({
            name: s.name,
            email: s.email || "",
            phone: s.phone || "",
            role: s.role,
            unit: s.unit,
            active: s.active,
            has_system_access: s.has_system_access,
        });
        setEditingId(s.id);
        setIsModalOpen(true);
    };

    const openNew = () => {
        setForm(blankStaff());
        setEditingId(null);
        setIsModalOpen(true);
    };

    // ─── Computed ───────────────────────────────────────────────────────────
    const maxOrders = useMemo(() => Math.max(...staffList.map(s => s.processed_orders), 1), [staffList]);

    const filteredStaff = useMemo(() => {
        const q = search.toLowerCase();
        return staffList.filter(s => {
            const matchSearch = !q || s.name.toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q) || (s.phone || "").includes(q);
            const matchRole = filterRole === "Todos" || s.role === filterRole;
            const matchUnit = filterUnit === "Todas" || s.unit === filterUnit;
            const matchStatus = filterStatus === "Todos" || (filterStatus === "Ativo" ? s.active : !s.active);
            return matchSearch && matchRole && matchUnit && matchStatus;
        });
    }, [staffList, search, filterRole, filterUnit, filterStatus]);

    const stats = useMemo(() => ({
        total: staffList.length,
        active: staffList.filter(s => s.active).length,
        admins: staffList.filter(s => s.role === "Administrador" || s.role === "Gerente").length,
        mostProductive: [...staffList].sort((a, b) => b.processed_orders - a.processed_orders)[0] || null
    }), [staffList]);

    // ─── Role badge colors ──────────────────────────────────────────────────
    const roleBadge = (role: Role) => {
        switch (role) {
            case "Administrador": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "Gerente": return "bg-violet-500/10 text-violet-500 border-violet-500/20";
            case "Atendente": return "bg-sky-500/10 text-sky-500 border-sky-500/20";
            case "Operador de Máquinas": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Motorista": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            default: return "bg-brand-primary/10 text-brand-primary border-brand-primary/20";
        }
    };

    const avatarColors = (role: Role) => {
        if (role === "Administrador" || role === "Gerente")
            return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        return "bg-brand-primary/10 text-brand-primary border-brand-primary/20";
    };

    return (
        <AccessGuard permission="team">
            <div className="flex min-h-screen bg-brand-bg text-brand-text font-sans">
                <Sidebar />
                <PlanGuard moduleName="Equipe" requiredPlan="pro">
                    <div className="flex-1 flex flex-col h-screen overflow-hidden">
                        <MobileHeader title="Equipe" />
                        <main className="flex-1 overflow-y-auto responsive-px py-6 lg:py-8 custom-scrollbar">
                            <div className="max-w-[1600px] mx-auto space-y-6 safe-bottom">

                                {/* Header */}
                                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                        <h1 className="text-3xl font-black text-brand-text tracking-tight">Gestão de Equipe</h1>
                                        <p className="text-brand-muted text-sm font-medium mt-1">Colaboradores, permissões de acesso e controle operacional</p>
                                    </motion.div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="w-full sm:w-64">
                                            <UnitSelector />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <button
                                                onClick={openNew}
                                                disabled={isLimitReached}
                                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 self-start md:self-auto ${isLimitReached
                                                    ? "bg-brand-darkBorder text-brand-muted cursor-not-allowed grayscale"
                                                    : "bg-brand-primary text-white hover:bg-brand-primaryHover shadow-brand-primary/20"
                                                    }`}
                                            >
                                                {isLimitReached ? <Lock className="size-4" /> : <Plus className="size-4" />}
                                                Novo Colaborador
                                            </button>
                                            {isLimitReached && (
                                                <p className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5 animate-pulse">
                                                    <Sparkles className="size-3" />
                                                    Limite de {currentLimit} usuários no plano {plan.toUpperCase()} atingido
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </header>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }}
                                        className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                        <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0"><Users className="size-5" /></div>
                                        <div>
                                            <p className="text-2xl font-black text-brand-text">{loading ? "—" : stats.total}</p>
                                            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Total Equipe</p>
                                        </div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                        className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0"><CheckCircle2 className="size-5" /></div>
                                        <div>
                                            <p className="text-2xl font-black text-brand-text">{loading ? "—" : stats.active}</p>
                                            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Ativos</p>
                                        </div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0"><Shield className="size-5" /></div>
                                        <div>
                                            <p className="text-2xl font-black text-brand-text">{loading ? "—" : stats.admins}</p>
                                            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Administradores</p>
                                        </div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                        className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0"><TrendingUp className="size-5" /></div>
                                        <div className="truncate w-full pr-2">
                                            <p className="text-sm font-black text-brand-text truncate">{loading ? "—" : (stats.mostProductive?.name || "—")}</p>
                                            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider truncate cursor-help"
                                                title={`${stats.mostProductive?.processed_orders || 0} pedidos processados`}>
                                                Top Produtividade
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Filters */}
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                    className="bg-brand-card border border-brand-darkBorder rounded-2xl p-4 flex flex-wrap gap-3 items-center">
                                    {/* Status pills */}
                                    <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-darkBorder relative w-full sm:w-auto overflow-x-auto custom-scrollbar">
                                        {(["Todos", "Ativo", "Inativo"] as const).map(s => (
                                            <button key={s} onClick={() => setFilterStatus(s)}
                                                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all relative z-10 whitespace-nowrap ${filterStatus === s ? "text-white" : "text-brand-muted hover:text-brand-text"}`}>
                                                {filterStatus === s && <motion.div layoutId="teamStatus" className="absolute inset-0 bg-brand-primary rounded-lg -z-10 shadow-sm" />}
                                                {s}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Role filter */}
                                    <div className="relative">
                                        <Settings className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand-muted" />
                                        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                                            className="pl-9 pr-8 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-text appearance-none hover:border-brand-primary/50 transition-colors">
                                            <option>Todos</option>
                                            {ROLES.map(r => <option key={r}>{r}</option>)}
                                        </select>
                                    </div>

                                    {/* Unit filter */}
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand-muted" />
                                        <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)}
                                            className="pl-9 pr-8 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-text appearance-none hover:border-brand-primary/50 transition-colors">
                                            <option>Todas</option>
                                            {units.map(u => <option key={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Search */}
                                    <div className="flex-1 min-w-[200px] relative ml-auto">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
                                        <input type="text" placeholder="Buscar colaborador..."
                                            value={search} onChange={e => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                                    </div>
                                </motion.div>

                                {/* Staff Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {loading ? (
                                        Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                                    ) : (
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

                                                    {/* Top row: avatar + name + actions */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className={`size-12 rounded-full flex items-center justify-center font-black text-lg border ${avatarColors(staff.role)}`}>
                                                                    {staff.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                                </div>
                                                                {staff.has_system_access && (
                                                                    <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-brand-card rounded-full" title="Tem acesso ao sistema" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-brand-text text-sm group-hover:text-brand-primary transition-colors flex items-center gap-1.5 line-clamp-1">{staff.name}</p>
                                                                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${roleBadge(staff.role)}`}>
                                                                    {staff.role}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleToggleActive(staff)}
                                                                className={`p-1.5 bg-brand-bg rounded-lg border border-brand-darkBorder transition-all ${staff.active ? "text-emerald-500 hover:border-emerald-500/30" : "text-rose-500 hover:border-rose-500/30"}`}
                                                                title={staff.active ? "Desativar" : "Ativar"}>
                                                                {staff.active ? <ToggleRight className="size-3.5" /> : <ToggleLeft className="size-3.5" />}
                                                            </button>
                                                            <button onClick={() => openEdit(staff)} className="p-1.5 bg-brand-bg rounded-lg text-brand-muted hover:text-brand-primary hover:border-brand-primary/30 border border-brand-darkBorder transition-all"><Edit3 className="size-3.5" /></button>
                                                            <button onClick={() => setDeleteConfirmId(staff.id)} className="p-1.5 bg-brand-bg rounded-lg text-brand-muted hover:text-rose-500 hover:border-rose-500/30 border border-brand-darkBorder transition-all"><Trash2 className="size-3.5" /></button>
                                                        </div>
                                                    </div>

                                                    {/* Contact info */}
                                                    <div className="space-y-2 text-xs text-brand-muted">
                                                        <div className="flex items-center gap-2"><Mail className="size-3.5 shrink-0" /> <span className="line-clamp-1">{staff.email || "—"}</span></div>
                                                        <div className="flex items-center gap-2"><Phone className="size-3.5 shrink-0" /> <span>{staff.phone || "—"}</span></div>
                                                        <div className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0" /> <span className="font-semibold text-brand-text">{staff.unit || "Não vinculada"}</span></div>
                                                    </div>

                                                    <div className="h-px bg-brand-darkBorder my-1" />

                                                    {/* Bottom row: productivity + status */}
                                                    <div className="flex items-end justify-between mt-auto">
                                                        <div className="flex-1 mr-4" title="Pedidos Processados">
                                                            <p className="text-[10px] uppercase font-bold text-brand-muted">Produtividade</p>
                                                            <p className="text-sm font-black text-brand-primary flex items-center gap-1">
                                                                <TrendingUp className="size-3.5" /> {staff.processed_orders}
                                                                <span className="text-[10px] font-semibold text-brand-muted ml-0.5">OS</span>
                                                            </p>
                                                            <ProductivityBar value={staff.processed_orders} max={maxOrders} />
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${staff.active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                                                                {staff.active ? "ATIVO" : "INATIVO"}
                                                            </span>
                                                            <p className="text-[9px] text-brand-muted mt-1 uppercase flex items-center gap-1 justify-end">
                                                                <Calendar className="size-3" />
                                                                {staff.join_date ? new Date(staff.join_date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </PlanGuard>

                {/* ── Modals ── */}
                <AnimatePresence>
                    {isModalOpen && (
                        <StaffModal
                            key="staff-modal"
                            data={form}
                            units={units}
                            onChange={handleFormChange}
                            onSave={handleSave}
                            onCancel={() => { setIsModalOpen(false); setEditingId(null); }}
                            title={editingId ? "Editar Colaborador" : "Novo Colaborador"}
                            saving={saving}
                        />
                    )}
                    {deleteConfirmId && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-brand-card w-full max-w-sm rounded-2xl border border-rose-500/20 shadow-2xl p-6 text-center space-y-4">
                                <div className="mx-auto size-14 bg-rose-500/10 rounded-full flex items-center justify-center">
                                    <Trash2 className="size-6 text-rose-500" />
                                </div>
                                <h3 className="text-lg font-bold text-brand-text">Desligar / Excluir?</h3>
                                <p className="text-sm text-brand-muted">Recomendamos apenas desativar (Tornar Inativo) para preservar os relatórios de produtividade. Tem certeza que deseja excluir permanentemente?</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 border border-brand-darkBorder rounded-xl font-bold text-brand-text text-sm hover:bg-white/5 transition-all">Cancelar</button>
                                    <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all">Excluir Base</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Toast Notifications */}
                <ToastContainer toasts={toasts} onDismiss={dismissToast} />

                <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
            `}</style>
            </div>
        </AccessGuard>
    );
}
