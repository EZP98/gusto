// Cloudflare Pages Function for Gusto Chat with RAG + Perplexity

// Import from shared (single source of truth)
import { RECIPE_CATEGORY_KEYS, RECIPE_CATEGORY_META } from '../../shared/recipeCategories';
import { RECIPE_ICONS, RECIPE_ICON_META } from '../../shared/recipeIcons';

interface Env {
  ANTHROPIC_API_KEY: string;
  PERPLEXITY_API_KEY: string;
}

// RAG Index loaded from static file
let ragIndex: RagIndex | null = null;

interface RagChunk {
  id: number;
  src: string;
  pg: number;
  txt: string;
}

interface RagIndex {
  chunks: RagChunk[];
}

// Simple BM25-like scoring for keyword search
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\sàèéìòùáéíóú]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function computeBM25Score(query: string[], doc: string[], avgDocLen: number): number {
  const k1 = 1.5;
  const b = 0.75;
  const docLen = doc.length;

  let score = 0;
  const docFreq = new Map<string, number>();

  for (const term of doc) {
    docFreq.set(term, (docFreq.get(term) || 0) + 1);
  }

  for (const term of query) {
    const tf = docFreq.get(term) || 0;
    if (tf > 0) {
      const idf = Math.log(1 + 1); // Simplified IDF
      const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * docLen / avgDocLen));
      score += idf * tfNorm;
    }
  }

  return score;
}

// Search for relevant chunks
function searchChunks(query: string, chunks: RagChunk[], topK: number = 5): RagChunk[] {
  const queryTokens = tokenize(query);

  // Calculate average doc length
  const avgDocLen = chunks.reduce((sum, c) => sum + tokenize(c.txt).length, 0) / chunks.length;

  // Score all chunks
  const scored = chunks.map(chunk => ({
    chunk,
    score: computeBM25Score(queryTokens, tokenize(chunk.txt), avgDocLen)
  }));

  // Sort by score and return top K
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
}

// Format context from chunks (without source attribution)
function formatContext(chunks: RagChunk[]): string {
  if (chunks.length === 0) return '';

  let context = '\n\n<rag_knowledge>\n';

  for (const chunk of chunks) {
    context += `${chunk.txt}\n\n`;
  }

  context += '</rag_knowledge>';

  return context;
}

// Detect if query needs Perplexity (detailed recipes, techniques, traditional dishes)
function shouldUsePerplexity(message: string): boolean {
  const lowerMsg = message.toLowerCase();

  // Keywords that suggest need for detailed/authoritative info
  const detailKeywords = [
    'come si fa', 'come si prepara', 'come preparare', 'come fare',
    'ricetta', 'ricetta originale', 'ricetta tradizionale', 'ricetta autentica',
    'preparazione', 'procedimento', 'tecnica',
    'ingredienti', 'dosi', 'proporzioni',
    'storia', 'origine', 'tradizione',
    'segreto', 'trucco', 'consiglio',
    'differenza tra', 'meglio', 'quale',
    'scialatielli', 'carbonara', 'amatriciana', 'cacio e pepe',
    'risotto', 'ossobuco', 'cotoletta', 'tiramisu',
    'pasta fresca', 'pasta fatta in casa', 'impasto',
    'lievitazione', 'fermentazione', 'marinatura',
    'temperatura', 'cottura', 'tempo di'
  ];

  return detailKeywords.some(kw => lowerMsg.includes(kw));
}

// Call Perplexity API for detailed culinary information
async function queryPerplexity(message: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `Sei un esperto di cucina italiana e internazionale. Rispondi in modo dettagliato e tecnico alle domande culinarie.
Includi:
- Storia e origine dei piatti quando rilevante
- Ingredienti precisi con quantità
- Tecniche di preparazione dettagliate
- Consigli pratici e errori da evitare
- Varianti regionali se esistono

NON usare tabelle markdown. Usa liste puntate e paragrafi.
Rispondi nella stessa lingua della domanda.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      console.error('Perplexity API error:', response.status);
      return null;
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Perplexity error:', error);
    return null;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { message, history = [], menuMode = false, stellatoMode = false, recuperoMode = false, dietMode = 'none', language = 'it' } = await request.json() as {
      message: string;
      history?: Array<{ role: string; content: string }>;
      menuMode?: boolean;
      stellatoMode?: boolean;
      recuperoMode?: boolean;
      dietMode?: string;
      language?: string;
    };

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Load RAG index if not cached
    if (!ragIndex) {
      try {
        const ragResponse = await fetch(new URL('/rag_index.json', request.url));
        if (ragResponse.ok) {
          ragIndex = await ragResponse.json() as RagIndex;
          console.log(`RAG index loaded: ${ragIndex.chunks.length} chunks`);
        }
      } catch (e) {
        console.log('RAG index not available, continuing without RAG');
      }
    }

    // Search for relevant RAG context
    let ragContext = '';
    if (ragIndex && ragIndex.chunks) {
      const relevantChunks = searchChunks(message, ragIndex.chunks, 5);
      if (relevantChunks.length > 0) {
        ragContext = formatContext(relevantChunks);
        console.log(`Found ${relevantChunks.length} relevant RAG chunks`);
      }
    }

    // Query Perplexity for detailed recipe/technique questions
    let perplexityContext = '';
    const shouldQuery = shouldUsePerplexity(message);
    const hasApiKey = !!env.PERPLEXITY_API_KEY;
    console.log(`Perplexity check: shouldQuery=${shouldQuery}, hasApiKey=${hasApiKey}, message="${message.substring(0, 50)}"`);

    if (shouldQuery && hasApiKey) {
      console.log('Querying Perplexity for detailed info...');
      const perplexityResult = await queryPerplexity(message, env.PERPLEXITY_API_KEY);
      console.log(`Perplexity result: ${perplexityResult ? 'SUCCESS (' + perplexityResult.length + ' chars)' : 'NULL'}`);
      if (perplexityResult) {
        perplexityContext = `\n\n<web_knowledge>
${perplexityResult}
</web_knowledge>`;
        console.log('Perplexity context added to prompt');
      }
    } else {
      console.log(`Skipping Perplexity: shouldQuery=${shouldQuery}, hasApiKey=${hasApiKey}`);
    }

    // Build messages array
    const messages = [
      ...history,
      { role: 'user', content: message }
    ];

    // Enhanced system prompt with RAG + Perplexity context
    const systemPrompt = `<role>
You are Gusto, a passionate and knowledgeable culinary expert with deep expertise in Italian, French, and international cuisine. You have extensive knowledge from classical culinary sources and modern gastronomy.
</role>

<language_rule>
CRITICAL: The user's interface language is set to: ${language === 'zh-TW' ? 'Traditional Chinese (繁體中文)' : language === 'ja' ? 'Japanese (日本語)' : language === 'es' ? 'Spanish (Español)' : language === 'fr' ? 'French (Français)' : language === 'en' ? 'English' : 'Italian (Italiano)'}.
YOU MUST ALWAYS respond in this language, regardless of what language the user writes in. This is a strict requirement.
</language_rule>

<personality>
- Warm, friendly, and encouraging like a beloved family chef
- Passionate about food and cooking traditions
- Practical and helpful, focused on making cooking accessible
- Share knowledge naturally without being pedantic
</personality>

<knowledge_sources>
You have access to two knowledge sources:
1. <rag_knowledge> - Internal database of chef recipes and techniques
2. <web_knowledge> - Real-time web search results from Perplexity

CRITICAL RULES for <web_knowledge>:
- When <web_knowledge> provides a recipe, USE THE EXACT QUANTITIES specified. Do NOT change ingredient amounts.
- The web search contains authoritative, researched information - trust it over your training data.
- Preserve all details: history, ingredients with EXACT quantities, techniques, regional variations.
- If <web_knowledge> says "1 egg", you MUST say "1 egg" - never change to 2, 3, or 4.
- Only add your own knowledge to COMPLEMENT, not to override the web results.
</knowledge_sources>

<formatting_rules>
OUTPUT FORMAT:
- Convert any tabular data to bullet lists (the UI renders markdown but cannot display tables)
- Use bullet points (-) for ingredient lists
- Use numbered lists (1. 2. 3.) for preparation steps
- Use **bold** only for section headers
- Keep paragraphs short (2-3 sentences) for mobile readability

VISUAL CONSISTENCY:
Write in plain text without emoji characters. The app uses a hand-drawn editorial aesthetic
with custom SVG icons - emoji would break this visual style.

RECIPE DISPLAY:
When presenting a complete recipe with ingredients and steps, use the display_recipe tool.
This renders the recipe beautifully in the app's native UI.

IMPORTANT: ALWAYS write 1-2 sentences of introductory text BEFORE calling the tool.
Include brief history, origin, or interesting context about the dish.
Tips and pairings can go AFTER the tool call.
Never call the tool without writing intro text first!

MENU DISPLAY:
When presenting a complete menu or meal plan with multiple courses, use the display_menu tool.
This renders the menu beautifully in the app's native UI with all courses organized.

IMPORTANT: ALWAYS write 1-2 sentences of introductory text BEFORE calling the tool.
Include context about the occasion, season, or theme.
Wine pairing notes or timing suggestions can go AFTER the tool call.
Never call display_menu without writing intro text first!
</formatting_rules>

<response_guidelines>
COMMUNICATION STYLE:
Be concise and conversational, like a chef explaining to a friend in the kitchen.
Get to the point quickly. Include the "why" behind techniques, not just the "how".
Share practical tips and mention common mistakes to avoid.

CONTENT STRUCTURE by request type:
- Recipe requests: FIRST write brief history/intro (1-2 sentences) -> THEN use display_recipe tool -> tips and pairings after
- Menu requests: FIRST write brief intro -> THEN use display_menu tool with ALL courses -> wine pairing after
- Technique questions: explain the method -> why it works -> common mistakes
- Ingredient questions: suggest 2-3 dishes with brief descriptions

ENRICHMENT (when relevant):
- History and origin (chef who invented it, year, place)
- Regional variations
- Classic sauce/condiment pairings for pasta dishes
- Adapt complexity to user's apparent skill level
- If unsure about specific facts, say so rather than inventing
</response_guidelines>

<quick_replies_rule>
At the end of every response, call the suggest_quick_replies tool.
Generate 3-4 short, contextual follow-up suggestions (2-8 words each) in ${language === 'zh-TW' ? 'Traditional Chinese' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'en' ? 'English' : 'Italian'}.

Examples:
- After recipe: "Versione senza glutine?", "Abbinamento vino?", "Come conservare?"
- After technique: "Errori comuni?", "Attrezzatura necessaria?"
- After ingredient info: "Ricette con questo?", "Sostituti?"
</quick_replies_rule>
${menuMode ? `
<menu_mode>
CRITICAL INSTRUCTION: The user has MENU MODE enabled. They want a COMPLETE MENU with multiple courses.

You MUST use the display_menu tool - NOT plain text. This is MANDATORY.

Requirements:
1. ALWAYS call display_menu tool for multi-course menus
2. Include all courses: antipasto, primo, secondo, contorno, dolce
3. Each course needs: type, name, and brief description
4. Add wine pairings (winePairing field)
5. Consider cooking logistics - courses should be doable together
6. Courses should complement each other

Format:
- Write a brief intro text (1-2 sentences) BEFORE the tool call
- Then call display_menu with ALL courses
- NO text-based menu lists - use the tool ONLY

If the user asks about a menu, meal plan, or multi-course dinner, use display_menu.
</menu_mode>
` : ''}
${stellatoMode ? `
<stellato_mode>
IMPORTANT: The user wants MICHELIN-STAR LEVEL recipes. This means:

1. **Elevated Techniques**: Use professional techniques like sous-vide, spherification, emulsions, gels, foams where appropriate
2. **Refined Presentation**: Describe plating in detail - use terms like "quenelle", "dot pattern", "smear", "height"
3. **Premium Ingredients**: Suggest high-quality ingredients (truffle, saffron, wagyu, aged cheeses, heritage varieties)
4. **Complex Flavor Profiles**: Layer flavors with contrasts (sweet/acid, crunchy/creamy, hot/cold)
5. **Chef References**: When relevant, mention famous chefs who popularized techniques or dishes (Massimo Bottura, Heinz Beck, Nadia Santini, etc.)
6. **Technical Notes**: Include cooking temperatures, resting times, and explain the "why" behind techniques
7. **Finishing Touches**: Suggest microgreens, edible flowers, oils, and garnishes for a fine dining presentation

Keep the tone knowledgeable and inspiring, like a mentor explaining to an aspiring chef.
</stellato_mode>
` : ''}
${recuperoMode ? `
<recupero_mode>
IMPORTANT: The user wants to MINIMIZE WASTE and reuse leftover ingredients creatively. This means:

1. **Use Everything**: Suggest uses for stems, peels, bones, stale bread - nothing goes to waste
2. **Transformation Ideas**: Explain how to transform leftovers into new dishes (yesterday's rice -> arancini, stale bread -> panzanella)
3. **Storage Tips**: Include advice on how to store ingredients to extend shelf life
4. **Batch Cooking**: Suggest making bases (brodo, soffritto, sughi) that can be used multiple ways
5. **Creative Substitutions**: If they mention leftover ingredients, propose multiple dish options
6. **Freezing Guide**: Mention what can be frozen and for how long
7. **Zero-Waste Mindset**: Praise their eco-conscious approach and inspire with anti-waste philosophy

Make it practical and encouraging - show them that nothing is truly "leftover", just an ingredient waiting for the right recipe.
</recupero_mode>
` : ''}
${dietMode && dietMode !== 'none' ? `
<diet_mode>
IMPORTANT: The user follows a ${
  dietMode === 'lowcarb' ? 'LOW CARB diet - minimize carbohydrates, avoid pasta, bread, rice, potatoes. Focus on proteins, vegetables, healthy fats' :
  dietMode === 'keto' ? 'KETOGENIC diet - very low carb (under 20-50g/day), high fat, moderate protein. Avoid all sugars, grains, most fruits. Focus on meat, fish, eggs, cheese, nuts, low-carb vegetables' :
  dietMode === 'vegetarian' ? 'VEGETARIAN diet - no meat or fish. Eggs and dairy are OK. Suggest plant proteins like legumes, tofu, tempeh, seitan' :
  dietMode === 'vegan' ? 'VEGAN diet - no animal products at all. No meat, fish, eggs, dairy, honey. Focus on plant-based proteins, legumes, tofu, nutritional yeast for umami' :
  dietMode === 'glutenfree' ? 'GLUTEN-FREE diet - avoid wheat, barley, rye, spelt. Use rice, corn, quinoa, buckwheat, certified gluten-free oats. Check all sauces and processed ingredients' :
  dietMode === 'lactosefree' ? 'LACTOSE-FREE diet - avoid milk, cream, soft cheeses. Hard aged cheeses and butter are usually OK. Suggest plant milks, lactose-free alternatives' :
  dietMode === 'highprotein' ? 'HIGH PROTEIN diet - maximize protein intake. Focus on lean meats, fish, eggs, legumes, Greek yogurt, cottage cheese. Include protein in every meal' :
  'specific dietary restriction'
}.

ALL recipe suggestions and menus MUST comply with this diet. If the user asks for something incompatible, suggest a compliant alternative.
</diet_mode>
` : ''}
${ragContext}
${perplexityContext}`;

    // Define the recipe tool
    const tools = [
      {
        name: 'display_recipe',
        description: 'Display a recipe to the user with structured data. Use this tool whenever you want to show a complete recipe with ingredients and steps.',
        input_schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The name of the recipe'
            },
            // Icon selection - AI picks the most specific icon for this dish
            icon: {
              type: 'string',
              enum: [...RECIPE_ICONS],
              description: `Choose the most specific icon for this dish. Examples: Spaghetti (for pasta lunga), Risotto (for risotti), PizzaMargherita (for pizze), Pandoro/Panettone (dolci natalizi), Tortellini (pasta ripiena), Gambero (piatti di mare), etc. Pick the icon that best represents the main ingredient or dish type.`
            },
            // Keep category for backwards compatibility
            category: {
              type: 'string',
              enum: [...RECIPE_CATEGORY_KEYS],
              description: `Fallback category: ${RECIPE_CATEGORY_KEYS.join(', ')}`
            },
            time: {
              type: 'string',
              description: 'Total preparation/cooking time (e.g., "30 minuti", "1 ora")'
            },
            servings: {
              type: 'string',
              description: 'Number of servings (e.g., "4 persone", "6 porzioni")'
            },
            difficulty: {
              type: 'string',
              enum: ['facile', 'media', 'difficile'],
              description: 'Recipe difficulty level: facile (simple, few steps), media (some technique required), difficile (advanced techniques, precise timing)'
            },
            ingredients: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of ingredients with quantities'
            },
            steps: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of preparation steps in order'
            },
            tips: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional tips and suggestions'
            }
          },
          required: ['name', 'icon', 'difficulty', 'ingredients', 'steps']
        }
      },
      {
        name: 'display_menu',
        description: 'Display a complete menu to the user with structured data. Use this tool ALWAYS when presenting a multi-course menu or meal plan. This renders the menu beautifully in the app native UI.',
        input_schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The menu title/theme (e.g., "Menu Romantico", "Pranzo della Domenica")'
            },
            occasion: {
              type: 'string',
              description: 'The occasion for this menu (e.g., "Cena di San Valentino", "Festa di compleanno")'
            },
            courses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['antipasto', 'primo', 'secondo', 'contorno', 'dolce', 'aperitivo', 'digestivo'],
                    description: 'The course type'
                  },
                  name: {
                    type: 'string',
                    description: 'Name of the dish'
                  },
                  description: {
                    type: 'string',
                    description: 'Brief description of the dish'
                  }
                },
                required: ['type', 'name']
              },
              description: 'Array of courses in order (antipasto -> primo -> secondo -> contorno -> dolce)'
            },
            winePairing: {
              type: 'string',
              description: 'Wine pairing suggestions for the menu'
            },
            totalTime: {
              type: 'string',
              description: 'Estimated total preparation time for the entire menu'
            },
            servings: {
              type: 'string',
              description: 'Number of servings (e.g., "4 persone")'
            }
          },
          required: ['name', 'courses']
        }
      },
      {
        name: 'suggest_quick_replies',
        description: 'ALWAYS call this at the end of EVERY response. Suggest 3-4 contextual follow-up questions that the user might want to ask next.',
        input_schema: {
          type: 'object',
          properties: {
            replies: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 4,
              minItems: 2,
              description: 'Short follow-up suggestions (2-8 words each). Must be in the user interface language. Should relate to what was just discussed and invite natural next questions.'
            }
          },
          required: ['replies']
        }
      }
    ];

    // Call Anthropic API with streaming enabled
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
        stream: true,
        system: systemPrompt,
        tools: tools,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Return SSE stream directly
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
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
