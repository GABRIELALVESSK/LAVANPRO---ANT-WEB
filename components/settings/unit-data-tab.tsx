"use client";

import { useState, useEffect } from "react";
import { 
    MapPin, Plus, Edit2, Trash2, CheckCircle2, 
    XCircle, Shield, Building2, Clock, Map, User, Phone, Mail, FileText,
    ArrowRight, Lock, Crown
} from "lucide-react";
import { Unit, DEFAULT_OPENING_HOURS, getUnits, saveUnits } from "@/lib/units-data";
import { pushDataToServer } from "@/lib/dataSync";
import { motion, AnimatePresence } from "framer-motion";

interface UnitDataTabProps {
    currentPlan: string;
}

const DAYS = [
    { key: "mon", label: "Segunda-feira" },
    { key: "tue", label: "Terça-feira" },
    { key: "wed", label: "Quarta-feira" },
    { key: "thu", label: "Quinta-feira" },
    { key: "fri", label: "Sexta-feira" },
    { key: "sat", label: "Sábado" },
    { key: "sun", label: "Domingo" },
];

export function UnitDataTab({ currentPlan }: UnitDataTabProps) {
    const isEnterprise = currentPlan === "enterprise";
    const [units, setUnits] = useState<Unit[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Partial<Unit> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setUnits(getUnits());
    }, []);

    const handleNewUnit = () => {
        if (!isEnterprise && units.length >= 1) {
            // Should be handled by UI block, but double check
            return;
        }
        setEditingUnit({
            id: `unit_${Math.random().toString(36).substring(2, 9)}`,
            name: "",
            slug: "",
            phone: "",
            email: "",
            street: "",
            number: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
            openingHours: DEFAULT_OPENING_HOURS,
            responsible: "",
            status: 'active',
            isMain: units.length === 0,
            createdAt: new Date().toISOString(),
        });
        setIsEditing(true);
    };

    const handleEdit = (unit: Unit) => {
        setEditingUnit(unit);
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir esta unidade? Esta ação é irreversível e pode afetar pedidos vinculados.")) {
            const newList = units.filter(u => u.id !== id);
            setUnits(newList);
            saveUnits(newList);
            pushDataToServer('lavanpro_units');
        }
    };

    const handleSave = async () => {
        if (!editingUnit?.name) return;
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 800)); // Smooth feeling

        let newList: Unit[];
        if (units.find(u => u.id === editingUnit.id)) {
            newList = units.map(u => u.id === editingUnit.id ? (editingUnit as Unit) : u);
        } else {
            newList = [...units, editingUnit as Unit];
        }

        // If this is set as main, unset others
        if (editingUnit.isMain) {
            newList = newList.map(u => u.id === editingUnit.id ? u : { ...u, isMain: false });
        }

        setUnits(newList);
        saveUnits(newList);
        pushDataToServer('lavanpro_units');
        setIsSaving(false);
        setIsEditing(false);
        setEditingUnit(null);
    };

    const updateField = (field: keyof Unit, value: any) => {
        if (editingUnit) {
            setEditingUnit({ ...editingUnit, [field]: value });
        }
    };

    const updateHours = (day: string, field: "open" | "close" | "active", value: any) => {
        if (editingUnit?.openingHours) {
            const newHours = {
                ...editingUnit.openingHours,
                [day]: { ...editingUnit.openingHours[day], [field]: value }
            };
            updateField("openingHours", newHours);
        }
    };

    if (isEditing && editingUnit) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsEditing(false)} className="text-brand-muted hover:text-brand-text transition-colors">
                            <XCircle className="size-6" />
                        </button>
                        <div>
                            <h3 className="text-xl font-bold text-brand-text">{units.find(u => u.id === editingUnit.id) ? 'Editar Unidade' : 'Nova Unidade'}</h3>
                            <p className="text-sm text-brand-muted">Preencha os detalhes operacionais desta filial</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        {/* Basic Info */}
                        <div className="bg-brand-card p-6 rounded-2xl border border-brand-darkBorder shadow-xl">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
                                <Building2 className="size-3.5 text-brand-primary" /> Identificação
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">Nome da Unidade</label>
                                    <input 
                                        type="text" 
                                        value={editingUnit.name}
                                        onChange={e => updateField("name", e.target.value)}
                                        className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                        placeholder="Ex: Unidade Centro"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">Identificador (Slug)</label>
                                        <input 
                                            type="text" 
                                            value={editingUnit.slug}
                                            onChange={e => updateField("slug", e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                            placeholder="centro"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">CNPJ</label>
                                        <input 
                                            type="text" 
                                            value={editingUnit.cnpj}
                                            onChange={e => updateField("cnpj", e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                            placeholder="00.000.000/0000-00"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">Responsável</label>
                                        <input 
                                            type="text" 
                                            value={editingUnit.responsible}
                                            onChange={e => updateField("responsible", e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                            placeholder="Nome do Gerente"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">Status</label>
                                        <select
                                            value={editingUnit.status}
                                            onChange={e => updateField("status", e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                        >
                                            <option value="active">Ativa</option>
                                            <option value="inactive">Inativa</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-brand-card p-6 rounded-2xl border border-brand-darkBorder shadow-xl">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
                                <Phone className="size-3.5 text-brand-primary" /> Contato e Endereço
                            </h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">Telefone</label>
                                        <input 
                                            type="text" 
                                            value={editingUnit.phone}
                                            onChange={e => updateField("phone", e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                            placeholder="(00) 0000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">E-mail</label>
                                        <input 
                                            type="email" 
                                            value={editingUnit.email}
                                            onChange={e => updateField("email", e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                            placeholder="unidade@email.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">Rua</label>
                                        <input 
                                            type="text" 
                                            value={editingUnit.street}
                                            onChange={e => updateField("street", e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">Nº</label>
                                        <input 
                                            type="text" 
                                            value={editingUnit.number}
                                            onChange={e => updateField("number", e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">Cidade</label>
                                        <input 
                                            type="text" 
                                            value={editingUnit.city}
                                            onChange={e => updateField("city", e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">Estado</label>
                                        <input 
                                            type="text" 
                                            value={editingUnit.state}
                                            onChange={e => updateField("state", e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Opening Hours */}
                        <div className="bg-brand-card p-6 rounded-2xl border border-brand-darkBorder shadow-xl">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
                                <Clock className="size-3.5 text-brand-primary" /> Horário de Funcionamento
                            </h4>
                            <div className="space-y-3">
                                {DAYS.map(day => {
                                    const h = editingUnit.openingHours?.[day.key] || DEFAULT_OPENING_HOURS[day.key];
                                    return (
                                        <div key={day.key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${h.active ? 'bg-brand-bg/40 border-brand-darkBorder' : 'opacity-40 border-transparent'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={h.active}
                                                onChange={e => updateHours(day.key, "active", e.target.checked)}
                                                className="size-4 accent-brand-primary"
                                            />
                                            <span className="text-xs font-bold text-brand-text w-24">{day.label}</span>
                                            {h.active && (
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <input 
                                                        type="time" 
                                                        value={h.open}
                                                        onChange={e => updateHours(day.key, "open", e.target.value)}
                                                        className="bg-brand-bg border border-brand-darkBorder rounded-lg px-2 py-1 text-[10px] text-brand-text outline-none"
                                                    />
                                                    <span className="text-[10px] text-brand-muted">até</span>
                                                    <input 
                                                        type="time" 
                                                        value={h.close}
                                                        onChange={e => updateHours(day.key, "close", e.target.value)}
                                                        className="bg-brand-bg border border-brand-darkBorder rounded-lg px-2 py-1 text-[10px] text-brand-text outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Config */}
                        <div className="bg-brand-card p-6 rounded-2xl border border-brand-darkBorder shadow-xl">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted mb-6">
                                <Shield className="size-3.5 text-brand-primary" /> Configurações Gerais
                            </h4>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 p-4 bg-brand-bg/40 rounded-xl border border-brand-darkBorder cursor-pointer group hover:border-brand-primary/40 transition-all">
                                    <input 
                                        type="checkbox" 
                                        checked={editingUnit.isMain}
                                        onChange={e => updateField("isMain", e.target.checked)}
                                        className="size-5 rounded-lg accent-brand-primary"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">Unidade Principal</p>
                                        <p className="text-[10px] text-brand-muted">Esta unidade será carregada por padrão no dashboard</p>
                                    </div>
                                </label>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1.5 block">Observações Internas</label>
                                    <textarea 
                                        className="w-full bg-brand-bg border border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none transition-all h-24 resize-none"
                                        value={editingUnit.observations}
                                        onChange={e => updateField("observations", e.target.value)}
                                        placeholder="Notas para controle da empresa..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pb-20">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2.5 text-sm font-bold text-brand-muted hover:text-brand-text transition-colors"
                    >
                        Descartar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : "Salvar Unidade"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-inner">
                        <MapPin className="size-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-text">Gestão de Unidades</h3>
                        <p className="text-sm text-brand-muted">Cadastre e gerencie as filiais da sua lavanderia</p>
                    </div>
                </div>
                
                {(!isEnterprise && units.length >= 1) ? (
                    <div className="flex flex-col items-end gap-1">
                        <button disabled className="px-6 py-2.5 bg-brand-darkBorder text-brand-muted rounded-xl text-sm font-bold cursor-not-allowed flex items-center gap-2">
                            <Plus className="size-4" /> Nova Unidade
                        </button>
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                            <Crown className="size-2.5" /> Requisito Enterprise
                        </p>
                    </div>
                ) : (
                    <button 
                        onClick={handleNewUnit}
                        className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 group"
                    >
                        <Plus className="size-4 group-hover:rotate-90 transition-transform" /> Nova Unidade
                    </button>
                )}
            </div>

            {/* Plan Info for Non-Enterprise */}
            {!isEnterprise && units.length >= 1 && (
                <div className="bg-brand-primary/5 border border-brand-primary/20 p-6 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10">
                            <Shield className="size-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-brand-text">Sua conta suporta 1 unidade física</h4>
                            <p className="text-xs text-brand-muted max-w-md">Para gerenciar redes de franquias ou múltiplas filiais com consolidação de dados, atualize para o plano Enterprise.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/settings?tab=status'}
                        className="px-5 py-2.5 bg-brand-primary text-white text-[10px] font-black rounded-lg hover:bg-brand-primaryHover transition-all flex items-center gap-2"
                    >
                        VER PLANOS <ArrowRight className="size-3" />
                    </button>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {units.map(unit => (
                    <div key={unit.id} className="bg-brand-card rounded-2xl border border-brand-darkBorder p-6 hover:border-brand-primary/40 hover:shadow-2xl transition-all group relative overflow-hidden">
                        {unit.isMain && (
                            <div className="absolute top-0 right-0 px-3 py-1 bg-brand-primary text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                                Principal
                            </div>
                        )}
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-4 rounded-xl ${unit.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'} group-hover:scale-110 transition-transform duration-300`}>
                                <Building2 className="size-6" />
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(unit)} className="p-2 hover:bg-brand-primary/10 text-brand-muted hover:text-brand-primary rounded-lg transition-all">
                                    <Edit2 className="size-3.5" />
                                </button>
                                {!unit.isMain && (
                                    <button onClick={() => handleDelete(unit.id)} className="p-2 hover:bg-rose-500/10 text-brand-muted hover:text-rose-500 rounded-lg transition-all">
                                        <Trash2 className="size-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <h4 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors">{unit.name}</h4>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-brand-muted">
                                <MapPin className="size-3" />
                                {unit.neighborhood}, {unit.city}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-brand-muted">
                                <Phone className="size-3" />
                                {unit.phone}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-brand-muted">
                                <User className="size-3" />
                                Resp: {unit.responsible || "Não definido"}
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-brand-darkBorder flex items-center justify-between">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${unit.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                {unit.status === 'active' ? 'Ativa' : 'Inativa'}
                            </span>
                            <span className="text-[10px] font-medium text-brand-muted">
                                Criado em: {new Date(unit.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                        </div>
                    </div>
                ))}

                {units.length === 0 && (
                    <div className="md:col-span-2 lg:col-span-3 py-20 bg-brand-bg/40 rounded-3xl border-2 border-dashed border-brand-darkBorder flex flex-col items-center justify-center text-center px-10">
                        <div className="size-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-6 animate-pulse">
                            <MapPin className="size-8" />
                        </div>
                        <h4 className="text-xl font-black text-brand-text mb-2">Configure sua primeira unidade</h4>
                        <p className="text-sm text-brand-muted max-w-sm mb-8">Antes de começar a operar, você precisa cadastrar os dados da sua unidade principal.</p>
                        <button 
                            onClick={handleNewUnit}
                            className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            Começar agora <ArrowRight className="size-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export type { UnitDataTabProps };
