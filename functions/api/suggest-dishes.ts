// Cloudflare Pages Function for Dish Suggestions based on ingredients
// Returns only dish names and brief descriptions (no full recipes)

interface Env {
  ANTHROPIC_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json() as {
      ingredients: string[];
      language?: string;
      count?: number;
    };

    if (!body.ingredients || body.ingredients.length === 0) {
      return new Response(JSON.stringify({ error: 'Ingredients are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const language = body.language || 'it';
    const count = body.count || 10;
    const ingredientsList = body.ingredients.join(', ');

    // Language-specific prompts
    const prompts: Record<string, string> = {
      it: `Sei uno chef italiano esperto. Ho questi ingredienti: ${ingredientsList}

Suggerisci ${count} piatti che posso preparare con questi ingredienti (possono essere piatti che usano solo alcuni degli ingredienti disponibili).

Rispondi SOLO con un JSON valido:
{
  "dishes": [
    {
      "name": "Nome Piatto",
      "description": "Breve descrizione (max 15 parole)",
      "difficulty": "facile|media|difficile",
      "time": "tempo di preparazione (es: 20 min, 1 ora)",
      "mainIngredients": ["ingrediente1", "ingrediente2"]
    }
  ]
}

Includi piatti vari: primi, secondi, contorni, antipasti. Sii creativo ma realistico.`,
      en: `You are an expert chef. I have these ingredients: ${ingredientsList}

Suggest ${count} dishes I can prepare with these ingredients.

Respond ONLY with valid JSON:
{
  "dishes": [
    {
      "name": "Dish Name",
      "description": "Brief description (max 15 words)",
      "difficulty": "easy|medium|hard",
      "time": "prep time (e.g., 20 min, 1 hour)",
      "mainIngredients": ["ingredient1", "ingredient2"]
    }
  ]
}`,
    };

    const prompt = prompts[language] || prompts.it;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return new Response(JSON.stringify({ error: 'AI API error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const result = await response.json() as {
      content: Array<{ type: string; text?: string }>;
    };

    const textContent = result.content.find(c => c.type === 'text');
    if (!textContent?.text) {
      return new Response(JSON.stringify({ error: 'No response from AI' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parse JSON from response
    try {
      let jsonText = textContent.text;
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }

      const dishes = JSON.parse(jsonText);
      return new Response(JSON.stringify(dishes), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError, textContent.text);
      return new Response(JSON.stringify({
        error: 'Could not parse dishes',
        raw: textContent.text
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

  } catch (error) {
    console.error('Suggest dishes error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
