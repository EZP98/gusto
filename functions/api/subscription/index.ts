// GET /api/subscription - Get current user's subscription with plan details

import { getUserFromRequest } from '../../lib/auth';
import { getUserSubscription, createFreeSubscription } from '../../lib/subscription';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
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
    let subscription = await getUserSubscription(env.DB, payload.sub);

    // If no subscription exists, create free tier
    if (!subscription) {
      await createFreeSubscription(env.DB, payload.sub);
      subscription = await getUserSubscription(env.DB, payload.sub);
    }

    return new Response(JSON.stringify({ subscription }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return new Response(JSON.stringify({ error: 'Errore nel recupero della sottoscrizione' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
