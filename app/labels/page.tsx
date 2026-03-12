"use client";

import { Sidebar } from "@/components/sidebar";
import { AccessGuard } from "@/components/access-guard";
import { PlanGuard } from "@/components/plan-guard";
import {
    QrCode, Search, Printer, Tag, History,
    CheckCircle2, ChevronRight, SearchCode,
    PackageX, User, Cpu, X, Link2, Unlink2,
    AlertCircle, CheckCheck, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import QRCode from "react-qr-code";
import { useSearchParams } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/library";
import Webcam from "react-webcam";

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = "Recebido" | "Em Triagem" | "Em Lavagem" | "Em Secagem" | "Em Finalização" | "Pronto" | "Entregue" | "Cancelado";
type LabelStatus = "available" | "assigned";

interface OrderItem { name: string; qty: number; category: string; }

interface MockOrder {
    id: string;
    clientName: string;
    clientPhone: string;
    status: OrderStatus;
    items: OrderItem[];
    createdAt: string;
}

interface ReusableLabel {
    id: string;
    code: string;           // e.g. "TAG-005"
    displayNumber: number;  // e.g. 5
    status: LabelStatus;
    currentOrderId: string | null;
}

interface LabelHistory {
    labelId: string;
    orderId: string;
    assignedAt: string;
    releasedAt: string | null;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_ORDERS_DB: MockOrder[] = [
    {
        id: "ORD-2856", clientName: "Carlos Machado", clientPhone: "(11) 98765-4321",
        status: "Em Finalização", createdAt: "2026-03-08T09:00:00Z",
        items: [
            { name: "Terno Completo - Paletó", qty: 1, category: "Roupas Formais" },
            { name: "Terno Completo - Calça", qty: 1, category: "Roupas Formais" },
            { name: "Camisa Social Branca", qty: 2, category: "Uso Diário" },
        ]
    },
    {
        id: "ORD-2855", clientName: "Maria Oliveira", clientPhone: "(11) 91234-5678",
        status: "Recebido", createdAt: "2026-03-08T14:00:00Z",
        items: [{ name: "Edredom Casal Master", qty: 1, category: "Cama, Mesa e Banho" }]
    },
    {
        id: "ORD-2854", clientName: "João Santos", clientPhone: "(11) 99887-6655",
        status: "Em Lavagem", createdAt: "2026-03-07T11:00:00Z",
        items: [
            { name: "Jaqueta de Couro", qty: 1, category: "Peças Especiais" },
            { name: "Calça Jeans", qty: 3, category: "Uso Diário" },
        ]
    },
    {
        id: "ORD-2853", clientName: "Ana Lima", clientPhone: "(11) 97766-5544",
        status: "Pronto", createdAt: "2026-03-07T08:00:00Z",
        items: [{ name: "Vestido de Festa", qty: 1, category: "Roupas Formais" }]
    },
];

const INITIAL_LABELS: ReusableLabel[] = Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    const code = `TAG-${String(n).padStart(3, "0")}`;
    // Pre-assign first 3 to orders
    const assignments: Record<number, string> = { 1: "ORD-2856", 2: "ORD-2855", 5: "ORD-2854" };
    return {
        id: `label-${n}`,
        code,
        displayNumber: n,
        status: assignments[n] ? "assigned" : "available",
        currentOrderId: assignments[n] ?? null,
    };
});

const INITIAL_HISTORY: LabelHistory[] = [
    { labelId: "label-1", orderId: "ORD-2856", assignedAt: "2026-03-08T09:05:00Z", releasedAt: null },
    { labelId: "label-2", orderId: "ORD-2855", assignedAt: "2026-03-08T14:05:00Z", releasedAt: null },
    { labelId: "label-5", orderId: "ORD-2854", assignedAt: "2026-03-07T11:05:00Z", releasedAt: null },
    { labelId: "label-3", orderId: "ORD-2853", assignedAt: "2026-03-06T08:05:00Z", releasedAt: "2026-03-07T16:00:00Z" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusColor(status: OrderStatus) {
    switch (status) {
        case "Recebido": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
        case "Em Triagem": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
        case "Em Lavagem": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
        case "Em Secagem": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        case "Em Finalização": return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
        case "Pronto": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        case "Entregue": return "text-teal-400 bg-teal-500/10 border-teal-500/20";
        case "Cancelado": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
        default: return "text-brand-muted bg-brand-bg border-brand-darkBorder";
    }
}

const PRODUCTION_STAGES: OrderStatus[] = ["Recebido", "Em Triagem", "Em Lavagem", "Em Secagem", "Em Finalização", "Pronto"];

function formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

// ─── Print Modal ──────────────────────────────────────────────────────────────
function PrintModal({ label, order, onClose }: { label: ReusableLabel; order: MockOrder | null; onClose: () => void }) {
    const [printing, setPrinting] = useState(false);
    const [printType, setPrintType] = useState<"label" | "order">("label");

    const handlePrint = () => {
        setPrinting(true);
        setTimeout(() => {
            window.print();
            setPrinting(false);
            // OnClose is omitted to let user see it sent
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:hidden">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-brand-card w-full max-w-sm rounded-2xl border border-brand-darkBorder shadow-2xl flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-brand-darkBorder bg-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                            <Printer className="size-4 text-brand-primary" /> Visualização de Impressão
                        </h3>
                        <button onClick={onClose} disabled={printing} className="text-brand-muted hover:text-white p-1.5 rounded-lg border border-brand-darkBorder bg-brand-bg md:transition-all"><X className="size-3.5" /></button>
                    </div>

                    {order && (
                        <div className="flex bg-brand-bg rounded-xl p-1 border border-brand-darkBorder">
                            <button
                                onClick={() => setPrintType("label")}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${printType === 'label' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-muted hover:text-brand-text'}`}
                            >
                                ETIQUETA TAG
                            </button>
                            <button
                                onClick={() => setPrintType("order")}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${printType === 'order' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-muted hover:text-brand-text'}`}
                            >
                                COMPROVANTE
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6 flex justify-center bg-zinc-950 overflow-y-auto max-h-[500px] custom-scrollbar">
                    {/* Visual Preview */}
                    <div id="printable-content" className="bg-white text-black p-6 w-[80mm] min-h-[80mm] shadow-sm text-center space-y-4 font-mono uppercase">
                        {printType === "label" ? (
                            <div className="space-y-4 py-4 border-2 border-black p-4">
                                <h4 className="font-black text-2xl leading-none italic">LavanPro</h4>
                                <div className="bg-black text-white rounded-lg py-4 border-4 border-black">
                                    <span className="text-7xl font-black tracking-tighter">{label.displayNumber}</span>
                                </div>
                                <div className="flex items-center justify-center p-2">
                                    <QRCode value={label.code} size={140} />
                                </div>
                                <p className="font-black text-xl tracking-[0.2em] bg-zinc-100 py-2 border-t border-b border-black">{label.code}</p>
                                {order && (
                                    <div className="text-[12px] space-y-1 text-left font-black pt-2">
                                        <div className="flex justify-between border-b border-black"><span>ORDEM:</span> <span>#{order.id}</span></div>
                                        <div className="flex justify-between"><span>CLIENTE:</span> <span className="truncate max-w-[150px]">{order.clientName}</span></div>
                                    </div>
                                )}
                            </div>
                        ) : order && (
                            <div className="space-y-4 text-[12px]">
                                <div className="border-b-4 border-double border-black pb-4">
                                    <h4 className="font-black text-3xl leading-none italic">LavanPro</h4>
                                    <p className="text-[10px] font-black mt-2 tracking-widest border border-black inline-block px-4 py-1">COMPROVANTE DE PEDIDO</p>
                                </div>

                                <div className="text-left space-y-3 font-black">
                                    <div className="flex justify-between text-xl border-b-2 border-black pb-1">
                                        <span>ORDEM:</span>
                                        <span>#{order.id}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px]">CLIENTE:</span>
                                        <span className="text-lg leading-none">{order.clientName}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-black pt-2">
                                        <span>ENTRADA:</span>
                                        <span>{formatDate(order.createdAt).split(' ')[0]}</span>
                                    </div>
                                </div>

                                <div className="border-t-2 border-b-2 border-black py-4 text-left">
                                    <p className="text-[11px] font-black mb-3 underline">ITENS DE LAVANDERIA</p>
                                    <div className="space-y-2">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex justify-between font-black items-start leading-tight">
                                                <span className="flex-1 pr-4">{item.name}</span>
                                                <span className="whitespace-nowrap">[{item.qty}]</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between pt-3 border-t border-dashed border-black text-lg">
                                            <span>TOTAL PEÇAS:</span>
                                            <span>{order.items.reduce((acc, curr) => acc + curr.qty, 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-3 pt-2">
                                    <QRCode value={`https://lavanpro.com/track/${order.id}`} size={120} />
                                    <p className="text-[10px] font-black tracking-tighter">RASTREAMENTO ONLINE</p>
                                </div>

                                <div className="pt-6 border-t-4 border-double border-black">
                                    <p className="font-black text-xs mb-2">TAG VINCULADA: {label.code}</p>
                                    <p className="text-[10px] font-black leading-tight">
                                        CONFIRA SUAS PEÇAS NO ATO DA ENTREGA.<br />
                                        OBRIGADO PELA PREFERÊNCIA!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-brand-darkBorder bg-white/5">
                    <button onClick={handlePrint} disabled={printing}
                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2">
                        {printing ? (
                            <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="size-4 border-2 border-white/30 border-t-white rounded-full" /> Enviando...</>
                        ) : (
                            <><Printer className="size-4" /> Imprimir Agora</>
                        )}
                    </button>
                    <p className="text-[10px] text-center text-brand-muted mt-3 font-medium">Compatível com impressoras térmicas de 58mm/80mm.</p>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ReusableLabelsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-brand-bg text-brand-text">Carregando...</div>}>
            <LabelsContent />
        </Suspense>
    );
}

function LabelsContent() {
    const [labels, setLabels] = useState<ReusableLabel[]>(() => {
        if (typeof window === "undefined") return INITIAL_LABELS;
        try {
            const saved = localStorage.getItem("lavanpro_labels");
            return saved ? JSON.parse(saved) : INITIAL_LABELS;
        } catch { return INITIAL_LABELS; }
    });
    const [history, setHistory] = useState<LabelHistory[]>(() => {
        if (typeof window === "undefined") return INITIAL_HISTORY;
        try {
            const saved = localStorage.getItem("lavanpro_label_history");
            return saved ? JSON.parse(saved) : INITIAL_HISTORY;
        } catch { return INITIAL_HISTORY; }
    });
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | LabelStatus>("all");
    const [selectedLabel, setSelectedLabel] = useState<ReusableLabel | null>(null);
    const [printLabel, setPrintLabel] = useState<ReusableLabel | null>(null);
    const [scanModal, setScanModal] = useState<ReusableLabel | null>(null);
    const [linkOrderId, setLinkOrderId] = useState("");
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [globalOrders, setGlobalOrders] = useState<MockOrder[]>(SEED_ORDERS_DB);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [genQty, setGenQty] = useState(5);

    // ── Sincronizar com Banco de Pedidos Global ──
    useEffect(() => {
        const syncOrders = () => {
            const saved = localStorage.getItem("lavanpro_orders_v3");
            if (saved) {
                try {
                    const rawOrders = JSON.parse(saved);
                    // Mapeia do formato da página Orders para o formato local
                    const mapped: MockOrder[] = rawOrders.map((o: any) => ({
                        id: String(o.id).replace("#", ""),
                        clientName: o.client,
                        clientPhone: o.phone,
                        status: o.status,
                        items: o.items.map((it: any) => ({ name: it.service, qty: it.qty, category: "—" })),
                        createdAt: o.createdAt
                    }));
                    setGlobalOrders(mapped);
                } catch (e) { console.error("Erro ao sincronizar pedidos:", e); }
            }
        };
        syncOrders();
        window.addEventListener("storage", syncOrders);
        return () => window.removeEventListener("storage", syncOrders);
    }, []);

    // ── Persistir labels e histórico no localStorage ──
    useEffect(() => {
        localStorage.setItem("lavanpro_labels", JSON.stringify(labels));
    }, [labels]);
    useEffect(() => {
        localStorage.setItem("lavanpro_label_history", JSON.stringify(history));
    }, [history]);

    const searchParams = useSearchParams();

    // Ler query param ?order= vindo da página de Pedidos
    useEffect(() => {
        const orderId = searchParams.get("order");
        if (!orderId) return;
        const cleanId = String(orderId).replace("#", "");
        // Verifica se já existe etiqueta vinculada a este pedido
        const linked = labels.find(l => l.currentOrderId === cleanId);
        if (linked) {
            setSelectedLabel(linked);
            showToast(`Etiqueta ${linked.code} está vinculada ao pedido ${cleanId}.`);
        } else {
            // Sem etiqueta vinculada: selecionar primeira disponível e pré-preencher o campo
            const first = labels.find(l => l.status === "available");
            if (first) setSelectedLabel(first);
            setLinkOrderId(cleanId);
            showToast(`Pedido ${cleanId} ainda não tem etiqueta. Selecione uma e vincule!`, "error");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, labels]);

    const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ── Generate More Labels ────────────────
    const generateMoreLabels = (qty: number) => {
        if (qty <= 0 || qty > 100) {
            showToast("Quantidade inválida (entre 1 e 100).", "error");
            return;
        }
        setIsGenerating(true);
        setTimeout(() => {
            setLabels(prev => {
                const maxNum = prev.length > 0 ? Math.max(...prev.map(l => l.displayNumber)) : 0;
                const startNum = maxNum + 1;
                const newLabels: ReusableLabel[] = Array.from({ length: qty }, (_, i) => {
                    const n = startNum + i;
                    return {
                        id: `label-${Math.random().toString(36).substr(2, 9)}`,
                        code: `TAG-${String(n).padStart(3, "0")}`,
                        displayNumber: n,
                        status: "available",
                        currentOrderId: null,
                    };
                });
                return [...prev, ...newLabels];
            });
            setIsGenerating(false);
            showToast(`Criamos mais ${qty} etiquetas para seu estoque!`);
        }, 800);
    };

    // ── Delete Label ────────────────────────
    const deleteLabel = (labelId: string) => {
        const label = labels.find(l => l.id === labelId);
        if (!label) return;
        if (label.status === "assigned") {
            showToast("Não é possível deletar uma etiqueta em uso.", "error");
            return;
        }
        if (window.confirm(`Tem certeza que deseja remover permanentemente a etiqueta ${label.code}?`)) {
            setLabels(prev => prev.filter(l => l.id !== labelId));
            if (selectedLabel?.id === labelId) setSelectedLabel(null);
            showToast(`Etiqueta ${label.code} removida com sucesso.`);
        }
    };

    // ── Camera Scan Handler ──────────────────
    const handleCameraScan = useCallback((code: string) => {
        const cleanCode = code.toUpperCase().trim();
        const found = labels.find(l => l.code === cleanCode);
        if (found) {
            setScanModal(found);
            setIsCameraActive(false);
            showToast(`Etiqueta ${cleanCode} identificada com sucesso!`);
        } else {
            showToast(`Código ${cleanCode} não reconhecido no sistema.`, "error");
        }
    }, [labels, showToast]);

    // ── Scan Mode Listener ──────────────────
    useEffect(() => {
        let buf = "";
        let last = Date.now();
        const handler = (e: KeyboardEvent) => {
            if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return;
            const now = Date.now();
            if (now - last > 80) buf = "";
            last = now;
            if (e.key === "Enter") {
                if (buf.length > 0) {
                    const found = labels.find(l => l.code === buf.toUpperCase());
                    if (found) setScanModal(found);
                    buf = "";
                }
            } else if (e.key.length === 1) {
                buf += e.key;
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [labels]);

    // ── Assign label to order ───────────────
    const assignLabel = (label: ReusableLabel, orderId: string) => {
        const trimmedId = orderId.trim().toUpperCase().replace("#", "");
        if (!trimmedId) { showToast("Informe o código do pedido.", "error"); return; }
        const alreadyLinked = labels.find(l => l.currentOrderId === trimmedId && l.id !== label.id);
        if (alreadyLinked) { showToast(`O pedido ${trimmedId} já está vinculado à Etiqueta ${alreadyLinked.displayNumber}.`, "error"); return; }

        // Se o pedido não estiver no banco, adiciona um registro mínimo
        if (!globalOrders.find(o => o.id === trimmedId)) {
            const newOrderStub = {
                id: trimmedId, clientName: "Cliente Manual", clientPhone: "—",
                status: "Recebido" as OrderStatus, createdAt: new Date().toISOString(), items: []
            };
            setGlobalOrders(prev => [...prev, newOrderStub]);
        }

        setLabels(prev => prev.map(l => l.id === label.id
            ? { ...l, status: "assigned", currentOrderId: trimmedId }
            : l
        ));
        setHistory(prev => [...prev, { labelId: label.id, orderId: trimmedId, assignedAt: new Date().toISOString(), releasedAt: null }]);
        setSelectedLabel(prev => prev?.id === label.id ? { ...prev, status: "assigned", currentOrderId: trimmedId } : prev);
        setScanModal(prev => prev?.id === label.id ? { ...prev, status: "assigned", currentOrderId: trimmedId } : prev);
        setLinkOrderId("");
        showToast(`Etiqueta ${label.code} vinculada ao pedido ${trimmedId}!`);
    };

    const handleStageAdvancement = (label: ReusableLabel, order: MockOrder, newStage: OrderStatus) => {
        // 1. Atualiza no localStorage global de pedidos
        try {
            const savedOrders = localStorage.getItem("lavanpro_orders_v3");
            if (savedOrders) {
                const rawOrders = JSON.parse(savedOrders);
                const updatedOrders = rawOrders.map((o: any) =>
                    String(o.id).replace("#", "") === order.id ? { ...o, status: newStage } : o
                );
                localStorage.setItem("lavanpro_orders_v3", JSON.stringify(updatedOrders));

                // Dispara evento de storage para atualizar o estado local 'globalOrders'
                window.dispatchEvent(new Event("storage"));
            }
        } catch (e) { console.error("Erro ao atualizar status do pedido:", e); }

        // 2. Se for "Entregue", perguntar se quer desvincular
        if (newStage === "Entregue") {
            const confirmRelease = window.confirm(`O pedido ${order.id} foi marcado como Entregue. Deseja liberar a etiqueta ${label.code} agora?`);
            if (confirmRelease) {
                releaseLabel(label);
            }
        } else {
            showToast(`Status do pedido ${order.id} alterado para ${newStage}.`);
        }
    };

    // ── Release label ───────────────────────
    const releaseLabel = (label: ReusableLabel) => {
        setLabels(prev => prev.map(l => l.id === label.id
            ? { ...l, status: "available", currentOrderId: null }
            : l
        ));
        setHistory(prev => prev.map(h =>
            h.labelId === label.id && h.releasedAt === null
                ? { ...h, releasedAt: new Date().toISOString() }
                : h
        ));
        setSelectedLabel(prev => prev?.id === label.id ? { ...prev, status: "available", currentOrderId: null } : prev);
        setScanModal(null);
        showToast(`Etiqueta ${label.code} liberada! Disponível para reuso.`);
    };

    // ── Derived data ────────────────────────
    const filteredLabels = useMemo(() => {
        return labels.filter(l => {
            const matchSearch = l.code.includes(search.toUpperCase()) || String(l.displayNumber).includes(search);
            const matchStatus = filterStatus === "all" || l.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [labels, search, filterStatus]);

    const getOrderForLabel = (label: ReusableLabel) =>
        label.currentOrderId ? globalOrders.find(o => o.id === label.currentOrderId) ?? null : null;

    const availableCount = labels.filter(l => l.status === "available").length;
    const assignedCount = labels.filter(l => l.status === "assigned").length;

    // ── Selected label + its order ──────────
    const selectedLabelState = selectedLabel ? labels.find(l => l.id === selectedLabel.id) ?? selectedLabel : null;
    const selectedOrder = selectedLabelState ? getOrderForLabel(selectedLabelState) : null;

    // ── Scan modal label (kept in sync) ────
    const scanLabelState = scanModal ? labels.find(l => l.id === scanModal.id) ?? scanModal : null;
    const scanOrder = scanLabelState ? getOrderForLabel(scanLabelState) : null;

    const labelHistory = (lbl: ReusableLabel) => history.filter(h => h.labelId === lbl.id);

    return (
        <AccessGuard permission="labels">
            <div className="flex h-screen bg-brand-bg text-brand-text font-sans">
                <Sidebar />
                <PlanGuard moduleName="Etiquetagem QR" requiredPlan="pro">
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                            <div className="max-w-[1600px] mx-auto space-y-6">

                                {/* Header */}
                                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                        <h1 className="text-3xl font-black text-brand-text tracking-tight">Etiquetagem QR</h1>
                                        <p className="text-brand-muted text-sm font-medium mt-1">Etiquetas físicas reutilizáveis — vínculo dinâmico com pedidos.</p>
                                    </motion.div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center bg-brand-bg border border-brand-darkBorder rounded-xl overflow-hidden focus-within:border-brand-primary transition-all">
                                            <input
                                                type="number"
                                                value={genQty}
                                                onChange={e => setGenQty(parseInt(e.target.value) || 1)}
                                                className="w-16 px-3 py-2 bg-transparent text-xs font-bold text-center border-r border-brand-darkBorder focus:outline-none"
                                                min="1" max="100"
                                            />
                                            <button
                                                onClick={() => generateMoreLabels(genQty)}
                                                disabled={isGenerating}
                                                className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 text-xs font-bold hover:bg-brand-primaryHover transition-all disabled:opacity-50"
                                            >
                                                {isGenerating ? (
                                                    <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <QrCode className="size-3.5" />
                                                )}
                                                Gerar Etiquetas
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setIsCameraActive(true)}
                                            className="flex items-center gap-2 bg-brand-bg border border-brand-darkBorder text-brand-text px-4 py-2 rounded-xl text-xs font-bold hover:border-brand-primary transition-all"
                                        >
                                            <Cpu className="size-3.5 text-brand-primary" /> Scan com Câmera
                                        </button>
                                        <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold">
                                            <CheckCheck className="size-3.5" /> {availableCount} Livre
                                        </div>
                                    </div>
                                </header>

                                {/* Stats strip */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "Total de Etiquetas", value: labels.length, icon: Tag, color: "text-brand-primary" },
                                        { label: "Disponíveis", value: availableCount, icon: CheckCircle2, color: "text-emerald-400" },
                                        { label: "Em Uso", value: assignedCount, icon: Link2, color: "text-brand-primary" },
                                        { label: "Ciclos Históricos", value: history.filter(h => h.releasedAt).length, icon: History, color: "text-amber-400" },
                                    ].map(s => (
                                        <div key={s.label} className="bg-brand-card border border-brand-darkBorder rounded-2xl p-4 flex items-center gap-4">
                                            <div className={`p-2 bg-white/5 rounded-xl ${s.color}`}><s.icon className="size-5" /></div>
                                            <div>
                                                <p className="text-2xl font-black text-brand-text">{s.value}</p>
                                                <p className="text-xs text-brand-muted font-medium">{s.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Main Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ minHeight: "520px" }}>

                                    {/* Left: Label stock */}
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="lg:col-span-7 bg-brand-card rounded-2xl border border-brand-darkBorder flex flex-col overflow-hidden">
                                        <div className="p-4 border-b border-brand-darkBorder bg-white/5 space-y-3">
                                            <h2 className="font-bold text-sm tracking-wide uppercase text-brand-muted flex items-center gap-2">
                                                <Tag className="size-4" /> Estoque de Etiquetas Físicas
                                            </h2>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
                                                    <input type="text" placeholder="Buscar TAG-001, número..."
                                                        value={search} onChange={e => setSearch(e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                                                </div>
                                                {(["all", "available", "assigned"] as const).map(f => (
                                                    <button key={f} onClick={() => setFilterStatus(f)}
                                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${filterStatus === f ? "bg-brand-primary text-white border-brand-primary" : "border-brand-darkBorder text-brand-muted hover:text-brand-text bg-transparent"}`}>
                                                        {f === "all" ? "Todas" : f === "available" ? "Livre" : "Em Uso"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                <AnimatePresence>
                                                    {filteredLabels.length === 0 && (
                                                        <div className="col-span-full text-center py-16 text-brand-muted text-sm flex flex-col items-center gap-2">
                                                            <PackageX className="size-8 opacity-20" />
                                                            <p>Nenhuma etiqueta encontrada.</p>
                                                        </div>
                                                    )}
                                                    {filteredLabels.map(label => {
                                                        const ord = getOrderForLabel(label);
                                                        const isSelected = selectedLabelState?.id === label.id;
                                                        const isAvail = label.status === "available";
                                                        return (
                                                            <motion.button key={label.id}
                                                                onClick={() => setSelectedLabel(label)}
                                                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                                                className={`relative rounded-2xl border p-3 flex flex-col items-center gap-2 transition-all group text-left 
                                                            ${isSelected ? "border-brand-primary bg-brand-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]" : "border-brand-darkBorder bg-brand-bg hover:border-brand-primary/40 hover:bg-white/3"}`}>
                                                                {/* Status pill */}
                                                                <div className={`absolute top-2 right-2 size-2.5 rounded-full ${isAvail ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-brand-primary shadow-[0_0_6px_rgba(139,92,246,0.6)]"}`} />
                                                                {/* Tag Number */}
                                                                <div className={`size-14 rounded-xl flex items-center justify-center font-black text-3xl leading-none ${isAvail ? "bg-emerald-500/10 text-emerald-400" : "bg-brand-primary/10 text-brand-primary"}`}>
                                                                    {label.displayNumber}
                                                                </div>
                                                                {/* QR */}
                                                                <div className="bg-white p-1.5 rounded-lg">
                                                                    <QRCode value={label.code} size={56} />
                                                                </div>
                                                                <p className="text-[10px] font-black tracking-widest text-brand-muted">{label.code}</p>
                                                                {ord && (
                                                                    <p className="text-[9px] font-bold text-brand-primary bg-brand-primary/10 rounded-md px-2 py-0.5 truncate max-w-full">{ord.id}</p>
                                                                )}
                                                                {isAvail && <p className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 rounded-md px-2 py-0.5">Disponível</p>}

                                                                <div className="flex items-center gap-3 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={e => { e.stopPropagation(); setPrintLabel(label); }}
                                                                        className="text-[9px] font-bold text-brand-muted hover:text-brand-primary flex items-center gap-1 transition-colors">
                                                                        <Printer className="size-3" /> Imprimir
                                                                    </button>
                                                                    {isAvail && (
                                                                        <button onClick={e => { e.stopPropagation(); deleteLabel(label.id); }}
                                                                            className="text-[9px] font-bold text-brand-muted hover:text-rose-400 flex items-center gap-1 transition-colors">
                                                                            <X className="size-3" /> Deletar
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Right: Label detail panel */}
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                                        className="lg:col-span-5 bg-brand-card rounded-2xl border border-brand-darkBorder flex flex-col overflow-hidden">
                                        {!selectedLabelState ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-brand-muted space-y-4 p-8 text-center">
                                                <div className="size-20 bg-brand-bg rounded-full flex items-center justify-center border border-brand-darkBorder">
                                                    <QrCode className="size-8 text-brand-primary opacity-50" />
                                                </div>
                                                <p className="text-sm font-medium">Selecione uma etiqueta à esquerda para ver seus detalhes.</p>
                                                <p className="text-xs opacity-50">Ou aponte o scanner físico para uma etiqueta TAG.</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                                                {/* Detail header */}
                                                <div className="p-5 border-b border-brand-darkBorder bg-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`size-16 rounded-2xl flex items-center justify-center font-black text-4xl shrink-0 ${selectedLabelState.status === "available" ? "bg-emerald-500/10 text-emerald-400" : "bg-brand-primary/10 text-brand-primary"}`}>
                                                            {selectedLabelState.displayNumber}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h2 className="font-black text-xl text-brand-text">{selectedLabelState.code}</h2>
                                                            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border mt-1 ${selectedLabelState.status === "available" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-brand-primary bg-brand-primary/10 border-brand-primary/20"}`}>
                                                                {selectedLabelState.status === "available" ? <><CheckCircle2 className="size-3" /> Disponível</> : <><Link2 className="size-3" /> Em Uso</>}
                                                            </div>
                                                        </div>
                                                        <div className="bg-white p-1.5 rounded-xl shrink-0">
                                                            <QRCode value={selectedLabelState.code} size={64} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 space-y-5 flex-1">
                                                    {/* If assigned — show order detail */}
                                                    {selectedLabelState.status === "assigned" && selectedOrder ? (
                                                        <div className="space-y-4">
                                                            <div className="bg-brand-bg border border-brand-darkBorder rounded-2xl p-4 space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <h3 className="font-bold text-sm text-brand-text flex items-center gap-2">
                                                                        <SearchCode className="size-4 text-brand-primary" /> Pedido Vinculado
                                                                    </h3>
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                                                                </div>
                                                                <div className="space-y-1 text-sm">
                                                                    <p className="font-black text-brand-primary text-base">{selectedOrder.id}</p>
                                                                    <p className="flex items-center gap-2 text-brand-muted"><User className="size-3.5" /> {selectedOrder.clientName}</p>
                                                                    <p className="text-xs text-brand-muted">{selectedOrder.clientPhone}</p>
                                                                </div>
                                                                <div className="border-t border-brand-darkBorder pt-3">
                                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Itens do Pedido</p>
                                                                    <div className="space-y-1.5">
                                                                        {selectedOrder.items.map((item, i) => (
                                                                            <div key={i} className="flex items-center justify-between text-xs">
                                                                                <span className="text-brand-muted">{item.name}</span>
                                                                                <span className="font-bold text-brand-text bg-brand-card border border-brand-darkBorder px-2 py-0.5 rounded-lg">x{item.qty}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Stage advancement */}
                                                            <div>
                                                                <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">Avançar Etapa Operacional</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {PRODUCTION_STAGES.filter(s => s !== selectedOrder.status).map(stage => (
                                                                        <button key={stage}
                                                                            onClick={() => handleStageAdvancement(selectedLabelState, selectedOrder, stage)}
                                                                            className="px-3 py-1.5 border border-brand-darkBorder rounded-lg text-xs font-bold text-brand-muted hover:text-brand-text hover:border-brand-primary bg-brand-bg hover:bg-brand-primary/10 transition-colors">
                                                                            {stage}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Release button */}
                                                            <button onClick={() => releaseLabel(selectedLabelState)}
                                                                className="w-full py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-bold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2">
                                                                <Unlink2 className="size-4" /> Liberar Etiqueta (Concluir / Desassociar Pedido)
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        /* If available — show link form */
                                                        <div className="space-y-4">
                                                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center">
                                                                <CheckCircle2 className="size-8 text-emerald-400 mx-auto mb-2" />
                                                                <p className="font-bold text-emerald-400 text-sm">Etiqueta Disponível</p>
                                                                <p className="text-xs text-brand-muted mt-1">Pronta para ser vinculada a um novo pedido.</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Vincular a um Pedido</label>
                                                                <div className="relative">
                                                                    <input
                                                                        list="orders-datalist"
                                                                        value={linkOrderId}
                                                                        onChange={e => setLinkOrderId(e.target.value.trim().toUpperCase())}
                                                                        placeholder="Ex: ORD-2856, ORD-5792..."
                                                                        className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                                                    />
                                                                    <datalist id="orders-datalist">
                                                                        {globalOrders.filter(o => !labels.some(l => l.currentOrderId === o.id)).map(o => (
                                                                            <option key={o.id} value={o.id}>{o.id} — {o.clientName}</option>
                                                                        ))}
                                                                    </datalist>
                                                                </div>
                                                                <button onClick={() => linkOrderId && assignLabel(selectedLabelState, linkOrderId)} disabled={!linkOrderId}
                                                                    className="w-full py-3 bg-brand-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                                                    <Link2 className="size-4" /> Vincular Etiqueta {selectedLabelState.code}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* History */}
                                                    {labelHistory(selectedLabelState).length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1.5"><History className="size-3.5" /> Histórico de Usos</p>
                                                            <div className="space-y-2">
                                                                {labelHistory(selectedLabelState).slice().reverse().map((h, i) => (
                                                                    <div key={i} className="flex items-center gap-3 text-xs bg-brand-bg border border-brand-darkBorder rounded-xl p-3">
                                                                        <div className={`size-2 rounded-full shrink-0 ${h.releasedAt ? "bg-brand-muted" : "bg-emerald-400"}`} />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-bold text-brand-text">{h.orderId}</p>
                                                                            <p className="text-brand-muted text-[10px]">{formatDate(h.assignedAt)} {h.releasedAt ? `→ ${formatDate(h.releasedAt)}` : "(em uso)"}</p>
                                                                        </div>
                                                                        {!h.releasedAt && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Atual</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </main>
                    </div>
                </PlanGuard>

                {/* Print Modal */}
                <AnimatePresence>
                    {printLabel && (
                        <PrintModal
                            label={printLabel}
                            order={getOrderForLabel(printLabel)}
                            onClose={() => setPrintLabel(null)}
                        />
                    )}
                </AnimatePresence>

                {/* Scan Action Modal */}
                <AnimatePresence>
                    {scanLabelState && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-brand-card w-full max-w-lg rounded-2xl border border-brand-primary/50 shadow-2xl flex flex-col overflow-hidden">
                                {/* Modal Header */}
                                <div className="p-5 border-b border-brand-darkBorder bg-brand-primary/10 flex items-center gap-4">
                                    <div className="size-12 bg-brand-primary rounded-2xl flex items-center justify-center shrink-0">
                                        <span className="font-black text-2xl text-white">{scanLabelState.displayNumber}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">Leitura Bem-Sucedida!</p>
                                        <h3 className="font-black text-lg text-white leading-tight">{scanLabelState.code}</h3>
                                    </div>
                                    <div className="bg-white p-1 rounded-lg shrink-0">
                                        <QRCode value={scanLabelState.code} size={48} />
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-5 space-y-4">
                                    {scanLabelState.status === "available" ? (
                                        <>
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                                <CheckCircle2 className="size-6 text-emerald-400 mx-auto mb-1" />
                                                <p className="font-bold text-emerald-400">Etiqueta Disponível</p>
                                                <p className="text-xs text-brand-muted mt-1">Esta etiqueta está livre. Vincule-a a um pedido.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <input
                                                    list="scan-orders-datalist"
                                                    value={linkOrderId}
                                                    onChange={e => setLinkOrderId(e.target.value.trim().toUpperCase())}
                                                    placeholder="Ex: ORD-5792..."
                                                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                                />
                                                <datalist id="scan-orders-datalist">
                                                    {globalOrders.filter(o => !labels.some(l => l.currentOrderId === o.id)).map((o: MockOrder) => (
                                                        <option key={o.id} value={o.id}>{o.id} — {o.clientName}</option>
                                                    ))}
                                                </datalist>
                                                <button onClick={() => linkOrderId && assignLabel(scanLabelState, linkOrderId)} disabled={!linkOrderId}
                                                    className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                                                    <Link2 className="size-4" /> Vincular
                                                </button>
                                            </div>                            </>
                                    ) : scanOrder ? (
                                        <>
                                            <div className="bg-brand-bg border border-brand-darkBorder rounded-2xl p-4 space-y-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-black text-brand-primary">{scanOrder.id}</p>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(scanOrder.status)}`}>{scanOrder.status}</span>
                                                </div>
                                                <p className="text-sm flex items-center gap-2 text-brand-muted"><User className="size-3.5" /> {scanOrder.clientName}</p>
                                                <div className="border-t border-brand-darkBorder pt-2 mt-2">
                                                    {scanOrder.items.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-xs py-0.5">
                                                            <span className="text-brand-muted">{item.name}</span>
                                                            <span className="font-bold text-brand-text">x{item.qty}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">Avançar para qual etapa?</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {PRODUCTION_STAGES.filter(s => s !== scanOrder.status).map(stage => (
                                                        <button key={stage} onClick={() => {
                                                            handleStageAdvancement(scanLabelState, scanOrder, stage);
                                                            setScanModal(null);
                                                        }}
                                                            className="py-2 border border-brand-darkBorder rounded-xl text-xs font-bold text-brand-muted hover:text-brand-text hover:border-brand-primary hover:bg-brand-primary/10 transition-colors bg-brand-bg">
                                                            {stage}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button onClick={() => releaseLabel(scanLabelState)}
                                                className="w-full py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-bold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2">
                                                <Unlink2 className="size-4" /> Liberar Etiqueta
                                            </button>
                                        </>
                                    ) : null}
                                </div>

                                <div className="p-4 border-t border-brand-darkBorder bg-white/5 flex justify-end">
                                    <button onClick={() => { setScanModal(null); setLinkOrderId(""); }}
                                        className="px-4 py-2 bg-brand-bg border border-brand-darkBorder rounded-xl text-sm font-bold text-brand-muted hover:text-white transition-colors">
                                        Fechar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Camera Scanner Modal */}
                <AnimatePresence>
                    {isCameraActive && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-brand-card w-full max-w-lg rounded-3xl border border-brand-primary/30 overflow-hidden relative shadow-2xl">
                                <div className="p-6 border-b border-brand-darkBorder flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <div className="size-2 bg-brand-primary rounded-full animate-pulse" />
                                        Scanner de Câmera (Mobile/PC)
                                    </h3>
                                    <button onClick={() => setIsCameraActive(false)} className="text-brand-muted hover:text-white transition-colors">
                                        <X className="size-6" />
                                    </button>
                                </div>

                                <div className="aspect-square relative overflow-hidden bg-black">
                                    <Webcam
                                        audio={false}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ facingMode: "environment" }}
                                        className="w-full h-full object-cover"
                                        onUserMedia={() => {
                                            const codeReader = new BrowserMultiFormatReader();
                                            const videoElement = document.querySelector('video') as HTMLVideoElement;
                                            if (videoElement) {
                                                (codeReader as any).decodeFromVideoElement(videoElement, (result: any) => {
                                                    if (result) handleCameraScan(result.getText());
                                                });
                                            }
                                        }}
                                    />
                                    {/* Overlay for scan area */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <div className="size-64 border-4 border-brand-primary/50 rounded-3xl relative">
                                            <div className="absolute top-[-4px] left-[-4px] size-12 border-t-8 border-l-8 border-brand-primary rounded-tl-xl" />
                                            <div className="absolute top-[-4px] right-[-4px] size-12 border-t-8 border-r-8 border-brand-primary rounded-tr-xl" />
                                            <div className="absolute bottom-[-4px] left-[-4px] size-12 border-b-8 border-l-8 border-brand-primary rounded-bl-xl" />
                                            <div className="absolute bottom-[-4px] right-[-4px] size-12 border-b-8 border-r-8 border-brand-primary rounded-br-xl" />
                                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-brand-primary/50 animate-[scan_2s_linear_infinite]" />
                                        </div>
                                        <p className="mt-8 text-white/70 text-sm font-bold bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">Posicione o QR Code da TAG no centro</p>
                                    </div>
                                </div>

                                <div className="p-6 text-center text-brand-muted text-xs">
                                    Use a câmera do celular ou leitor USB. O sistema detecta o código automaticamente ao identificar o padrão LavanPro.
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-bold max-w-sm
                        ${toast.type === "success" ? "bg-emerald-500/90 border-emerald-400/50 text-white" : "bg-rose-500/90 border-rose-400/50 text-white"}`}>
                            {toast.type === "success" ? <CheckCheck className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                            {toast.msg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }

                @media print {
                    /* Reset Geral */
                    @page { margin: 0; size: auto; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    
                    body { 
                        visibility: hidden; 
                        background: white !important;
                    }

                    /* Mostra apenas a área de impressão */
                    #printable-content, #printable-content * {
                        visibility: visible !important;
                        color: black !important;
                    }

                    #printable-content {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 80mm !important;
                        margin: 0 auto !important;
                        padding: 10mm !important;
                        background: white !important;
                        display: block !important;
                        height: auto !important;
                        box-shadow: none !important;
                        border: none !important;
                        z-index: 9999 !important;
                    }

                    /* Garantia de cores pretas para impressão térmica */
                    #printable-content .bg-black {
                        background-color: black !important;
                        color: white !important;
                        border: 1px solid black !important;
                    }
                    
                    /* Esconde elementos indesejáveis do modal que podem vazar */
                    .bg-black\/80, .fixed.inset-0.z-50:not(#printable-content) {
                        display: none !important;
                    }
                }
            `}</style>
            </div>
        </AccessGuard>
    );
}
