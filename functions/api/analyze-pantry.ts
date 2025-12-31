// Cloudflare Pages Function for Pantry Image Analysis with Claude Vision
// Supports multiple images (up to 3)

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
    const body = await request.json() as { image?: string; images?: string[] };

    // Support both single image and multiple images
    const images = body.images || (body.image ? [body.image] : []);

    if (images.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one image is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (images.length > 3) {
      return new Response(JSON.stringify({ error: 'Maximum 3 images allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Build content array with all images
    const contentArray: Array<{
      type: 'image' | 'text';
      source?: {
        type: 'base64';
        media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
        data: string;
      };
      text?: string;
    }> = [];

    for (const image of images) {
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return new Response(JSON.stringify({ error: 'Invalid image format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const mediaType = matches[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
      const imageData = matches[2];

      contentArray.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: imageData,
        },
      });
    }

    // Add the text prompt
    contentArray.push({
      type: 'text',
      text: `Analizza ${images.length > 1 ? 'queste foto' : 'questa foto'} di dispensa/frigorifero/scaffale cucina.
Identifica TUTTI gli ingredienti alimentari visibili ${images.length > 1 ? 'nelle foto' : 'nella foto'}.

Rispondi SOLO con un JSON valido nel formato:
{
  "ingredients": [
    {"name": "Nome Ingrediente", "qty": "quantità stimata"},
    ...
  ]
}

Regole:
- Usa nomi in italiano
- Stima la quantità (es: "3", "200g", "1 bottiglia", "1 confezione")
- Includi SOLO cibi/ingredienti, non utensili o contenitori vuoti
- Sii specifico (es: "Parmigiano Reggiano" invece di "formaggio")
- Se non riesci a identificare un ingrediente, omettilo
- Unisci gli ingredienti da tutte le foto, evitando duplicati`
    });

    // Call Claude Vision API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: contentArray,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude Vision API error:', error);
      return new Response(JSON.stringify({ error: 'Vision API error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const result = await response.json() as {
      content: Array<{ type: string; text?: string }>;
    };

    // Extract text from response
    const textContent = result.content.find(c => c.type === 'text');
    if (!textContent?.text) {
      return new Response(JSON.stringify({ error: 'No response from AI' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parse JSON from response
    try {
      // Extract JSON from markdown code block if present
      let jsonText = textContent.text;
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }

      const ingredients = JSON.parse(jsonText);
      return new Response(JSON.stringify(ingredients), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError, textContent.text);
      return new Response(JSON.stringify({
        error: 'Could not parse ingredients',
        raw: textContent.text
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

  } catch (error) {
    console.error('Analyze pantry error:', error);
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
