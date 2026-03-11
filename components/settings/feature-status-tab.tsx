"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
    { key: "qr_codes", label: "Etiquetagem QR", description: "Geração e vinculação de QR codes às peças e pedidos", icon: QrCode, iconColor: "text-violet-500 bg-violet-500/10", requiredPlan: "pro" },
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

    const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpgrade = async (newPlan: PlanTier) => {
        setIsUpdating(true);
        try {
            const { error } = await supabase.rpc('update_my_subscription', { new_plan: newPlan });
            if (error) throw error;
            // Recarrega a página para atualizar todo o estado global (incluindo SettingsPage logica central)
            window.location.reload();
        } catch (err) {
            console.error("Erro ao atualizar plano", err);
            alert("Não foi possível atualizar o plano no momento. Tente novamente.");
            setIsUpdating(false);
        }
    };

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
                    <button
                        onClick={() => setIsPlansModalOpen(true)}
                        className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20"
                    >
                        Ver Planos
                    </button>
                </div>
            )}
            {/* Modal de Planos Opcional */}
            {!lockedCount && currentPlan !== 'enterprise' && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => setIsPlansModalOpen(true)}
                        className="px-5 py-2.5 bg-brand-card text-brand-text border border-brand-darkBorder rounded-xl text-sm font-bold hover:bg-brand-bg transition-all"
                    >
                        Ver Opções de Plano
                    </button>
                </div>
            )}

            {/* Modal de Upgrades */}
            {isPlansModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="relative w-full max-w-6xl py-12 flex flex-col items-center">
                        <button
                            onClick={() => setIsPlansModalOpen(false)}
                            className="absolute top-4 right-4 text-brand-muted hover:text-white bg-brand-card/50 p-2 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-white mb-3">Planos para o seu negócio</h2>
                            <p className="text-brand-muted">Escolha o melhor plano para escalar sua lavanderia com a LavanPro.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

                            {/* Starter */}
                            <div className="bg-brand-card border border-brand-darkBorder rounded-2xl p-8 flex flex-col relative">
                                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-white">R$97</span>
                                    <span className="text-brand-muted text-sm">/mês</span>
                                </div>
                                <p className="text-sm text-brand-muted mb-8">Ideal para pequenas lavanderias ou iniciantes.</p>

                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Gestão básica</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">1 Usuário</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Controle de caixa</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Suporte via email</span></li>
                                </ul>

                                <button
                                    onClick={() => handleUpgrade('free')}
                                    disabled={isUpdating || currentPlan === 'free'}
                                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-bg text-white border border-brand-darkBorder hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    {currentPlan === 'free' ? 'Plano Atual' : 'Começar Básico'}
                                </button>
                            </div>

                            {/* Profissional */}
                            <div className="bg-brand-card border-2 border-brand-primary rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-brand-primary/20">
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-full">
                                    Mais Popular
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Profissional</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-white">R$197</span>
                                    <span className="text-brand-muted text-sm">/mês</span>
                                </div>
                                <p className="text-sm text-brand-muted mb-8">Para lavanderias em crescimento que precisam de controle.</p>

                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Tudo do Starter</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">5 Usuários</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Financeiro Completo</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">App do Cliente</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Controle de rotas</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Suporte WhatsApp</span></li>
                                </ul>

                                <button
                                    onClick={() => handleUpgrade('pro')}
                                    disabled={isUpdating || currentPlan === 'pro'}
                                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-primary text-white hover:bg-brand-primaryHover transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                                >
                                    {currentPlan === 'pro' ? 'Seu Plano Atual' : isUpdating ? 'Aguarde...' : 'Aproveitar Oferta'}
                                </button>
                            </div>

                            {/* Enterprise */}
                            <div className="bg-brand-card border border-brand-darkBorder rounded-2xl p-8 flex flex-col relative">
                                <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-white">R$397</span>
                                    <span className="text-brand-muted text-sm">/mês</span>
                                </div>
                                <p className="text-sm text-brand-muted mb-8">Para redes de lavanderias e grandes operações.</p>

                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Tudo do Profissional</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Usuários Ilimitados</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Múltiplas Unidades</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">API Aberta</span></li>
                                    <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Gerente de contas</span></li>
                                </ul>

                                <button
                                    onClick={() => handleUpgrade('enterprise')}
                                    disabled={isUpdating || currentPlan === 'enterprise'}
                                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-bg text-white border border-brand-darkBorder hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    {currentPlan === 'enterprise' ? 'Plano Máximo Atual' : 'Escolher Enterprise'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
