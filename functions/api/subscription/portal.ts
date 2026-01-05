// POST /api/subscription/portal - Create Stripe Customer Portal session

import { getUserFromRequest } from '../../lib/auth';
import { getUserSubscription } from '../../lib/subscription';
import { createPortalSession } from '../../lib/stripe';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
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

    // Get user's subscription
    const subscription = await getUserSubscription(env.DB, payload.sub);

    if (!subscription?.stripe_customer_id) {
      return new Response(JSON.stringify({
        error: 'Non hai una sottoscrizione attiva da gestire',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get return URL from request origin
    const origin = request.headers.get('origin') || 'https://gusto.pages.dev';
    const returnUrl = `${origin}/settings`;

    // Create Stripe Portal session
    const result = await createPortalSession(
      { secretKey: env.STRIPE_SECRET_KEY },
      {
        customerId: subscription.stripe_customer_id,
        returnUrl,
      }
    );

    if ('error' in result) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ url: result.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Portal error:', error);
    return new Response(JSON.stringify({ error: 'Errore nella creazione del portale' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
