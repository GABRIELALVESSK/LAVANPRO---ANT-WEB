import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface SubscriptionData {
    plan: PlanTier;
    status: string;
    trialEnd: Date | null;
    loading: boolean;
    isStarter: boolean;
    isPro: boolean;
    isEnterprise: boolean;
    isTrialing: boolean;
    isTrialExpired: boolean;
    trialDaysRemaining: number;
}

export function useSubscription(): SubscriptionData {
    const { user, loading: authLoading } = useAuth();

    // Start with default/optimistic state (Starter) to avoid blocking UI immediately,
    // but let loading be true until confirmed.
    const [data, setData] = useState<Omit<SubscriptionData, 'loading'>>({
        plan: 'free',
        status: 'trialing',
        trialEnd: null,
        isStarter: true,
        isPro: false,
        isEnterprise: false,
        isTrialing: false,
        isTrialExpired: false,
        trialDaysRemaining: 7,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If auth is still loading or no user, keep loading true or exit
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const fetchSubscription = async () => {
            try {
                // The RPC get_my_subscription now automatically handles
                // collaborators by looking up the owner's subscription
                const { data: subData, error } = await supabase.rpc('get_my_subscription');

                if (error) {
                    console.warn("[Subscription] Usando metadados locais (RPC falhou).", error.message);
                    
                    // Fallback: usar o que está nos metadados do Auth do próprio usuário
                    if (isMounted) {
                        const meta = user.user_metadata || {};
                        const currentPlan = (meta.plan as PlanTier) || 'pro';
                        const currentStatus = meta.subscription_status || 'active';
                        const trialEndRaw = meta.subscription_trial_end;
                        const trialEnd = trialEndRaw ? new Date(trialEndRaw) : null;
                        
                        const isTrialing = currentStatus === 'trialing';
                        
                        // Calculate days using calendar dates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        let daysRemaining = 7;
                        let isTrialExpired = false;

                        if (trialEnd) {
                            const endForExpired = new Date(trialEnd); // exact time for expiration check
                            
                            const endDay = new Date(trialEnd);
                            endDay.setHours(0, 0, 0, 0);
                            
                            daysRemaining = Math.max(0, Math.round((endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                            
                            // It's expired if we are past the exact end timestamp AND it's a free/starter account
                            isTrialExpired = (currentPlan === 'free' || !currentPlan) && new Date() > endForExpired;
                        }

                        const hasActiveTrial = isTrialing && !isTrialExpired;

                        if (isMounted) {
                            setData({
                                plan: currentPlan,
                                status: currentStatus,
                                trialEnd: trialEnd,
                                isStarter: (currentPlan === 'free' || !currentPlan) && !hasActiveTrial,
                                isPro: currentPlan === 'pro' || currentPlan === 'enterprise' || hasActiveTrial,
                                isEnterprise: currentPlan === 'enterprise',
                                isTrialing: isTrialing,
                                isTrialExpired: isTrialExpired,
                                trialDaysRemaining: daysRemaining,
                            });
                        }
                    }
                    return;
                }

                if (subData && subData.length > 0 && isMounted) {
                    const sub = subData[0];
                    const currentPlan = sub.plan as PlanTier || 'pro';
                    const currentStatus = sub.status || 'active';
                    const trialEndRaw = sub.trial_end;
                    const trialEnd = trialEndRaw ? new Date(trialEndRaw) : null;
                    
                    const isTrialing = currentStatus === 'trialing';

                    // Calculate days using calendar dates
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    let daysRemaining = 7;
                    let isTrialExpired = false;

                    if (trialEnd) {
                        const endForExpired = new Date(trialEnd);
                        const endDay = new Date(trialEnd);
                        endDay.setHours(0, 0, 0, 0);
                        
                        daysRemaining = Math.max(0, Math.round((endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                        isTrialExpired = (currentPlan === 'free' || !currentPlan) && new Date() > endForExpired;
                    }

                    const hasActiveTrial = isTrialing && !isTrialExpired;

                    setData({
                        plan: currentPlan,
                        status: currentStatus,
                        trialEnd: trialEnd,
                        isStarter: (currentPlan === 'free' || !currentPlan) && !hasActiveTrial,
                        isPro: currentPlan === 'pro' || currentPlan === 'enterprise' || hasActiveTrial,
                        isEnterprise: currentPlan === 'enterprise',
                        isTrialing: isTrialing,
                        isTrialExpired: isTrialExpired,
                        trialDaysRemaining: daysRemaining,
                    });
                } else if (isMounted) {
                    // Sem dados retornados e sem erro
                    const currentPlan = 'pro'; 
                    setData({
                        plan: currentPlan,
                        status: 'active',
                        trialEnd: null,
                        isStarter: false,
                        isPro: true,
                        isEnterprise: false,
                        isTrialing: false,
                        isTrialExpired: false,
                        trialDaysRemaining: 0,
                    });
                }
            } catch (err) {
                console.warn("Falha geral ao carregar assinatura:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchSubscription();

        // Listen for refresh events
        const handleRefresh = () => fetchSubscription();
        window.addEventListener('refresh-subscription', handleRefresh);

        return () => {
            isMounted = false;
            window.removeEventListener('refresh-subscription', handleRefresh);
        };
    }, [user, authLoading]);

    return {
        ...data,
        loading: loading || authLoading
    };
}
