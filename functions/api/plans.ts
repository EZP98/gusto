// GET /api/plans - Get all available subscription plans

import { getPlans } from '../lib/subscription';

interface Env {
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const plans = await getPlans(env.DB);

    return new Response(JSON.stringify({ plans }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return new Response(JSON.stringify({ error: 'Errore nel recupero dei piani' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
