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
                    console.error("Error fetching subscription:", error);
                    
                    // Fallback: try to find subscription via staff owner_id
                    const { data: staffData } = await supabase
                        .from('staff')
                        .select('owner_id')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (staffData?.owner_id) {
                        // Try fetching the owner's subscription directly
                        const { data: ownerSub } = await supabase
                            .from('subscriptions')
                            .select('plan, status, trial_end')
                            .eq('user_id', staffData.owner_id)
                            .maybeSingle();
                        
                        if (ownerSub && isMounted) {
                            const currentPlan = ownerSub.plan as PlanTier;
                            const trialEnd = ownerSub.trial_end ? new Date(ownerSub.trial_end) : null;
                            const isTrialExpired = currentPlan === 'free' && trialEnd !== null && new Date() > trialEnd;

                            setData({
                                plan: currentPlan,
                                status: ownerSub.status,
                                trialEnd: trialEnd,
                                isStarter: currentPlan === 'free',
                                isPro: currentPlan === 'pro' || currentPlan === 'enterprise',
                                isEnterprise: currentPlan === 'enterprise',
                                isTrialing: ownerSub.status === 'trialing',
                                isTrialExpired: isTrialExpired,
                                trialDaysRemaining: trialEnd 
                                    ? Math.max(0, Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                                    : 7,
                            });
                        }
                    }
                    return;
                }

                if (subData && subData.length > 0 && isMounted) {
                    const sub = subData[0];
                    const currentPlan = sub.plan as PlanTier;
                    const currentStatus = sub.status;
                    const trialEnd = sub.trial_end ? new Date(sub.trial_end) : null;
                    const isTrialExpired = currentPlan === 'free' && trialEnd !== null && new Date() > trialEnd;

                    setData({
                        plan: currentPlan,
                        status: currentStatus,
                        trialEnd: trialEnd,
                        isStarter: currentPlan === 'free',
                        isPro: currentPlan === 'pro' || currentPlan === 'enterprise',
                        isEnterprise: currentPlan === 'enterprise',
                        isTrialing: currentStatus === 'trialing',
                        isTrialExpired: isTrialExpired,
                        trialDaysRemaining: trialEnd 
                            ? Math.max(0, Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                            : 7,
                    });
                }
            } catch (err) {
                console.error("Failed to load subscription data", err);
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
