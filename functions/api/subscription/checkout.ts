// POST /api/subscription/checkout - Create Stripe Checkout session

import { getUserFromRequest } from '../../lib/auth';
import { getUserSubscription } from '../../lib/subscription';
import { createCheckoutSession } from '../../lib/stripe';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PRO_PRICE_ID: string;
  STRIPE_PREMIUM_PRICE_ID: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    // Verify JWT
    const payload = await getUserFromRequest(request, env.JWT_SECRET);

    if (!payload) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parse request body
    const body = await request.json() as { planId: string };
    const { planId } = body;

    if (!planId || (planId !== 'pro' && planId !== 'premium')) {
      return new Response(JSON.stringify({ error: 'Piano non valido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get Stripe price ID for the plan
    const priceId = planId === 'pro' ? env.STRIPE_PRO_PRICE_ID : env.STRIPE_PREMIUM_PRICE_ID;

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Configurazione Stripe mancante' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get user's existing subscription (for customer ID if exists)
    const subscription = await getUserSubscription(env.DB, payload.sub);

    // Get success/cancel URLs from request origin
    const origin = request.headers.get('origin') || 'https://gusto.pages.dev';
    const successUrl = `${origin}/settings?checkout=success`;
    const cancelUrl = `${origin}/settings?checkout=canceled`;

    // Create Stripe Checkout session
    const result = await createCheckoutSession(
      { secretKey: env.STRIPE_SECRET_KEY },
      {
        priceId,
        customerId: subscription?.stripe_customer_id || undefined,
        customerEmail: subscription?.stripe_customer_id ? undefined : payload.email,
        userId: payload.sub,
        successUrl,
        cancelUrl,
      }
    );

    if ('error' in result) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      sessionId: result.sessionId,
      url: result.url,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: 'Errore nella creazione del checkout' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
