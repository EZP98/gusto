// GET/DELETE /api/conversations/:id - Get or delete a conversation with messages

import { getUserFromRequest } from '../../lib/auth';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface ConversationRow {
  id: string;
  user_id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

interface MessageRow {
  id: string;
  role: string;
  content: string;
  timestamp: number;
  parsed_recipe: string | null;
  quick_replies: string | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET - Get conversation with all messages
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const conversationId = params.id as string;

  try {
    const payload = await getUserFromRequest(request, env.JWT_SECRET);
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get conversation
    const conversation = await env.DB.prepare(
      'SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE id = ?'
    ).bind(conversationId).first<ConversationRow>();

    if (!conversation) {
      return new Response(JSON.stringify({ error: 'Conversazione non trovata' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check ownership
    if (conversation.user_id !== payload.sub) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get messages
    const messages = await env.DB.prepare(
      'SELECT id, role, content, timestamp, parsed_recipe, quick_replies FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC'
    ).bind(conversationId).all<MessageRow>();

    return new Response(JSON.stringify({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        messages: messages.results.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          parsedRecipe: m.parsed_recipe ? JSON.parse(m.parsed_recipe) : undefined,
          quickReplies: m.quick_replies ? JSON.parse(m.quick_replies) : undefined,
        })),
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    return new Response(JSON.stringify({ error: 'Errore nel recupero della conversazione' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

// DELETE - Delete conversation and all messages
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const conversationId = params.id as string;

  try {
    const payload = await getUserFromRequest(request, env.JWT_SECRET);
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check ownership
    const conversation = await env.DB.prepare(
      'SELECT user_id FROM conversations WHERE id = ?'
    ).bind(conversationId).first<{ user_id: string }>();

    if (!conversation) {
      return new Response(JSON.stringify({ error: 'Conversazione non trovata' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (conversation.user_id !== payload.sub) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Delete messages first (foreign key constraint)
    await env.DB.prepare('DELETE FROM messages WHERE conversation_id = ?').bind(conversationId).run();

    // Delete conversation
    await env.DB.prepare('DELETE FROM conversations WHERE id = ?').bind(conversationId).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    return new Response(JSON.stringify({ error: 'Errore nella cancellazione della conversazione' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

// PATCH - Update conversation (title)
export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const conversationId = params.id as string;

  try {
    const payload = await getUserFromRequest(request, env.JWT_SECRET);
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check ownership
    const conversation = await env.DB.prepare(
      'SELECT user_id FROM conversations WHERE id = ?'
    ).bind(conversationId).first<{ user_id: string }>();

    if (!conversation) {
      return new Response(JSON.stringify({ error: 'Conversazione non trovata' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (conversation.user_id !== payload.sub) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await request.json() as { title?: string };

    if (body.title) {
      await env.DB.prepare(
        'UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?'
      ).bind(body.title, Date.now(), conversationId).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Update conversation error:', error);
    return new Response(JSON.stringify({ error: 'Errore nell\'aggiornamento della conversazione' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
