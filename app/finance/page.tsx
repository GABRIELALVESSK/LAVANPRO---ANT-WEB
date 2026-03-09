"use client";

import { Sidebar } from "@/components/sidebar";
import {
    TrendingUp, TrendingDown, DollarSign, Wallet, FileText,
    Plus, Search, Filter, Calendar as default_api, CheckCircle2,
    X, AlertCircle, ArrowUpRight, ArrowDownRight, MoreVertical,
    Download, RefreshCw, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TransactionType = "RECEITA" | "DESPESA";
type TransactionStatus = "PAGO" | "PENDENTE" | "ATRASADO";

interface Transaction {
    id: string;
    description: string;
    type: TransactionType;
    category: string;
    value: number;
    dueDate: string;
    paidDate?: string;
    paymentMethod?: string;
    status: TransactionStatus;
    customerOrSupplier?: string;
}

type TransactionFormData = Omit<Transaction, "id">;

// ─── Constants ────────────────────────────────────────────────────────────────
const INCOME_CATEGORIES = ["Serviços Realizados", "Venda de Produtos", "Rendimentos", "Outros"];
const EXPENSE_CATEGORIES = ["Fornecedores", "Folha de Pagamento", "Impostos", "Água/Luz/Internet", "Aluguel", "Manutenção", "Outros"];
const PAYMENT_METHODS = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Boleto", "Transferência"];

const STATUS_COLORS: Record<TransactionStatus, string> = {
    "PAGO": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "PENDENTE": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "ATRASADO": "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const seedTransactions: Transaction[] = [
    { id: "FIN-1001", description: "Faturamento OS #ORD-2856", type: "RECEITA", category: "Serviços Realizados", value: 135, dueDate: "2026-03-08", paidDate: "2026-03-08", paymentMethod: "Cartão de Crédito", status: "PAGO", customerOrSupplier: "Carlos Machado" },
    { id: "FIN-1002", description: "Compra de Sabão Omo Profissional", type: "DESPESA", category: "Fornecedores", value: 450, dueDate: "2026-03-10", status: "PENDENTE", customerOrSupplier: "Unilever" },
    { id: "FIN-1003", description: "Faturamento OS #ORD-2854", type: "RECEITA", category: "Serviços Realizados", value: 120, dueDate: "2026-03-08", paidDate: "2026-03-08", paymentMethod: "PIX", status: "PAGO", customerOrSupplier: "Maria Oliveira" },
    { id: "FIN-1004", description: "Conta de Energia Elétrica", type: "DESPESA", category: "Água/Luz/Internet", value: 1250, dueDate: "2026-03-05", status: "ATRASADO", customerOrSupplier: "Enel" },
    { id: "FIN-1005", description: "Faturamento Mensal Hotel Bela Vista", type: "RECEITA", category: "Serviços Realizados", value: 3450, dueDate: "2026-03-15", status: "PENDENTE", paymentMethod: "Boleto", customerOrSupplier: "Hotel Bela Vista" },
    { id: "FIN-1006", description: "Aluguel Loja Centro", type: "DESPESA", category: "Aluguel", value: 3000, dueDate: "2026-03-02", paidDate: "2026-03-02", paymentMethod: "Transferência", status: "PAGO", customerOrSupplier: "Imobiliária ABC" },
    { id: "FIN-1007", description: "Manutenção Máquina Secadora", type: "DESPESA", category: "Manutenção", value: 350, dueDate: "2026-03-12", status: "PENDENTE", customerOrSupplier: "TecMec" },
    { id: "FIN-1008", description: "Faturamento OS #ORD-2800", type: "RECEITA", category: "Serviços Realizados", value: 80, dueDate: "2026-02-14", paidDate: "2026-02-14", paymentMethod: "Dinheiro", status: "PAGO", customerOrSupplier: "Ana Paula" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function formatDate(d: string) { return d.split("-").reverse().join("/"); }

const blankTransaction = (type: TransactionType = "RECEITA"): TransactionFormData => ({
    description: "", type, category: type === "RECEITA" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    value: 0, dueDate: new Date().toISOString().slice(0, 10), status: "PENDENTE", paymentMethod: "", customerOrSupplier: ""
});

// ─────────────────────────────────────────────────────────────────────────────
// TransactionModal — OUTSIDE the main component
// ─────────────────────────────────────────────────────────────────────────────
interface TransactionModalProps {
    data: TransactionFormData;
    onChange: (field: keyof TransactionFormData, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
}

function TransactionModal({ data, onChange, onSave, onCancel }: TransactionModalProps) {
    const isIncome = data.type === "RECEITA";
    const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

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
                        {isIncome ? <ArrowUpRight className="size-5 text-emerald-500" /> : <ArrowDownRight className="size-5 text-rose-500" />}
                        {isIncome ? "Nova Receita" : "Nova Despesa"}
                    </h3>
                    <button onClick={onCancel} className="text-brand-muted hover:text-brand-text bg-brand-bg p-2 rounded-lg border border-brand-darkBorder">
                        <X className="size-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                    <div className="flex gap-2 p-1 bg-brand-bg border border-brand-darkBorder rounded-xl">
                        <button
                            type="button"
                            onClick={() => { onChange("type", "RECEITA"); onChange("category", INCOME_CATEGORIES[0]); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isIncome ? "bg-emerald-500/20 text-emerald-500 shadow-sm" : "text-brand-muted hover:text-brand-text"}`}
                        >
                            Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => { onChange("type", "DESPESA"); onChange("category", EXPENSE_CATEGORIES[0]); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isIncome ? "bg-rose-500/20 text-rose-500 shadow-sm" : "text-brand-muted hover:text-brand-text"}`}
                        >
                            Despesa
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Descrição</label>
                            <input type="text" placeholder="Ex: Pagamento Fornecedor X" value={data.description} onChange={e => onChange("description", e.target.value)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Valor (R$)</label>
                            <input type="number" step="0.01" placeholder="0,00" value={data.value || ""} onChange={e => onChange("value", parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Categoria</label>
                            <select value={data.category} onChange={e => onChange("category", e.target.value)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                {categories.map(c => <option key={c} value={c} className="bg-brand-card">{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Data de Vencimento</label>
                            <input type="date" value={data.dueDate} onChange={e => onChange("dueDate", e.target.value)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Status</label>
                            <select value={data.status} onChange={e => onChange("status", e.target.value as TransactionStatus)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                <option value="PENDENTE" className="bg-brand-card">Pendente</option>
                                <option value="PAGO" className="bg-brand-card">Pago / Baixado</option>
                            </select>
                        </div>

                        {data.status === "PAGO" && (
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Forma de Pagamento</label>
                                <select value={data.paymentMethod} onChange={e => onChange("paymentMethod", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                    <option value="" disabled className="bg-brand-card">Selecione...</option>
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m} className="bg-brand-card">{m}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Cliente / Fornecedor</label>
                            <input type="text" placeholder="Nome do cliente ou fornecedor" value={data.customerOrSupplier || ""} onChange={e => onChange("customerOrSupplier", e.target.value)}
                                className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-brand-darkBorder">
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={!data.description || data.value <= 0}
                        className={`w-full py-3 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isIncome ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"}`}
                    >
                        <CheckCircle2 className="size-4" /> Salvar Lançamento
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FinancePage() {
    const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);

    // Filters
    const [activeTab, setActiveTab] = useState<"TODOS" | "RECEITAS" | "DESPESAS">("TODOS");
    const [search, setSearch] = useState("");
    const [filterPeriod, setFilterPeriod] = useState<"MesAtual" | "Ultimos30" | "Todos">("MesAtual");

    // Modal state
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<TransactionFormData>(blankTransaction("RECEITA"));

    // Handlers
    const handleFormChange = (field: keyof TransactionFormData, value: any) => setForm(f => ({ ...f, [field]: value }));
    const handleCreate = () => {
        if (!form.description || form.value <= 0) return;
        const id = `FIN-${String(transactions.length + 1001)}`;
        setTransactions(prev => [{ ...form, id, paidDate: form.status === "PAGO" ? new Date().toISOString().slice(0, 10) : undefined }, ...prev]);
        setIsCreating(false);
        setForm(blankTransaction("RECEITA"));
    };

    const handleSettle = (id: string) => {
        setTransactions(prev => prev.map(t =>
            t.id === id ? { ...t, status: "PAGO", paidDate: new Date().toISOString().slice(0, 10), paymentMethod: "Dinheiro" } : t
        ));
    };

    // Computations
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchTab = activeTab === "TODOS" || (activeTab === "RECEITAS" && t.type === "RECEITA") || (activeTab === "DESPESAS" && t.type === "DESPESA");
            const q = search.toLowerCase();
            const matchSearch = !q || t.description.toLowerCase().includes(q) || t.customerOrSupplier?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);

            let matchPeriod = true;
            if (filterPeriod === "MesAtual") {
                const currentMonth = new Date().toISOString().slice(0, 7);
                matchPeriod = t.dueDate.startsWith(currentMonth);
            }

            return matchTab && matchSearch && matchPeriod;
        }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()); // sort desc
    }, [transactions, activeTab, search, filterPeriod]);

    // Financial calculations based ONLY on current filtered period (ignoring tab and search for top stats if desired, but let's filter by period)
    const periodTransactions = transactions.filter(t => {
        if (filterPeriod === "MesAtual") {
            const currentMonth = new Date().toISOString().slice(0, 7);
            return t.dueDate.startsWith(currentMonth);
        }
        return true;
    });

    const totalIncome = periodTransactions.filter(t => t.type === "RECEITA" && t.status === "PAGO").reduce((s, t) => s + t.value, 0);
    const totalExpense = periodTransactions.filter(t => t.type === "DESPESA" && t.status === "PAGO").reduce((s, t) => s + t.value, 0);
    const balance = totalIncome - totalExpense;

    const pendingIncome = periodTransactions.filter(t => t.type === "RECEITA" && t.status !== "PAGO").reduce((s, t) => s + t.value, 0);
    const pendingExpense = periodTransactions.filter(t => t.type === "DESPESA" && t.status !== "PAGO").reduce((s, t) => s + t.value, 0);

    return (
        <div className="flex h-screen bg-brand-bg text-brand-text font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto space-y-6">

                        {/* Header */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <h1 className="text-3xl font-black text-brand-text tracking-tight">Financeiro</h1>
                                <p className="text-brand-muted text-sm font-medium mt-1">Gestão de fluxo de caixa, contas a pagar e a receber</p>
                            </motion.div>
                            <div className="flex items-center gap-3 self-start md:self-auto">
                                <button className="p-2.5 bg-brand-card border border-brand-darkBorder rounded-xl hover:bg-white/5 transition-colors text-brand-muted hover:text-brand-text" title="Exportar">
                                    <Download className="size-4" />
                                </button>
                                <button
                                    onClick={() => { setForm(blankTransaction("RECEITA")); setIsCreating(true); }}
                                    className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                                >
                                    <Plus className="size-4" /> Novo Lançamento
                                </button>
                            </div>
                        </header>

                        {/* Action Bar (Filters) */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex bg-brand-card p-1 rounded-xl border border-brand-darkBorder relative">
                                {(["TODOS", "RECEITAS", "DESPESAS"] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all relative z-10 ${activeTab === tab ? "text-white" : "text-brand-muted hover:text-brand-text"}`}
                                    >
                                        {activeTab === tab && (
                                            <motion.div layoutId="financeTab" className="absolute inset-0 bg-brand-primary rounded-lg -z-10 shadow-sm" />
                                        )}
                                        {tab === "TODOS" ? "Extrato Geral" : tab === "RECEITAS" ? "Receitas" : "Despesas"}
                                    </button>
                                ))}
                            </div>

                            <div className="h-8 w-px bg-brand-darkBorder hidden md:block mx-1"></div>

                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-brand-muted pointer-events-none" />
                                <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value as any)}
                                    className="pl-9 pr-8 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-text appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer hover:border-brand-primary/50 transition-colors">
                                    <option value="MesAtual">Mês Atual</option>
                                    <option value="Ultimos30">Últimos 30 dias</option>
                                    <option value="Todos">Todo o período</option>
                                </select>
                            </div>

                            <div className="flex-1 min-w-[200px] relative ml-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
                                <input type="text" placeholder="Buscar lançamentos..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-brand-card border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" />
                            </div>
                        </div>

                        {/* Top Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-brand-card border border-brand-darkBorder flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1.5"><Wallet className="size-3.5" /> Saldo Atual (Realizado)</p>
                                    <h2 className={`text-2xl font-black ${balance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>{formatCurrency(balance)}</h2>
                                </div>
                                <div className={`size-12 rounded-full flex items-center justify-center ${balance >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                                    <DollarSign className="size-6" />
                                </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl bg-brand-card border border-brand-darkBorder flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1.5"><TrendingUp className="size-3.5" /> Receitas (Pagas)</p>
                                    <h2 className="text-2xl font-black text-brand-text">{formatCurrency(totalIncome)}</h2>
                                    <p className="text-xs text-brand-muted mt-1 mt-1"><span className="text-amber-500 font-semibold">{formatCurrency(pendingIncome)}</span> a receber</p>
                                </div>
                                <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <ArrowUpRight className="size-6" />
                                </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-2xl bg-brand-card border border-brand-darkBorder flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1.5"><TrendingDown className="size-3.5" /> Despesas (Pagas)</p>
                                    <h2 className="text-2xl font-black text-brand-text">{formatCurrency(totalExpense)}</h2>
                                    <p className="text-xs text-brand-muted mt-1"><span className="text-rose-500 font-semibold">{formatCurrency(pendingExpense)}</span> a pagar</p>
                                </div>
                                <div className="size-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                    <ArrowDownRight className="size-6" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Sub Accounts (A Receber / A Pagar details) - Only show if overview tab */}
                        {activeTab === "TODOS" && (pendingIncome > 0 || pendingExpense > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingIncome > 0 && (
                                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><AlertCircle className="size-5" /></div>
                                            <div>
                                                <p className="text-xs font-bold text-amber-500 uppercase">Valores a Receber</p>
                                                <p className="text-sm font-semibold text-brand-text">Existem faturas de clientes pendentes de pagamento.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setActiveTab("RECEITAS")} className="px-4 py-2 bg-brand-bg border border-amber-500/20 rounded-lg text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-colors">Ver Receitas</button>
                                    </div>
                                )}
                                {pendingExpense > 0 && (
                                    <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><TrendingDown className="size-5" /></div>
                                            <div>
                                                <p className="text-xs font-bold text-rose-500 uppercase">Contas a Pagar</p>
                                                <p className="text-sm font-semibold text-brand-text">Existem despesas pendentes neste período.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setActiveTab("DESPESAS")} className="px-4 py-2 bg-brand-bg border border-rose-500/20 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors">Ver Despesas</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* List Area */}
                        <div className="bg-brand-card border border-brand-darkBorder rounded-2xl overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-brand-darkBorder flex items-center justify-between bg-white/5">
                                <h3 className="font-bold text-brand-text flex items-center gap-2 text-sm">
                                    <FileText className="size-4 text-brand-primary" /> Lançamentos
                                </h3>
                                <span className="text-xs text-brand-muted font-semibold">{filteredTransactions.length} registros</span>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-brand-darkBorder text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                                            <th className="px-6 py-4 font-bold">Data</th>
                                            <th className="px-6 py-4 font-bold">Descrição</th>
                                            <th className="px-6 py-4 font-bold">Categoria</th>
                                            <th className="px-6 py-4 font-bold">Valor</th>
                                            <th className="px-6 py-4 font-bold">Status</th>
                                            <th className="px-6 py-4 font-bold text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-darkBorder">
                                        <AnimatePresence>
                                            {filteredTransactions.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-brand-muted">
                                                        Nenhum lançamento encontrado para os filtros selecionados.
                                                    </td>
                                                </tr>
                                            )}
                                            {filteredTransactions.map(t => (
                                                <motion.tr key={t.id}
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className="hover:bg-white/5 transition-colors group"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <p className="text-sm font-semibold text-brand-text">{formatDate(t.dueDate)}</p>
                                                        {t.status === "PAGO" && t.paidDate && (
                                                            <p className="text-[10px] text-brand-muted mt-0.5" title="Data do Pagamento">Pago: {formatDate(t.paidDate)}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 border ${t.type === "RECEITA" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                                                                {t.type === "RECEITA" ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-brand-text line-clamp-1" title={t.description}>{t.description}</p>
                                                                <p className="text-xs text-brand-muted mt-0.5 line-clamp-1">{t.customerOrSupplier || "—"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-xs font-medium text-brand-muted px-2 py-1 bg-brand-bg rounded-lg border border-brand-darkBorder">{t.category}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <p className={`text-sm font-black ${t.type === "RECEITA" ? "text-emerald-500" : "text-brand-text"}`}>
                                                            {t.type === "DESPESA" && "-"} {formatCurrency(t.value)}
                                                        </p>
                                                        <p className="text-[10px] text-brand-muted mt-0.5">{t.paymentMethod || "—"}</p>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[t.status]}`}>
                                                            {t.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        {t.status !== "PAGO" ? (
                                                            <button
                                                                onClick={() => handleSettle(t.id)}
                                                                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                                                            >
                                                                <CheckCircle2 className="size-3" /> Dar Baixa
                                                            </button>
                                                        ) : (
                                                            <button className="p-1.5 text-brand-muted hover:text-brand-text transition-colors rounded-lg hover:bg-white/5">
                                                                <MoreVertical className="size-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* ── Modal: Novo Lançamento ── */}
            <AnimatePresence>
                {isCreating && (
                    <TransactionModal
                        key="create-transaction"
                        data={form}
                        onChange={handleFormChange}
                        onSave={handleCreate}
                        onCancel={() => setIsCreating(false)}
                    />
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
