// Dynamic share page with OG meta tags for recipe sharing
// When WhatsApp/social crawlers fetch this URL, they get proper meta tags
// When users visit, they get redirected to the app

interface Env {
  DB: D1Database;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: string;
  steps: string;
  time?: string;
  servings?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const recipeId = context.params.id as string;
  const userAgent = context.request.headers.get('user-agent') || '';

  // Check if it's a crawler (WhatsApp, Facebook, Twitter, etc.)
  const isCrawler = /WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot|Pinterest|Slackbot|TelegramBot|Discordbot/i.test(userAgent);

  // Base URL
  const baseUrl = 'https://gusto-8cx.pages.dev';
  const shareUrl = `${baseUrl}/share/${recipeId}`;
  const appUrl = `${baseUrl}/#/recipes/${recipeId}`;

  // Try to fetch recipe from database
  let recipe: Recipe | null = null;
  try {
    const result = await context.env.DB.prepare(
      'SELECT id, name, ingredients, steps, time, servings FROM recipes WHERE id = ?'
    ).bind(recipeId).first<Recipe>();
    recipe = result;
  } catch (e) {
    console.error('Error fetching recipe:', e);
  }

  // Default values if recipe not found
  const title = recipe?.name || 'Ricetta su Gusto';
  const ingredients = recipe?.ingredients ? JSON.parse(recipe.ingredients) : [];
  const description = recipe
    ? `${recipe.time ? `${recipe.time} - ` : ''}${ingredients.slice(0, 4).join(', ')}${ingredients.length > 4 ? '...' : ''}`
    : 'Scopri questa ricetta su Gusto - Il tuo assistente culinario AI';

  // For crawlers: return HTML with meta tags
  // For users: redirect to app
  if (!isCrawler) {
    return Response.redirect(appUrl, 302);
  }

  // Generate OG image URL with recipe info (using a simple text-based approach)
  // In production, you could use a service like og-image.vercel.app or similar
  const ogImageUrl = `${baseUrl}/og-image.png`;

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${escapeHtml(title)} - Gusto</title>
  <meta name="title" content="${escapeHtml(title)} - Gusto">
  <meta name="description" content="${escapeHtml(description)}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Gusto">
  <meta property="og:locale" content="it_IT">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <!-- Redirect for users who somehow see this page -->
  <meta http-equiv="refresh" content="0;url=${appUrl}">

  <style>
    body {
      font-family: 'Caveat', cursive;
      background: #FAF7F2;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      text-align: center;
      max-width: 400px;
    }
    h1 { color: #2D2A26; margin: 0 0 16px; }
    p { color: #8B857C; margin: 0 0 24px; }
    a {
      display: inline-block;
      background: #2D2A26;
      color: #FAF7F2;
      padding: 12px 32px;
      border-radius: 8px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
    <a href="${appUrl}">Apri in Gusto</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
