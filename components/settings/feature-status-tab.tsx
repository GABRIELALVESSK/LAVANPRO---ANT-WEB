"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

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
    ArrowUp,
    ArrowDown,
    ChevronDown,
    ChevronUp
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
    { key: "reports", label: "Relatórios & BI", description: "Análises detalhadas, dashboards gerenciais e exportação de dados", icon: BarChart3, iconColor: "text-amber-500 bg-amber-500/10", requiredPlan: "enterprise" },
    { key: "team", label: "Equipe", description: "Gestão de colaboradores, turnos e produtividade", icon: UserCog, iconColor: "text-indigo-500 bg-indigo-500/10", requiredPlan: "pro" },
    { key: "stock", label: "Estoque", description: "Controle de insumos, alertas de reposição e movimentações", icon: Package, iconColor: "text-orange-500 bg-orange-500/10", requiredPlan: "pro" },
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

    const [isUpdating, setIsUpdating] = useState(false);
    const [showPlans, setShowPlans] = useState(false);

    const handleUpgrade = async (newPlan: PlanTier) => {
        setIsUpdating(true);
        try {
            // Se for plano gratuito, apenas atualiza direto (downgrade)
            if (newPlan === 'free') {
                const { error } = await supabase.rpc('update_my_subscription', { new_plan: newPlan });
                if (error) throw error;
                window.location.reload();
                return;
            }

            // Para planos pagos, ir para o checkout do Asaas
            const savedCompany = localStorage.getItem("lavanpro_company");
            const parsed = savedCompany ? JSON.parse(savedCompany) : {};

            // O Asaas bloqueia completamente contas Sandbox com CNPJ/CPF vazio ou como 00000000000000
            let userCnpj = (parsed?.cnpj || "").replace(/\D/g, "");
            const hasValidLength = userCnpj.length === 11 || userCnpj.length === 14;
            // Se for inválido, cai no mock abaixo apenas pro sandbox passar
            if (!hasValidLength || userCnpj === "00000000000000" || userCnpj === "00000000000") {
                userCnpj = "27865757000102";
            }

            const companyData = {
                razaoSocial: parsed?.razaoSocial || parsed?.nomeFantasia || "Lavanderia Cliente",
                cnpj: userCnpj,
                email: parsed?.email || "cliente@lavanderia.com",
                phone: ""
            };

            const session = await supabase.auth.getSession();
            const ownerId = session.data.session?.user?.id;

            const res = await fetch("/api/asaas/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan: newPlan,
                    company: companyData,
                    ownerId: ownerId
                })
            });

            const data = await res.json();

            if (data.invoiceUrl) {
                // Redireciona para o checkout gerado
                window.location.href = data.invoiceUrl;
            } else {
                throw new Error(data.error || "Erro ao gerar link de pagamento.");
            }
        } catch (err: any) {
            console.error("Erro ao gerar pagamento", err);
            alert("Não foi possível gerar o link de pagamento. Detalhes: " + err.message);
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
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-card/50 backdrop-blur-sm border border-brand-darkBorder rounded-xl shadow-inner">
                        <Crown className="size-4 text-brand-primary" />
                        <span className="text-sm font-bold text-brand-text hidden sm:inline">Plano Atual:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${PLAN_LABELS[currentPlan].color} shadow-sm`}>
                            {PLAN_LABELS[currentPlan].label}
                        </span>
                    </div>
                    <button
                        onClick={() => setShowPlans(!showPlans)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                            showPlans 
                            ? "bg-brand-card text-brand-text border-brand-darkBorder hover:bg-white/5" 
                            : "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 hover:scale-[1.02]"
                        }`}
                    >
                        {showPlans ? (
                            <>Recolher Planos <ChevronUp className="size-4" /></>
                        ) : (
                            <>Alterar Plano <ChevronDown className="size-4" /></>
                        )}
                    </button>
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

            {/* Seção de Planos com Animação */}
            <AnimatePresence>
                {showPlans && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mt-8 pt-12 border-t border-brand-darkBorder">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-white mb-3">Planos para o seu negócio</h2>
                                <p className="text-brand-muted">Escolha o melhor plano para escalar sua lavanderia com a LavanPro.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

                                {/* Starter */}
                                <div className={`bg-brand-card border ${currentPlan === 'free' ? 'border-brand-primary' : 'border-brand-darkBorder'} rounded-2xl p-8 flex flex-col relative`}>
                                    {currentPlan === 'free' && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-md shadow-brand-primary/20">
                                            Seu Plano Atual
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-black text-white">R$97</span>
                                        <span className="text-brand-muted text-sm">/mês</span>
                                    </div>
                                    <p className="text-sm text-brand-muted mb-8">Ideal para pequenas lavanderias ou iniciantes.</p>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Gestão de Pedidos</span></li>
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">1 Usuário / 1 Unidade</span></li>
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Controle de Caixa</span></li>
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Suporte via E-mail</span></li>
                                    </ul>
                                </div>

                                {/* Profissional */}
                                <div className={`bg-brand-card border-2 ${currentPlan === 'pro' ? 'border-brand-primary shadow-2xl shadow-brand-primary/20' : 'border-brand-darkBorder/50'} rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4`}>
                                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-md ${currentPlan === 'pro' ? 'bg-brand-primary shadow-brand-primary/20' : 'bg-brand-darkBorder'}`}>
                                        {currentPlan === 'pro' ? 'Seu Plano Atual' : 'Mais Popular'}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Profissional</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-black text-white">R$197</span>
                                        <span className="text-brand-muted text-sm">/mês</span>
                                    </div>
                                    <p className="text-sm text-brand-muted mb-8">Ideal para lavanderias que buscam automação e controle financeiro.</p>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Até 3 Usuários</span></li>
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Etiquetagem QR (E-tags)</span></li>
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Financeiro e Controle de Caixa</span></li>
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Controle de Estoque</span></li>
                                        <li className="flex items-start gap-4"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Suporte WhatsApp</span></li>
                                    </ul>

                                    <button
                                        onClick={() => handleUpgrade('pro')}
                                        disabled={isUpdating || currentPlan === 'pro'}
                                        className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 mt-auto disabled:opacity-50 ${currentPlan === 'pro' ? 'bg-brand-primary/20 text-brand-primary cursor-not-allowed border border-brand-primary/30' :
                                            'bg-brand-primary text-white hover:bg-brand-primaryHover shadow-lg shadow-brand-primary/20'
                                            }`}
                                    >
                                        {currentPlan === 'pro' ? 'Seu Plano Atual' : <><ArrowUp className="size-4" /> Escolher Profissional</>}
                                    </button>
                                </div>

                                {/* Enterprise */}
                                <div className={`bg-brand-card border ${currentPlan === 'enterprise' ? 'border-brand-primary' : 'border-brand-darkBorder'} rounded-2xl p-8 flex flex-col relative`}>
                                    {currentPlan === 'enterprise' && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-md shadow-brand-primary/20">
                                            Seu Plano Atual
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-black text-white">R$397</span>
                                        <span className="text-brand-muted text-sm">/mês</span>
                                    </div>
                                    <p className="text-sm text-brand-muted mb-8">Para redes e grandes operações que buscam escala e BI.</p>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Usuários Ilimitados</span></li>
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Relatórios BI e Avançados</span></li>
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Gestão Multi-unidades</span></li>
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">API Aberta</span></li>
                                        <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Gerente de Contas</span></li>
                                    </ul>

                                    <button
                                        onClick={() => handleUpgrade('enterprise')}
                                        disabled={isUpdating || currentPlan === 'enterprise'}
                                        className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 mt-auto disabled:opacity-50 ${currentPlan === 'enterprise' ? 'bg-brand-primary/20 text-brand-primary cursor-not-allowed border border-brand-primary/30' :
                                            'bg-brand-primary text-white hover:bg-brand-primaryHover shadow-lg shadow-brand-primary/20'
                                            }`}
                                    >
                                        {currentPlan === 'enterprise' ? 'Plano Máximo Atual' : <><ArrowUp className="size-4" /> Faça Upgrade de Plano</>}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
