"use client";
export const dynamic = "force-dynamic";

import { Sidebar, MobileHeader } from "@/components/sidebar";
import { AccessGuard } from "@/components/access-guard";
import { UnitSelector } from "@/components/unit-selector";
import { PlanGuard } from "@/components/plan-guard";
import {
    Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Search,
    Archive, Edit3, Trash2, X, CheckCircle2, MoreVertical,
    ArrowUpRight, ArrowDownRight, Tag, Scale, Coins, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useUnit } from "@/hooks/useUnit";
import { useBusinessData } from "@/components/business-data-provider";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
    id: string;
    name: string;
    category: string;
    unit: string;
    minStock: number;
    currentStock: number;
    unitCost: number;
    unitId: string;
}

type MovementType = "ENTRADA" | "SAIDA";

interface Movement {
    id: string;
    date: string;
    type: MovementType;
    productId: string;
    quantity: number;
    unitCost: number; // Cost at the time of movement
    reason: string;
    user: string;
    unitId: string;
}

type ProductFormData = Omit<Product, "id">;

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Produtos Químicos", "Embalagens", "Materiais de Escritório", "Equipamentos e Peças", "Outros"];
const UNITS = ["Litro (L)", "Galão (GL)", "Quilograma (kg)", "Unidade (un)", "Caixa (cx)", "Pacote (pct)", "Rolo (rl)"];

// ─── Seed data ────────────────────────────────────────────────────────────────
const seedProducts: Product[] = [];
const seedMovements: Movement[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function formatDate(d: string) { return d.split("-").reverse().join("/"); }

const blankProduct = (unitId: string): ProductFormData & { unitId: string } => ({
    name: "", category: CATEGORIES[0], unit: UNITS[0], minStock: 0, currentStock: 0, unitCost: 0, unitId
});

// ─────────────────────────────────────────────────────────────────────────────
// Product Modal
// ─────────────────────────────────────────────────────────────────────────────
interface ProductModalProps {
    data: ProductFormData;
    onChange: (field: keyof ProductFormData, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
    title: string;
}

function ProductModal({ data, onChange, onSave, onCancel, title }: ProductModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-brand-card w-full max-w-xl rounded-2xl border border-brand-darkBorder shadow-2xl flex flex-col">
                <div className="p-5 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                    <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                        <Package className="size-5 text-brand-primary" />{title}
                    </h3>
                    <button onClick={onCancel} className="text-brand-muted hover:text-brand-text bg-brand-bg p-2 rounded-lg border border-brand-darkBorder">
                        <X className="size-4" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Nome do Produto / Item</label>
                            <input type="text" placeholder="Ex: Sabão Líquido Premium" value={data.name} onChange={e => onChange("name", e.target.value)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Categoria</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted pointer-events-none" />
                                <select value={data.category} onChange={e => onChange("category", e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-brand-card">{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Unidade de Medida</label>
                            <div className="relative">
                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted pointer-events-none" />
                                <select value={data.unit} onChange={e => onChange("unit", e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                    {UNITS.map(c => <option key={c} value={c} className="bg-brand-card">{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Estoque Atual</label>
                            <input type="number" step="0.01" value={data.currentStock} onChange={e => onChange("currentStock", parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Estoque Mínimo (Alerta)</label>
                            <input type="number" step="0.01" value={data.minStock} onChange={e => onChange("minStock", parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Custo Unitário (R$)</label>
                            <div className="relative">
                                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted pointer-events-none" />
                                <input type="number" step="0.01" placeholder="0,00" value={data.unitCost || ""} onChange={e => onChange("unitCost", parseFloat(e.target.value) || 0)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-brand-darkBorder">
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={!data.name || data.unitCost <= 0}
                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle2 className="size-4" /> Salvar Produto
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Movement Modal
// ─────────────────────────────────────────────────────────────────────────────
interface MovementModalProps {
    products: Product[];
    preselectProductId: string | null;
    onSave: (mov: Omit<Movement, "id">) => void;
    onCancel: () => void;
    unitId: string;
}

function MovementModal({ products, preselectProductId, onSave, onCancel, unitId }: MovementModalProps) {
    const [type, setType] = useState<MovementType>("ENTRADA");
    const [productId, setProductId] = useState(preselectProductId || (products.length > 0 ? products[0].id : ""));
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState("");

    const isEntry = type === "ENTRADA";
    const selectedProd = products.find(p => p.id === productId);

    const handleSave = () => {
        if (!productId || quantity <= 0 || !reason) return;
        onSave({
            type,
            productId,
            quantity,
            date: new Date().toISOString().slice(0, 10),
            reason,
            user: "Gabriel (Admin)", // Mock user
            unitCost: selectedProd?.unitCost || 0,
            unitId: unitId !== "all" ? unitId : "default"
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-brand-card w-full max-w-lg rounded-2xl border border-brand-darkBorder shadow-2xl flex flex-col">
                <div className="p-5 border-b border-brand-darkBorder flex justify-between items-center bg-white/5">
                    <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                        {isEntry ? <ArrowUpRight className="size-5 text-emerald-500" /> : <ArrowDownRight className="size-5 text-rose-500" />}
                        Registrar Movimentação
                    </h3>
                    <button onClick={onCancel} className="text-brand-muted hover:text-brand-text bg-brand-bg p-2 rounded-lg border border-brand-darkBorder"><X className="size-4" /></button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                    <div className="flex gap-2 p-1 bg-brand-bg border border-brand-darkBorder rounded-xl">
                        <button type="button" onClick={() => setType("ENTRADA")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isEntry ? "bg-emerald-500/20 text-emerald-500 shadow-sm" : "text-brand-muted hover:text-brand-text"}`}>Entrada</button>
                        <button type="button" onClick={() => setType("SAIDA")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isEntry ? "bg-rose-500/20 text-rose-500 shadow-sm" : "text-brand-muted hover:text-brand-text"}`}>Saída (Consumo)</button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Produto / Item</label>
                            <select value={productId} onChange={e => setProductId(e.target.value)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                {products.map(p => <option key={p.id} value={p.id} className="bg-brand-card">{p.name} ({p.unit}) - Estoque: {p.currentStock}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Quantidade {selectedProd ? `(${selectedProd.unit.split(" ")[0]})` : ""}</label>
                                <input type="number" step="0.01" min="0.01" value={quantity || ""} onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Custo Total (Ref.)</label>
                                <div className="w-full px-3 py-2.5 bg-brand-bg/50 border border-brand-darkBorder rounded-xl text-sm text-brand-muted cursor-not-allowed">
                                    {selectedProd ? formatCurrency((selectedProd.unitCost * quantity) || 0) : "R$ 0,00"}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Motivo / Observação</label>
                            <input type="text" placeholder={isEntry ? "Ex: Compra NF-1234, Devolução..." : "Ex: Consumo na operação diária, Quebra..."} value={reason} onChange={e => setReason(e.target.value)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-brand-darkBorder">
                    <button type="button" onClick={handleSave} disabled={!productId || quantity <= 0 || !reason}
                        className={`w-full py-3 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isEntry ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"}`}>
                        <CheckCircle2 className="size-4" /> Confirmar Lançamento
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

// ... (types and helpers unchanged)

export default function StockPage() {
    const { unitId: activeUnit } = useUnit();
    const { data: bizData, saveData } = useBusinessData();
    
    // Remote data from Provider
    const products = (bizData.stock_products || []) as Product[];
    const movements = (bizData.stock_movements || []) as Movement[];

    // UI state only
    const [activeTab, setActiveTab] = useState<"ESTOQUE" | "MOVIMENTACOES">("ESTOQUE");
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("Todos");

    // Modals state
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [selectedProductIdForMove, setSelectedProductIdForMove] = useState<string | null>(null);

    const [productForm, setProductForm] = useState<ProductFormData & { unitId: string }>(() => blankProduct(activeUnit));
    const [editingProductId, setEditingProductId] = useState<string | null>(null);

    // Sync form unitId
    useEffect(() => {
        setProductForm(prev => ({ ...prev, unitId: activeUnit !== "all" ? activeUnit : "default" }));
    }, [activeUnit]);

    const handleProductChange = (f: keyof ProductFormData, v: any) => setProductForm(prev => ({ ...prev, [f]: v }));

    const handleSaveProduct = async () => {
        if (!productForm.name) return;
        
        let updatedProducts: Product[];
        if (editingProductId) {
            updatedProducts = products.map(p => p.id === editingProductId ? { ...productForm, id: p.id } as Product : p);
        } else {
            const id = `PROD-${String(Date.now()).slice(-6)}`;
            updatedProducts = [...products, { ...productForm, id, unitId: activeUnit !== "all" ? activeUnit : "default" } as Product];
        }
        
        await saveData('lavanpro_stock_products_v2', updatedProducts);
        setIsProductModalOpen(false);
    };

    const handleSaveMovement = async (mov: Omit<Movement, "id">) => {
        const id = `MOV-${String(Date.now()).slice(-6)}`;
        const newMovements = [{ ...mov, id }, ...movements];

        // Update product stock automatically in the product list
        const updatedProducts = products.map(p => {
            if (p.id === mov.productId) {
                const newStock = mov.type === "ENTRADA" ? p.currentStock + mov.quantity : p.currentStock - mov.quantity;
                return { ...p, currentStock: Math.max(0, newStock) };
            }
            return p;
        });

        // Batch save both to ensure consistency
        await saveData('lavanpro_stock_movements_v2', newMovements);
        await saveData('lavanpro_stock_products_v2', updatedProducts);

        setIsMovementModalOpen(false);
        setSelectedProductIdForMove(null);
    };

    const openEditProduct = (p: Product) => {
        setProductForm(p);
        setEditingProductId(p.id);
        setIsProductModalOpen(true);
    };

    const openNewMovement = (productId?: string) => {
        setSelectedProductIdForMove(productId || null);
        setIsMovementModalOpen(true);
    };

    // Computations
    const filteredProducts = useMemo(() => {
        const q = search.toLowerCase();
        return products.filter(p => {
            const matchesUnit = !activeUnit || activeUnit === "all" || p.unitId === activeUnit;
            const matchSearch = !q || p.name.toLowerCase().includes(q);
            const matchCat = filterCategory === "Todos" || p.category === filterCategory;
            return matchesUnit && matchSearch && matchCat;
        });
    }, [products, search, filterCategory, activeUnit]);

    const filteredMovements = useMemo(() => {
        const q = search.toLowerCase();
        return movements.filter(m => {
            const matchesUnit = !activeUnit || activeUnit === "all" || m.unitId === activeUnit;
            const product = products.find(p => p.id === m.productId);
            const productName = product ? product.name.toLowerCase() : "";
            return matchesUnit && (!q || productName.includes(q) || m.reason.toLowerCase().includes(q));
        });
    }, [movements, products, search, activeUnit]);

    const stats = {
        totalItems: products.length,
        totalValue: products.reduce((s, p) => s + (p.currentStock * p.unitCost), 0),
        lowStockAlerts: products.filter(p => p.currentStock <= p.minStock).length,
        totalConsumption: movements.filter(m => m.type === "SAIDA").reduce((s, m) => s + (m.quantity * m.unitCost), 0),
    };

    return (
        <AccessGuard permission="stock">
            <div className="flex min-h-screen bg-brand-bg text-brand-text font-sans">
                <Sidebar />
                <PlanGuard moduleName="Estoque" requiredPlan="pro">
                    <div className="flex-1 flex flex-col h-screen overflow-hidden">
                        <MobileHeader title="Estoque" />
                        <main className="flex-1 overflow-y-auto responsive-px py-6 lg:py-8 custom-scrollbar">
                            <div className="max-w-[1600px] mx-auto space-y-6 safe-bottom">

                                {/* Header */}
                                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                        <h1 className="text-3xl font-black text-brand-text tracking-tight">Estoque & Insumos</h1>
                                        <p className="text-brand-muted text-sm font-medium mt-1">Controle de entradas, saídas e custos operacionais</p>
                                    </motion.div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="w-full sm:w-64">
                                            <UnitSelector />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => openNewMovement()}
                                                className="px-4 py-2.5 bg-brand-card border border-brand-darkBorder text-brand-text rounded-xl text-sm font-bold hover:bg-white/5 transition-all flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <Archive className="size-4" /> Registrar Movimentação
                                            </button>
                                            <button
                                                onClick={() => { setProductForm(blankProduct(activeUnit)); setEditingProductId(null); setIsProductModalOpen(true); }}
                                                className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <Plus className="size-4" /> Novo Produto
                                            </button>
                                        </div>
                                    </div>
                                </header>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }} className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                        <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0"><Package className="size-5" /></div>
                                        <div>
                                            <p className="text-2xl font-black text-brand-text">{stats.totalItems}</p>
                                            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Produtos Cadastrados</p>
                                        </div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0"><Coins className="size-5" /></div>
                                        <div>
                                            <p className="text-2xl font-black text-emerald-500">{formatCurrency(stats.totalValue)}</p>
                                            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Valor em Estoque</p>
                                        </div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`bg-brand-card p-5 rounded-2xl border flex items-center gap-4 ${stats.lowStockAlerts > 0 ? "border-amber-500/50 bg-amber-500/5 relative overflow-hidden" : "border-brand-darkBorder"}`}>
                                        {stats.lowStockAlerts > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/20 to-transparent pointer-events-none" />}
                                        <div className={`p-3 rounded-xl shrink-0 ${stats.lowStockAlerts > 0 ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-500"}`}><AlertTriangle className="size-5" /></div>
                                        <div>
                                            <p className={`text-2xl font-black ${stats.lowStockAlerts > 0 ? "text-amber-500" : "text-brand-text"}`}>{stats.lowStockAlerts}</p>
                                            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Estoque Baixo</p>
                                        </div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-brand-card p-5 rounded-2xl border border-brand-darkBorder flex items-center gap-4">
                                        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl shrink-0"><TrendingDown className="size-5" /></div>
                                        <div>
                                            <p className="text-2xl font-black text-rose-500">{formatCurrency(stats.totalConsumption)}</p>
                                            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Consumo Período</p>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Filters & Tabs */}
                                <div className="flex flex-wrap items-center gap-3 bg-brand-card p-3 rounded-2xl border border-brand-darkBorder">
                                    <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-darkBorder relative w-full sm:w-auto">
                                        <button onClick={() => setActiveTab("ESTOQUE")} className={`flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold rounded-lg transition-all relative z-10 ${activeTab === "ESTOQUE" ? "text-white" : "text-brand-muted hover:text-brand-text"}`}>
                                            {activeTab === "ESTOQUE" && <motion.div layoutId="stockTab" className="absolute inset-0 bg-brand-primary rounded-lg -z-10 shadow-sm" />}
                                            Estoque Atual
                                        </button>
                                        <button onClick={() => setActiveTab("MOVIMENTACOES")} className={`flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold rounded-lg transition-all relative z-10 ${activeTab === "MOVIMENTACOES" ? "text-white" : "text-brand-muted hover:text-brand-text"}`}>
                                            {activeTab === "MOVIMENTACOES" && <motion.div layoutId="stockTab" className="absolute inset-0 bg-brand-primary rounded-lg -z-10 shadow-sm" />}
                                            Movimentações
                                        </button>
                                    </div>

                                    <div className="h-8 w-px bg-brand-darkBorder hidden md:block mx-1"></div>

                                    {activeTab === "ESTOQUE" && (
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand-muted pointer-events-none" />
                                            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                                                className="pl-9 pr-8 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer hover:border-brand-primary/50 transition-colors">
                                                <option value="Todos">Todas Categorias</option>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-[200px] relative ml-auto">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
                                        <input type="text" placeholder={`Buscar em ${activeTab === "ESTOQUE" ? "produtos" : "movimentações"}...`}
                                            value={search} onChange={e => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                                    </div>
                                </div>

                                {/* MAIN CONTENT AREA */}
                                <div className="bg-brand-card border border-brand-darkBorder rounded-2xl overflow-hidden">

                                    {/* TAB: ESTOQUE */}
                                    {activeTab === "ESTOQUE" && (
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-brand-darkBorder bg-white/5 text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                                                        <th className="px-6 py-4 font-bold">Produto / Categoria</th>
                                                        <th className="px-6 py-4 font-bold text-center">Unidade</th>
                                                        <th className="px-6 py-4 font-bold text-center">Mín.</th>
                                                        <th className="px-6 py-4 font-bold text-center">Estoque Atual</th>
                                                        <th className="px-6 py-4 font-bold text-right">Custo Un.</th>
                                                        <th className="px-6 py-4 font-bold text-right">Valor Total</th>
                                                        <th className="px-6 py-4 font-bold text-center">Status</th>
                                                        <th className="px-6 py-4 font-bold text-right">Ação</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-brand-darkBorder">
                                                    <AnimatePresence>
                                                        {filteredProducts.map(p => {
                                                            const isLow = p.currentStock <= p.minStock;
                                                            return (
                                                                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-white/5 transition-colors group">
                                                                    <td className="px-6 py-4">
                                                                        <p className="text-sm font-bold text-brand-text truncate max-w-[250px]" title={p.name}>{p.name}</p>
                                                                        <p className="text-[10px] text-brand-muted mt-0.5">{p.id} · {p.category}</p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className="text-xs font-medium text-brand-muted px-2 py-1 bg-brand-bg rounded-lg border border-brand-darkBorder">{p.unit}</span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <p className="text-sm font-semibold text-brand-muted">{p.minStock}</p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <p className={`text-lg font-black ${isLow ? "text-amber-500" : "text-brand-text"}`}>{p.currentStock}</p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <p className="text-sm font-semibold text-brand-muted">{formatCurrency(p.unitCost)}</p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <p className="text-sm font-bold text-brand-text">{formatCurrency(p.currentStock * p.unitCost)}</p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        {isLow ? (
                                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-bold">
                                                                                <AlertCircle className="size-3" /> Baixo
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase font-bold">
                                                                                <CheckCircle2 className="size-3" /> Normal
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right h-full align-middle">
                                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button onClick={() => openNewMovement(p.id)} title="Ajuste Rápido (IN/OUT)" className="p-2 bg-brand-bg border border-brand-darkBorder hover:border-brand-primary/50 rounded-lg text-brand-muted hover:text-brand-primary transition-all">
                                                                                <Archive className="size-4" />
                                                                            </button>
                                                                            <button onClick={() => openEditProduct(p)} title="Editar Produto" className="p-2 bg-brand-bg border border-brand-darkBorder hover:border-brand-primary/50 rounded-lg text-brand-muted hover:text-brand-text transition-all">
                                                                                <Edit3 className="size-4" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </motion.tr>
                                                            );
                                                        })}
                                                        {filteredProducts.length === 0 && (
                                                            <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-brand-muted">Nenhum produto encontrado.</td></tr>
                                                        )}
                                                    </AnimatePresence>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* TAB: MOVIMENTACOES */}
                                    {activeTab === "MOVIMENTACOES" && (
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-brand-darkBorder bg-white/5 text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                                                        <th className="px-6 py-4 font-bold w-12 text-center">Tipo</th>
                                                        <th className="px-6 py-4 font-bold">Data</th>
                                                        <th className="px-6 py-4 font-bold">Produto</th>
                                                        <th className="px-6 py-4 font-bold text-center">Qtd</th>
                                                        <th className="px-6 py-4 font-bold text-right">Custo Total</th>
                                                        <th className="px-6 py-4 font-bold">Motivo / Operação</th>
                                                        <th className="px-6 py-4 font-bold">Usuário</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-brand-darkBorder">
                                                    <AnimatePresence>
                                                        {filteredMovements.length === 0 && (
                                                            <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-brand-muted">Nenhuma movimentação no período.</td></tr>
                                                        )}
                                                        {filteredMovements.map(m => {
                                                            const p = products.find(prod => prod.id === m.productId);
                                                            return (
                                                                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-white/5 transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 border ${m.type === "ENTRADA" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`} title={m.type}>
                                                                            {m.type === "ENTRADA" ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm font-semibold text-brand-text whitespace-nowrap">{formatDate(m.date)}</td>
                                                                    <td className="px-6 py-4">
                                                                        <p className="text-sm font-bold text-brand-text">{p ? p.name : "Desconhecido"}</p>
                                                                        <p className="text-[10px] text-brand-muted">{m.productId}</p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <p className={`text-sm font-black ${m.type === "ENTRADA" ? "text-emerald-500" : "text-rose-500"}`}>
                                                                            {m.type === "ENTRADA" ? "+" : "-"}{m.quantity}
                                                                        </p>
                                                                        <p className="text-[10px] text-brand-muted">{p ? p.unit.split(" ")[0] : ""}</p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <p className="text-sm font-bold text-brand-text">{formatCurrency(m.quantity * m.unitCost)}</p>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <p className="text-sm text-brand-text line-clamp-1">{m.reason}</p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-xs font-semibold text-brand-muted whitespace-nowrap">
                                                                        {m.user}
                                                                    </td>
                                                                </motion.tr>
                                                            );
                                                        })}
                                                    </AnimatePresence>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </main>
                    </div>
                </PlanGuard>

                {/* Modals outside to prevent remounts */}
                <AnimatePresence>
                    {isProductModalOpen && (
                        <ProductModal
                            key="product-modal"
                            data={productForm}
                            onChange={handleProductChange}
                            onSave={handleSaveProduct}
                            onCancel={() => setIsProductModalOpen(false)}
                            title={editingProductId ? "Editar Produto" : "Novo Produto"}
                        />
                    )}
                    {isMovementModalOpen && (
                        <MovementModal
                            key="movement-modal"
                            products={products}
                            preselectProductId={selectedProductIdForMove}
                            onSave={handleSaveMovement}
                            onCancel={() => setIsMovementModalOpen(false)}
                            unitId={activeUnit}
                        />
                    )}
                </AnimatePresence>
            </div>
        </AccessGuard>
    );
}
