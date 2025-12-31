// Recipes API - List and Create

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface JWTPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

interface Recipe {
  id: string;
  user_id: string;
  name: string;
  time: string | null;
  servings: string | null;
  ingredients: string;
  steps: string;
  note: string | null;
  is_favorite: number;
  created_at: number;
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureValid = await crypto.subtle.verify(
      'HMAC',
      key,
      Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
      encoder.encode(`${headerB64}.${payloadB64}`)
    );

    if (!signatureValid) return null;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))) as JWTPayload;

    if (payload.exp && payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// GET /api/recipes - List all recipes for user
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, context.env.JWT_SECRET);
  if (!payload) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const results = await context.env.DB.prepare(
      'SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(payload.sub).all<Recipe>();

    const recipes = results.results.map(r => ({
      id: r.id,
      name: r.name,
      time: r.time,
      servings: r.servings,
      ingredients: JSON.parse(r.ingredients),
      steps: JSON.parse(r.steps),
      note: r.note,
      isFavorite: r.is_favorite === 1,
      createdAt: r.created_at,
    }));

    return Response.json({ recipes });
  } catch (e) {
    console.error('Error fetching recipes:', e);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
};

// POST /api/recipes - Create a new recipe
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, context.env.JWT_SECRET);
  if (!payload) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await context.request.json() as {
      name: string;
      time?: string;
      servings?: string;
      ingredients: string[];
      steps: string[];
      note?: string;
    };

    if (!body.name || !body.ingredients || !body.steps) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = generateId();
    const now = Date.now();

    await context.env.DB.prepare(`
      INSERT INTO recipes (id, user_id, name, time, servings, ingredients, steps, note, is_favorite, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).bind(
      id,
      payload.sub,
      body.name,
      body.time || null,
      body.servings || null,
      JSON.stringify(body.ingredients),
      JSON.stringify(body.steps),
      body.note || null,
      now
    ).run();

    const recipe = {
      id,
      name: body.name,
      time: body.time || null,
      servings: body.servings || null,
      ingredients: body.ingredients,
      steps: body.steps,
      note: body.note || null,
      isFavorite: false,
      createdAt: now,
    };

    return Response.json({ recipe }, { status: 201 });
  } catch (e) {
    console.error('Error creating recipe:', e);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
};
