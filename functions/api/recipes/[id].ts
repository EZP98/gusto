// Recipes API - Single recipe operations

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

// GET /api/recipes/:id - Get single recipe
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

  const recipeId = context.params.id as string;

  try {
    const recipe = await context.env.DB.prepare(
      'SELECT * FROM recipes WHERE id = ? AND user_id = ?'
    ).bind(recipeId, payload.sub).first<Recipe>();

    if (!recipe) {
      return Response.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return Response.json({
      recipe: {
        id: recipe.id,
        name: recipe.name,
        time: recipe.time,
        servings: recipe.servings,
        ingredients: JSON.parse(recipe.ingredients),
        steps: JSON.parse(recipe.steps),
        note: recipe.note,
        isFavorite: recipe.is_favorite === 1,
        createdAt: recipe.created_at,
      }
    });
  } catch (e) {
    console.error('Error fetching recipe:', e);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
};

// DELETE /api/recipes/:id - Delete recipe
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, context.env.JWT_SECRET);
  if (!payload) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const recipeId = context.params.id as string;

  try {
    const result = await context.env.DB.prepare(
      'DELETE FROM recipes WHERE id = ? AND user_id = ?'
    ).bind(recipeId, payload.sub).run();

    if (result.meta.changes === 0) {
      return Response.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error('Error deleting recipe:', e);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
};

// PATCH /api/recipes/:id - Update recipe (toggle favorite, update note)
export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, context.env.JWT_SECRET);
  if (!payload) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const recipeId = context.params.id as string;

  try {
    const body = await context.request.json() as {
      isFavorite?: boolean;
      note?: string;
    };

    // Build dynamic update query
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (body.isFavorite !== undefined) {
      updates.push('is_favorite = ?');
      values.push(body.isFavorite ? 1 : 0);
    }

    if (body.note !== undefined) {
      updates.push('note = ?');
      values.push(body.note);
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(recipeId, payload.sub);

    const result = await context.env.DB.prepare(
      `UPDATE recipes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
    ).bind(...values).run();

    if (result.meta.changes === 0) {
      return Response.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error('Error updating recipe:', e);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
};
