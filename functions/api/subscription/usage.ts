// GET /api/subscription/usage - Get user's current usage stats

import { getUserFromRequest } from '../../lib/auth';
import { getUserUsageStats } from '../../lib/usage';

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

    const usage = await getUserUsageStats(env.DB, payload.sub);

    return new Response(JSON.stringify({ usage }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return new Response(JSON.stringify({ error: 'Errore nel recupero dei dati di utilizzo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
