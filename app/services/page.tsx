"use client";

import { Sidebar } from "@/components/sidebar";
import { AccessGuard } from "@/components/access-guard";
import {
    Plus, Search, Tag, Coins, Percent, TrendingUp, Edit3, Trash2, X,
    CheckCircle2, Info, Clock, Layers, Package, Beaker, ChevronRight,
    TrendingDown, AlertCircle, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

// --- Types ---
type ChargeType = "UNIDADE" | "QUILO" | "PECA" | "FIXO";

interface RecipeItem {
    id: string;
    productId: string;
    name: string;
    quantity: number;
    unit: string;
    unitCost: number; // Cost per unit of the product
}

interface Service {
    id: string;
    name: string;
    category: string;
    chargeType: ChargeType;
    price: number;
    costOverride?: number; // Manual cost if no recipe
    recipe: RecipeItem[];
    executionTime?: string;
    description?: string;
}

type ServiceFormData = Omit<Service, "id">;

// --- Constants ---
const SERVICE_CATEGORIES = ["Lavanderia", "Roupas Finas", "Edredons & Cobertores", "Cama, Mesa & Banho", "Tapetes & Cortinas", "Outros"];

const CHARGE_TYPES: { value: ChargeType; label: string }[] = [
    { value: "UNIDADE", label: "Por Unidade" },
    { value: "QUILO", label: "Por Quilo" },
    { value: "PECA", label: "Por Peça" },
    { value: "FIXO", label: "Valor Fixo" },
];

// Mock Products for Recipe (Simulating stock connection)
const MOCK_STOCK_PRODUCTS = [
    { id: "PROD-101", name: "Sabão Líquido Omo Pro", unit: "L", cost: 14.50 },
    { id: "PROD-102", name: "Amaciante Comfort Pro", unit: "L", cost: 12.00 },
    { id: "PROD-103", name: "Alvejante sem Cloro", unit: "L", cost: 18.90 },
    { id: "PROD-105", name: "Saco Plástico G", unit: "un", cost: 0.80 },
];

const blankService = (): ServiceFormData => ({
    name: "",
    category: "Lavanderia",
    chargeType: "UNIDADE",
    price: 0,
    recipe: [],
    executionTime: "",
    description: "",
});

// --- Component ---
export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [activeCategory, setActiveCategory] = useState("Todas");
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<ServiceFormData>(blankService());
    const [activeTab, setActiveTab] = useState<"geral" | "receita">("geral");

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem("lavanpro_services_pro");
        if (saved) {
            try {
                setServices(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading services", e);
            }
        } else {
            const seed: Service[] = [
                {
                    id: "1",
                    name: "Lavagem de Edredom Casal",
                    category: "Edredons & Cobertores",
                    chargeType: "UNIDADE",
                    price: 55.0,
                    recipe: [
                        { id: "r1", productId: "PROD-101", name: "Sabão Líquido Omo Pro", quantity: 0.1, unit: "L", unitCost: 14.50 },
                        { id: "r2", productId: "PROD-102", name: "Amaciante Comfort Pro", quantity: 0.05, unit: "L", unitCost: 12.00 },
                        { id: "r3", productId: "PROD-105", name: "Saco Plástico G", quantity: 1, unit: "un", unitCost: 0.80 },
                    ],
                    executionTime: "72h",
                    description: "Tratamento profundo com secagem industrial."
                },
                {
                    id: "2",
                    name: "Lavagem de Roupa de Cor (Cid)",
                    category: "Lavanderia",
                    chargeType: "QUILO",
                    price: 18.5,
                    recipe: [
                        { id: "r4", productId: "PROD-101", name: "Sabão Líquido Omo Pro", quantity: 0.05, unit: "L", unitCost: 14.50 },
                    ],
                    executionTime: "48h"
                },
            ];
            setServices(seed);
            localStorage.setItem("lavanpro_services_pro", JSON.stringify(seed));
        }
    }, []);

    const saveToLocalStorage = (newServices: Service[]) => {
        localStorage.setItem("lavanpro_services_pro", JSON.stringify(newServices));
        setServices(newServices);
    };

    const calculateTotalCost = (service: Service | ServiceFormData) => {
        if (service.recipe.length === 0) return service.costOverride || 0;
        return service.recipe.reduce((total, item) => total + (item.quantity * item.unitCost), 0);
    };

    const calculateMargin = (price: number, cost: number) => {
        const profit = price - cost;
        const marginPercent = price > 0 ? (profit / price) * 100 : 0;
        return { profit, marginPercent };
    };

    const handleSave = () => {
        if (!formData.name || formData.price <= 0) return;

        if (editingId) {
            const updated = services.map((s) => (s.id === editingId ? { ...formData, id: s.id } : s));
            saveToLocalStorage(updated);
        } else {
            const newService: Service = {
                ...formData,
                id: Math.random().toString(36).substring(2, 9),
            };
            saveToLocalStorage([...services, newService]);
        }
        setIsModalOpen(false);
        setFormData(blankService());
        setEditingId(null);
        setActiveTab("geral");
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Deseja realmente excluir este serviço?")) {
            const filtered = services.filter((s) => s.id !== id);
            saveToLocalStorage(filtered);
        }
    };

    const openEdit = (s: Service) => {
        setFormData({ ...s });
        setEditingId(s.id);
        setIsModalOpen(true);
        setActiveTab("geral");
    };

    const addRecipeItem = (prod: typeof MOCK_STOCK_PRODUCTS[0]) => {
        const newItem: RecipeItem = {
            id: Math.random().toString(36).substring(2, 7),
            productId: prod.id,
            name: prod.name,
            quantity: 0.1,
            unit: prod.unit,
            unitCost: prod.cost
        };
        setFormData({ ...formData, recipe: [...formData.recipe, newItem] });
    };

    const removeRecipeItem = (id: string) => {
        setFormData({ ...formData, recipe: formData.recipe.filter(r => r.id !== id) });
    };

    const updateRecipeQty = (id: string, qty: number) => {
        setFormData({
            ...formData,
            recipe: formData.recipe.map(r => r.id === id ? { ...r, quantity: qty } : r)
        });
    };

    const filteredServices = useMemo(() => {
        return services.filter((s) => {
            const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = activeCategory === "Todas" || s.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [services, search, activeCategory]);

    const formatCurrency = (v: number) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
        <AccessGuard permission="settings">
            <div className="flex h-screen bg-brand-bg text-brand-text font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <div className="max-w-[1400px] mx-auto space-y-8">

                            {/* Header Professional */}
                            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-md border border-brand-primary/20">Industrial Pro</span>
                                    </div>
                                    <h1 className="text-3xl font-black text-brand-text tracking-tight flex items-center gap-3">
                                        Serviços & Precificação
                                    </h1>
                                    <p className="text-brand-muted text-sm font-medium">Gestão avançada de fichas técnicas, insumos e lucratividade real.</p>
                                </motion.div>
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nome ou categoria..."
                                            className="pl-10 pr-4 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary w-64 md:w-80 shadow-inner"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => { setFormData(blankService()); setEditingId(null); setIsModalOpen(true); }}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primaryHover transform active:scale-95 transition-all"
                                    >
                                        <Plus className="size-4" /> Novo Serviço
                                    </button>
                                </div>
                            </header>

                            {/* Category Tabs */}
                            <div className="flex flex-wrap gap-2 p-1.5 bg-brand-card/50 rounded-2xl border border-brand-darkBorder w-fit">
                                {["Todas", ...SERVICE_CATEGORIES].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === cat ? 'bg-brand-primary text-white shadow-md' : 'text-brand-muted hover:text-brand-text hover:bg-white/5'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Grid of Professional Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                                <AnimatePresence mode="popLayout">
                                    {filteredServices.map((s, idx) => {
                                        const cost = calculateTotalCost(s);
                                        const { profit, marginPercent } = calculateMargin(s.price, cost);
                                        return (
                                            <motion.div
                                                key={s.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ delay: idx * 0.03 }}
                                                onClick={() => openEdit(s)}
                                                className="bg-brand-card border border-brand-darkBorder p-6 rounded-[2rem] hover:border-brand-primary/60 transition-all group relative overflow-hidden cursor-pointer shadow-lg hover:shadow-brand-primary/5"
                                            >
                                                {/* Background Decoration */}
                                                <div className="absolute -top-12 -right-12 size-32 bg-brand-primary/5 blur-3xl rounded-full" />

                                                <div className="flex justify-between items-start mb-6 relative z-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-12 bg-brand-bg rounded-2xl flex items-center justify-center border border-brand-darkBorder group-hover:scale-110 transition-transform">
                                                            <Tag className="size-5 text-brand-primary" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="text-[10px] font-black uppercase text-brand-primary/60 tracking-tighter">{s.category}</span>
                                                            <h3 className="text-lg font-bold text-brand-text truncate pr-4">{s.name}</h3>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={(e) => handleDelete(s.id, e)} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg"><Trash2 className="size-4" /></button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    <div className="p-4 bg-brand-bg/50 rounded-2xl border border-brand-darkBorder text-center">
                                                        <p className="text-[9px] font-bold text-brand-muted uppercase mb-1">Preço Venda</p>
                                                        <p className="text-xl font-black text-brand-text">{formatCurrency(s.price)}</p>
                                                        <span className="text-[9px] font-medium text-brand-muted opacity-60">{s.chargeType}</span>
                                                    </div>
                                                    <div className="p-4 bg-brand-bg/50 rounded-2xl border border-brand-darkBorder text-center">
                                                        <p className="text-[9px] font-bold text-brand-muted uppercase mb-1">Custo Insumos</p>
                                                        <p className="text-xl font-black text-brand-muted">{formatCurrency(cost)}</p>
                                                        <span className="text-[9px] font-medium text-brand-primary flex items-center justify-center gap-1 mt-0.5">
                                                            <Layers className="size-2.5" /> {s.recipe.length} itens
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Profitability Gauges */}
                                                <div className="space-y-4 p-5 bg-white/5 rounded-3xl border border-white/5">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                                                <TrendingUp className="size-4 text-emerald-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-brand-muted uppercase">Lucro Líquido</p>
                                                                <p className="text-sm font-black text-brand-text">{formatCurrency(profit)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] font-bold text-brand-muted uppercase">Margem</p>
                                                            <p className={`text-sm font-black ${marginPercent > 60 ? 'text-emerald-400' : 'text-blue-400'}`}>{marginPercent.toFixed(1)}%</p>
                                                        </div>
                                                    </div>

                                                    {/* Margin Progress bar */}
                                                    <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, marginPercent)}%` }}
                                                            className={`h-full rounded-full ${marginPercent > 60 ? 'bg-emerald-500' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`}
                                                        />
                                                    </div>
                                                </div>

                                                {s.executionTime && (
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted">
                                                            <Clock className="size-3" /> {s.executionTime}
                                                        </div>
                                                        <ChevronRight className="size-4 text-brand-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {filteredServices.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="size-20 bg-brand-card rounded-full border border-brand-darkBorder flex items-center justify-center mb-6 shadow-2xl">
                                        <Sparkles className="size-10 text-brand-muted opacity-20" />
                                    </div>
                                    <h3 className="text-xl font-bold text-brand-text mb-2">Inicie sua esteira profissional</h3>
                                    <p className="text-sm text-brand-muted max-w-sm">Diferencie seus serviços e vincule receitas para automatizar seu lucro e estoque.</p>
                                    <button
                                        onClick={() => { setFormData(blankService()); setEditingId(null); setIsModalOpen(true); }}
                                        className="mt-6 px-6 py-2.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-xl font-bold hover:bg-brand-primary hover:text-white transition-all"
                                    >
                                        Cadastrar Meu Primeiro Serviço Pro
                                    </button>
                                </div>
                            )}

                        </div>
                    </main>
                </div>

                {/* Modal Profissional com Abas */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="bg-brand-card w-full max-w-4xl rounded-[2.5rem] border border-brand-darkBorder shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="p-8 pb-4 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                                    <div>
                                        <h3 className="text-xl font-black text-brand-text flex items-center gap-3">
                                            <div className="size-8 bg-brand-primary rounded-lg flex items-center justify-center">
                                                <Beaker className="size-5 text-white" />
                                            </div>
                                            {editingId ? "Ajustar Cadastro Industrial" : "Nova Engenharia de Serviço"}
                                        </h3>
                                        <p className="text-xs text-brand-muted mt-1">Configure todas as variáveis de custo e operação deste serviço.</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-brand-bg rounded-xl text-brand-muted hover:text-brand-text border border-brand-darkBorder"><X className="size-5" /></button>
                                </div>

                                {/* Modal Tabs */}
                                <div className="flex px-8 pt-4 gap-6 border-b border-brand-darkBorder bg-white/5">
                                    <button
                                        onClick={() => setActiveTab("geral")}
                                        className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === "geral" ? 'text-brand-primary' : 'text-brand-muted hover:text-brand-text'}`}
                                    >
                                        Dados Gerais
                                        {activeTab === "geral" && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("receita")}
                                        className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === "receita" ? 'text-brand-primary' : 'text-brand-muted hover:text-brand-text'}`}
                                    >
                                        Ficha Técnica (Receita)
                                        <span className="ml-2 px-1.5 py-0.5 bg-brand-bg rounded text-[10px] border border-white/5">{formData.recipe.length}</span>
                                        {activeTab === "receita" && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 lg:grid lg:grid-cols-5 gap-8">

                                    <div className="lg:col-span-3 space-y-6">
                                        {activeTab === "geral" ? (
                                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted flex items-center gap-2"><Info className="size-3 text-brand-primary" /> Identificação</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: Lavagem de Edredom Silk"
                                                        className="w-full px-5 py-3.5 bg-brand-bg border border-brand-darkBorder rounded-2xl text-brand-text font-bold text-lg focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-brand-muted/40"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-5">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">Categoria</label>
                                                        <select
                                                            className="w-full px-5 py-3.5 bg-brand-bg border border-brand-darkBorder rounded-2xl text-brand-text focus:ring-2 focus:ring-brand-primary outline-none appearance-none font-bold"
                                                            value={formData.category}
                                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                        >
                                                            {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-brand-card">{cat}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">Unidade de Cálculo</label>
                                                        <select
                                                            className="w-full px-5 py-3.5 bg-brand-bg border border-brand-darkBorder rounded-2xl text-brand-text focus:ring-2 focus:ring-brand-primary outline-none appearance-none font-bold"
                                                            value={formData.chargeType}
                                                            onChange={e => setFormData({ ...formData, chargeType: e.target.value as ChargeType })}
                                                        >
                                                            {CHARGE_TYPES.map(t => <option key={t.value} value={t.value} className="bg-brand-card">{t.label}</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-5">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-brand-primary">Preço de Venda (R$)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted font-bold">R$</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                className="w-full pl-12 pr-5 py-3.5 bg-brand-bg border border-brand-darkBorder rounded-2xl text-brand-text font-black text-xl focus:ring-2 focus:ring-brand-primary outline-none"
                                                                value={formData.price || ""}
                                                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-brand-muted">Tempo Médio (opcional)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ex: 48h / 3 dias"
                                                            className="w-full px-5 py-3.5 bg-brand-bg border border-brand-darkBorder rounded-2xl text-brand-text focus:ring-2 focus:ring-brand-primary outline-none font-medium"
                                                            value={formData.executionTime}
                                                            onChange={e => setFormData({ ...formData, executionTime: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="p-5 bg-brand-bg rounded-2xl border border-brand-darkBorder space-y-3">
                                                    <div className="flex justify-between items-center bg-brand-card p-3 rounded-xl border border-white/5">
                                                        <span className="text-xs font-black text-brand-muted uppercase">Custo Fixo (Sem Receita)</span>
                                                        <div className="relative w-32">
                                                            <input
                                                                type="number"
                                                                placeholder="0.00"
                                                                disabled={formData.recipe.length > 0}
                                                                className="w-full bg-brand-bg border border-brand-darkBorder rounded-lg px-2 py-1 text-right text-xs font-bold disabled:opacity-30"
                                                                value={formData.costOverride || ""}
                                                                onChange={e => setFormData({ ...formData, costOverride: parseFloat(e.target.value) || 0 })}
                                                            />
                                                        </div>
                                                    </div>
                                                    {formData.recipe.length > 0 && (
                                                        <div className="flex items-center gap-2 text-[10px] text-amber-500 font-bold bg-amber-500/10 p-2 rounded-lg">
                                                            <AlertCircle className="size-3" /> O custo fixo foi desabilitado pois há uma Receita configurada.
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                                <div className="p-5 bg-brand-bg rounded-3xl border border-brand-darkBorder shadow-inner">
                                                    <h4 className="text-xs font-black uppercase text-brand-text mb-4 flex items-center gap-2">
                                                        <Beaker className="size-4 text-brand-primary" /> Montagem da Receita
                                                    </h4>

                                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {formData.recipe.map(item => (
                                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-brand-card border border-white/5 rounded-2xl group transition-all">
                                                                <div className="size-9 bg-brand-bg rounded-xl flex items-center justify-center border border-brand-darkBorder">
                                                                    <Package className="size-4 text-brand-muted" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-bold text-brand-text truncate">{item.name}</p>
                                                                    <p className="text-[10px] text-brand-muted">{formatCurrency(item.unitCost)} / {item.unit}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        className="w-16 bg-brand-bg border border-brand-darkBorder rounded-lg px-2 py-1 text-center text-xs font-bold"
                                                                        value={item.quantity}
                                                                        onChange={e => updateRecipeQty(item.id, parseFloat(e.target.value) || 0)}
                                                                    />
                                                                    <span className="text-[10px] font-bold text-brand-muted w-4">{item.unit}</span>
                                                                </div>
                                                                <button onClick={() => removeRecipeItem(item.id)} className="p-2 text-brand-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Trash2 className="size-4" />
                                                                </button>
                                                            </div>
                                                        ))}

                                                        {formData.recipe.length === 0 && (
                                                            <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                                                <AlertCircle className="size-8 text-brand-muted mx-auto mb-3 opacity-20" />
                                                                <p className="text-sm font-bold text-brand-muted">Nenhum insumo vinculado.</p>
                                                                <p className="text-xs text-brand-muted/60 mt-1">Cálculo de custo automático baseado no seu estoque.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Product Selector (Mocked for Stock) */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase text-brand-muted flex items-center gap-2">Adicionar Insumo do Estoque</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {MOCK_STOCK_PRODUCTS.map(p => (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => addRecipeItem(p)}
                                                                className="px-3 py-2 bg-brand-card hover:bg-brand-primary hover:text-white border border-brand-darkBorder rounded-xl text-[10px] font-black transition-all flex items-center gap-2"
                                                            >
                                                                <Plus className="size-3" /> {p.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Finance Sidebar (Real-time Indicators) */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="p-7 bg-brand-card rounded-[2.5rem] border border-brand-primary/20 shadow-2xl relative overflow-hidden group">
                                            {/* Accent blur */}
                                            <div className={`absolute -top-10 -right-10 size-24 blur-3xl rounded-full transition-colors ${calculateMargin(formData.price, calculateTotalCost(formData)).marginPercent > 50 ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`} />

                                            <h4 className="text-xs font-black uppercase tracking-widest text-brand-muted mb-6">Projeção Financeira</h4>

                                            <div className="space-y-6">
                                                <div>
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <span className="text-[10px] font-bold text-brand-muted uppercase">Ticket Médio</span>
                                                        <span className="text-lg font-black text-brand-text">{formatCurrency(formData.price)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="text-[10px] font-bold text-brand-muted uppercase">Custo Direto</span>
                                                        <span className="text-sm font-bold text-brand-muted underline decoration-rose-500/30">{formatCurrency(calculateTotalCost(formData))}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-brand-darkBorder text-center">
                                                    <div className="inline-flex size-20 rounded-full border-4 border-emerald-500/20 items-center justify-center mb-3 relative group-hover:scale-110 transition-transform">
                                                        <div className="text-xl font-black text-emerald-400">{calculateMargin(formData.price, calculateTotalCost(formData)).marginPercent.toFixed(0)}%</div>
                                                        <svg className="absolute inset-0 size-full -rotate-90">
                                                            <circle cx="40" cy="40" r="38" fill="none" className="stroke-emerald-500" strokeWidth="4" strokeDasharray="239" strokeDashoffset={`${239 - (239 * Math.min(100, calculateMargin(formData.price, calculateTotalCost(formData)).marginPercent)) / 100}`} strokeLinecap="round" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase text-emerald-500 mb-1">Margem de Contribuição</p>
                                                    <h5 className="text-2xl font-black text-brand-text">{formatCurrency(calculateMargin(formData.price, calculateTotalCost(formData)).profit)} <span className="text-xs text-brand-muted font-bold block">de lucro por {formData.chargeType.toLowerCase()}</span></h5>
                                                </div>
                                            </div>

                                            <div className="mt-8 p-4 bg-white/5 rounded-2xl space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">1</div>
                                                    <p className="text-[11px] font-medium text-brand-text leading-tight">Os insumos serão debitados automaticamente.</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="size-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">2</div>
                                                    <p className="text-[11px] font-medium text-brand-text leading-tight">Custo calculado com base no custo de compra atual.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Notas Internas</label>
                                            <textarea
                                                rows={3}
                                                className="w-full px-5 py-4 bg-brand-bg border border-brand-darkBorder rounded-3xl text-sm text-brand-text focus:ring-2 focus:ring-brand-primary outline-none resize-none"
                                                placeholder="..."
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-brand-darkBorder bg-white/5 flex gap-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-brand-bg text-brand-text border border-brand-darkBorder rounded-2xl font-black hover:bg-white/5 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!formData.name || formData.price <= 0}
                                        className="flex-[2] py-4 bg-brand-primary text-white rounded-2xl font-black shadow-2xl shadow-brand-primary/40 hover:bg-brand-primaryHover disabled:opacity-50 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                                    >
                                        {editingId ? <CheckCircle2 className="size-5" /> : <TrendingUp className="size-5" />}
                                        {editingId ? "Atualizar Ficha Técnica" : "Finalizar Engenharia"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        `}</style>
            </div>
        </AccessGuard>
    );
}
