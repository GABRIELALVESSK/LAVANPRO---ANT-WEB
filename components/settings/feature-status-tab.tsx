"use client";

import {
    LayoutGrid,
    ReceiptText,
    QrCode,
    Wallet,
    BarChart3,
    UserCog,
    Package,
    Bell,
    Check,
    Lock,
    Crown,
    Sparkles,
} from "lucide-react";

type PlanTier = "free" | "pro" | "enterprise";

interface FeatureModule {
    key: string;
    label: string;
    description: string;
    icon: React.ElementType;
    iconColor: string;
    requiredPlan: PlanTier;
}

const FEATURES: FeatureModule[] = [
    { key: "orders", label: "Pedidos", description: "Criação, edição e rastreamento de pedidos de lavanderia", icon: ReceiptText, iconColor: "text-blue-500 bg-blue-500/10", requiredPlan: "free" },
    { key: "qr_codes", label: "Etiquetagem QR", description: "Geração e vinculação de QR codes às peças e pedidos", icon: QrCode, iconColor: "text-violet-500 bg-violet-500/10", requiredPlan: "free" },
    { key: "customers", label: "Clientes", description: "Cadastro e gerenciamento da base de clientes", icon: UserCog, iconColor: "text-emerald-500 bg-emerald-500/10", requiredPlan: "free" },
    { key: "finance", label: "Financeiro", description: "Controle de receitas, despesas e fluxo de caixa", icon: Wallet, iconColor: "text-green-500 bg-green-500/10", requiredPlan: "pro" },
    { key: "reports", label: "Relatórios", description: "Relatórios gerenciais avançados e exportação de dados", icon: BarChart3, iconColor: "text-amber-500 bg-amber-500/10", requiredPlan: "pro" },
    { key: "team", label: "Equipe", description: "Gestão de colaboradores, turnos e produtividade", icon: UserCog, iconColor: "text-indigo-500 bg-indigo-500/10", requiredPlan: "pro" },
    { key: "stock", label: "Estoque", description: "Controle de insumos, alertas de reposição e movimentações", icon: Package, iconColor: "text-orange-500 bg-orange-500/10", requiredPlan: "enterprise" },
    { key: "notifications", label: "Notificações Avançadas", description: "WhatsApp, SMS e notificações push para clientes", icon: Bell, iconColor: "text-cyan-500 bg-cyan-500/10", requiredPlan: "pro" },
];

const PLAN_LABELS: Record<PlanTier, { label: string; color: string }> = {
    free: { label: "Gratuito", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
    pro: { label: "Pro", color: "bg-brand-primary/10 text-brand-primary border-brand-primary/20" },
    enterprise: { label: "Enterprise", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
};

interface FeatureStatusTabProps {
    currentPlan: PlanTier;
}

export function FeatureStatusTab({ currentPlan }: FeatureStatusTabProps) {
    const planRank: Record<PlanTier, number> = { free: 0, pro: 1, enterprise: 2 };
    const currentRank = planRank[currentPlan];

    const activeCount = FEATURES.filter((f) => planRank[f.requiredPlan] <= currentRank).length;
    const lockedCount = FEATURES.length - activeCount;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="size-14 rounded-xl bg-gradient-to-br from-brand-primary/20 to-amber-500/20 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                        <LayoutGrid className="size-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-text">Status de Funcionalidades</h3>
                        <p className="text-sm text-brand-muted">Visualize os módulos disponíveis no seu plano atual</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-brand-card border border-brand-darkBorder rounded-xl">
                    <Crown className="size-4 text-brand-primary" />
                    <span className="text-sm font-bold text-brand-text">Plano Atual:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${PLAN_LABELS[currentPlan].color}`}>
                        {PLAN_LABELS[currentPlan].label}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Check className="size-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-brand-text">{activeCount}</p>
                        <p className="text-xs text-brand-muted font-medium">Módulos Ativos</p>
                    </div>
                </div>
                <div className="bg-brand-card border border-brand-darkBorder rounded-xl p-5 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-brand-bg flex items-center justify-center">
                        <Lock className="size-6 text-brand-muted" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-brand-text">{lockedCount}</p>
                        <p className="text-xs text-brand-muted font-medium">Módulos Bloqueados</p>
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    const isActive = planRank[feature.requiredPlan] <= currentRank;
                    const planLabel = PLAN_LABELS[feature.requiredPlan];

                    return (
                        <div
                            key={feature.key}
                            className={`relative p-5 rounded-xl border transition-all ${isActive
                                    ? "bg-brand-card border-brand-darkBorder hover:border-brand-primary/30"
                                    : "bg-brand-bg/30 border-brand-darkBorder/50 opacity-70"
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${feature.iconColor}`}>
                                    <Icon className="size-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-bold text-brand-text">{feature.label}</h4>
                                        {isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold border border-emerald-500/20">
                                                <Check className="size-3" />
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-bg text-brand-muted rounded-full text-[10px] font-bold border border-brand-darkBorder">
                                                <Lock className="size-3" />
                                                Bloqueado
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-brand-muted">{feature.description}</p>
                                    {!isActive && (
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <Sparkles className="size-3 text-brand-primary" />
                                            <span className="text-[11px] text-brand-primary font-semibold">
                                                Disponível no plano {planLabel.label}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Plan badge */}
                            <div className="absolute top-4 right-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${planLabel.color}`}>
                                    {planLabel.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Upgrade CTA */}
            {lockedCount > 0 && (
                <div className="bg-gradient-to-r from-brand-primary/10 via-violet-500/10 to-amber-500/10 border border-brand-primary/20 rounded-xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                            <Crown className="size-6 text-brand-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-brand-text">Desbloqueie todos os módulos</p>
                            <p className="text-xs text-brand-muted">Faça upgrade do seu plano para acessar funcionalidades avançadas</p>
                        </div>
                    </div>
                    <button className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20">
                        Ver Planos
                    </button>
                </div>
            )}
        </div>
    );
}
