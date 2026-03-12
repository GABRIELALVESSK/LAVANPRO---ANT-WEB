"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { Lock, Crown, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface PlanGuardProps {
    children: React.ReactNode;
    moduleName: string;
    requiredPlan?: 'pro' | 'enterprise';
}

export function PlanGuard({ children, moduleName, requiredPlan = 'pro' }: PlanGuardProps) {
    const { isStarter, plan, loading } = useSubscription();
    const [isUpdating, setIsUpdating] = useState(false);

    // Se estiver carregando, mostra apenas o fundo para evitar flicker
    if (loading) {
        return (
            <div className="flex-1 min-h-screen bg-brand-bg flex items-center justify-center">
                <div className="size-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    // Verifica se está bloqueado
    const isLocked = (requiredPlan === 'pro' && isStarter) || (requiredPlan === 'enterprise' && plan !== 'enterprise');

    if (!isLocked) {
        return <>{children}</>;
    }

    const handleUpgrade = async (newPlan: 'free' | 'pro' | 'enterprise') => {
        setIsUpdating(true);
        try {
            const { error } = await supabase.rpc('update_my_subscription', { new_plan: newPlan });
            if (error) throw error;
            window.location.reload();
        } catch (err) {
            console.error("Erro ao atualizar plano", err);
            alert("Não foi possível atualizar o plano no momento. Tente novamente.");
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex-1 min-h-[calc(100vh-80px)] md:min-h-screen bg-brand-bg relative flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-brand-card border border-brand-darkBorder rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">

                {/* Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-brand-primary/10 blur-[100px] pointer-events-none" />

                {/* Ícone */}
                <div className="mx-auto size-24 bg-brand-bg rounded-full flex items-center justify-center border border-brand-darkBorder mb-8 relative z-10 shadow-inner">
                    <div className="size-16 bg-amber-500/10 rounded-full flex items-center justify-center">
                        <Lock className="size-8 text-amber-500" />
                    </div>
                </div>

                {/* Textos */}
                <h2 className="text-3xl md:text-4xl font-black text-brand-text mb-4 tracking-tight relative z-10">
                    Módulo Fechado
                </h2>

                <p className="text-brand-muted text-lg mb-10 max-w-lg mx-auto leading-relaxed relative z-10">
                    O módulo <strong className="text-brand-text">"{moduleName}"</strong> é exclusivo para assinantes {requiredPlan === 'pro' ? 'Profissionais' : 'Enterprise'}. Faça o upgrade agora e revolucione a gestão da sua lavanderia.
                </p>

                {/* Card de Foco Upsell - Profissional (já que Starter é bloqueado a Pro, e Pro a Enterprise) */}
                {requiredPlan === 'pro' && (
                    <div className="bg-brand-bg/50 border-2 border-brand-primary/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10 text-left">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider mb-4 border border-brand-primary/20">
                                <Crown className="size-3.5" /> Profissional
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-3"><Check className="size-4 text-emerald-500" /><span className="text-sm font-medium text-brand-text">Acesso a Etiquetas QR (E-tags)</span></li>
                                <li className="flex items-center gap-3"><Check className="size-4 text-emerald-500" /><span className="text-sm font-medium text-brand-text">Gestão Financeira e Fluxo de Caixa</span></li>
                                <li className="flex items-center gap-3"><Check className="size-4 text-emerald-500" /><span className="text-sm font-medium text-brand-text">Módulo de Estoque e Insumos</span></li>
                                <li className="flex items-center gap-3"><Check className="size-4 text-emerald-500" /><span className="text-sm font-medium text-brand-text">Até 3 Usuários e Equipe</span></li>
                            </ul>
                        </div>
                        <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
                            <div className="mb-4 text-center">
                                <div className="text-3xl font-black text-brand-text text-center w-full">R$197<span className="text-sm text-brand-muted font-normal">/mês</span></div>
                            </div>
                            <button
                                onClick={() => handleUpgrade('pro')}
                                disabled={isUpdating}
                                className="w-full whitespace-nowrap px-8 py-4 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 transition-all disabled:opacity-50"
                            >
                                {isUpdating ? 'Aguarde...' : 'Desbloquear Agora'}
                            </button>
                            <p className="mt-4 text-[11px] text-brand-muted font-medium text-center">Cobrança Mensal. Cancele a qualquer momento.</p>
                        </div>
                    </div>
                )}

                {/* Card de Foco Upsell - Enterprise */}
                {requiredPlan === 'enterprise' && (
                    <div className="bg-brand-bg/50 border border-brand-darkBorder rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10 text-left">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border border-brand-darkBorder">
                                <Crown className="size-3.5" /> Enterprise
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-3"><Check className="size-4 text-emerald-500" /><span className="text-sm font-medium text-brand-text">Usuários Ilimitados</span></li>
                                <li className="flex items-center gap-3"><Check className="size-4 text-emerald-500" /><span className="text-sm font-medium text-brand-text">Relatórios BI e Insights Avançados</span></li>
                                <li className="flex items-center gap-3"><Check className="size-4 text-emerald-500" /><span className="text-sm font-medium text-brand-text">Múltiplas lojas e API</span></li>
                                <li className="flex items-center gap-3"><Check className="size-4 text-emerald-500" /><span className="text-sm font-medium text-brand-text">Suporte prioritário 24/7</span></li>
                            </ul>
                        </div>
                        <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
                            <div className="mb-4 text-center">
                                <div className="text-3xl font-black text-brand-text text-center w-full">R$397<span className="text-sm text-brand-muted font-normal">/mês</span></div>
                            </div>
                            <button
                                onClick={() => handleUpgrade('enterprise')}
                                disabled={isUpdating}
                                className="w-full whitespace-nowrap px-8 py-4 bg-brand-card border border-brand-darkBorder hover:bg-brand-bg text-brand-text rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
                            >
                                {isUpdating ? 'Aguarde...' : 'Quero Enterprise'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
