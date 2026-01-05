// useSubscription - Subscription management hook for Gusto
import { useState, useEffect, useCallback } from 'react';
import { authFetch } from './useAuth';

export interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  messages_per_day: number;
  max_saved_recipes: number;
  features: string[];
  stripe_price_id: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: number | null;
  current_period_end: number | null;
}

export interface UsageResult {
  count: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
}

export interface Usage {
  messages: UsageResult;
  recipes: UsageResult;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  plans: Plan[];
  usage: Usage | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  refreshUsage: () => Promise<void>;
  startCheckout: (planId: string) => Promise<void>;
  openPortal: () => Promise<void>;
  isPro: boolean;
  isPremium: boolean;
  canSendMessage: boolean;
  messagesRemaining: number;
}

export function useSubscription(isAuthenticated: boolean): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch plans (public, no auth needed)
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans || []);
        }
      } catch (e) {
        console.error('Error fetching plans:', e);
      }
    };
    fetchPlans();
  }, []);

  // Fetch subscription when authenticated
  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await authFetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (e) {
      console.error('Error fetching subscription:', e);
      setError('Errore nel caricamento della sottoscrizione');
    }
  }, [isAuthenticated]);

  // Fetch usage when authenticated
  const refreshUsage = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await authFetch('/api/subscription/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
      }
    } catch (e) {
      console.error('Error fetching usage:', e);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    if (!isAuthenticated) {
      setSubscription(null);
      setUsage(null);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([refreshSubscription(), refreshUsage()]);
      setIsLoading(false);
    };
    loadData();
  }, [isAuthenticated, refreshSubscription, refreshUsage]);

  // Start Stripe checkout
  const startCheckout = useCallback(async (planId: string) => {
    setError(null);

    try {
      const response = await authFetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore nel checkout');
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('Checkout error:', e);
      setError('Errore nel checkout');
    }
  }, []);

  // Open Stripe customer portal
  const openPortal = useCallback(async () => {
    setError(null);

    try {
      const response = await authFetch('/api/subscription/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore nell\'apertura del portale');
        return;
      }

      // Redirect to Stripe Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('Portal error:', e);
      setError('Errore nell\'apertura del portale');
    }
  }, []);

  // Computed values
  const isPro = subscription?.plan_id === 'pro';
  const isPremium = subscription?.plan_id === 'premium';

  const messagesRemaining = usage?.messages.remaining ?? 3;
  const canSendMessage = !usage?.messages.isLimitReached;

  return {
    subscription,
    plans,
    usage,
    isLoading,
    error,
    refreshSubscription,
    refreshUsage,
    startCheckout,
    openPortal,
    isPro,
    isPremium,
    canSendMessage,
    messagesRemaining,
  };
}
