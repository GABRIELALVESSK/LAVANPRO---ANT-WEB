"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight, Lock } from "lucide-react";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
    const { isTrialExpired, loading } = useSubscription();
    const pathname = usePathname();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Don't block loading state or login page
    if (!isMounted || loading || pathname === '/login') {
        return <>{children}</>;
    }

    const isSettingsPage = pathname.startsWith('/settings');

    // If trial is expired and they are NOT on the settings page, redirect them or show blocking overlay
    if (isTrialExpired && !isSettingsPage) {
        return (
            <div className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-brand-card border border-brand-darkBorder rounded-3xl p-8 text-center shadow-2xl"
                >
                    <div className="size-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <Lock className="size-10" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-white mb-4">
                        Seu período de teste expirou
                    </h2>
                    
                    <p className="text-brand-muted mb-8 leading-relaxed">
                        Esperamos que você tenha aproveitado os 7 dias grátis na LavanPro! 
                        Para continuar usando o sistema e não perder o acesso aos seus dados, 
                        por favor, escolha um plano.
                    </p>

                    <button
                        onClick={() => router.push('/settings?tab=status')}
                        className="w-full bg-brand-primary text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 hover:scale-[1.02]"
                    >
                        Ver Planos Disponíveis <ArrowRight className="size-5" />
                    </button>
                    
                    <p className="mt-6 text-xs text-brand-muted/70">
                        Se você tiver alguma dúvida, entre em contato com nosso suporte.
                    </p>
                </motion.div>
            </div>
        );
    }

    // If they are on the settings page with an expired trial, let them render the settings 
    // but maybe show a persistent banner at the top. The actual block happens globally above.

    return (
        <>
            <AnimatePresence>
                {isTrialExpired && isSettingsPage && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-500/10 border-b border-red-500/20 px-4 py-3"
                    >
                        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-red-500 font-medium text-sm">
                            <AlertTriangle className="size-4" />
                            Seu período de teste expirou. Atualize seu plano abaixo para restaurar o acesso total.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    );
}
