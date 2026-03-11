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
                const { data: subData, error } = await supabase.rpc('get_my_subscription');

                if (error) {
                    console.error("Error fetching subscription:", error);
                    // Fallback gracefully
                    return;
                }

                if (subData && subData.length > 0 && isMounted) {
                    const sub = subData[0];
                    const currentPlan = sub.plan as PlanTier;
                    const currentStatus = sub.status;

                    setData({
                        plan: currentPlan,
                        status: currentStatus,
                        trialEnd: sub.trial_end ? new Date(sub.trial_end) : null,
                        isStarter: currentPlan === 'free',
                        isPro: currentPlan === 'pro' || currentPlan === 'enterprise', // Pro features include Enterprise
                        isEnterprise: currentPlan === 'enterprise',
                        isTrialing: currentStatus === 'trialing',
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

        return () => {
            isMounted = false;
        };
    }, [user, authLoading]);

    return {
        ...data,
        loading: loading || authLoading
    };
}
