// Recipe Parser - Extracts structured recipes from AI Markdown responses

import type { ParsedRecipe } from '../types/chat';

/**
 * Extract a section from markdown text based on headers
 */
function extractSection(text: string, headers: string[]): string[] {
  const lines = text.split('\n');
  const items: string[] = [];
  let inSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    // Check if this is a header we're looking for
    const isTargetHeader = headers.some(h =>
      lowerLine.includes(h) && (lowerLine.startsWith('#') || lowerLine.startsWith('**'))
    );

    // Check if this is any other header (end of our section)
    const isOtherHeader = !isTargetHeader && (
      /^#{1,3}\s/.test(line.trim()) ||
      /^\*\*[^*]+\*\*\s*$/.test(line.trim())
    );

    if (isTargetHeader) {
      inSection = true;
      continue;
    }

    if (inSection && isOtherHeader) {
      break;
    }

    if (inSection) {
      // Match list items: - item, * item, 1. item, 1) item
      const listMatch = line.match(/^\s*[-*•]\s+(.+)$/) ||
                        line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (listMatch) {
        items.push(listMatch[1].trim());
      }
    }
  }

  return items;
}

/**
 * Strip markdown formatting from text
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/^\*\*|\*\*$/g, '') // Remove ** at start/end
    .replace(/^\*|\*$/g, '')     // Remove * at start/end
    .replace(/^_|_$/g, '')       // Remove _ at start/end
    .trim();
}

/**
 * Extract recipe name from text
 */
function extractName(text: string): string {
  // Try markdown heading
  const headingMatch = text.match(/^#+\s*(.+)/m);
  if (headingMatch) {
    return stripMarkdown(headingMatch[1]);
  }

  // Try bold text at start
  const boldMatch = text.match(/^\*\*([^*]+)\*\*/m);
  if (boldMatch) {
    return boldMatch[1].trim();
  }

  // Try first non-empty line
  const firstLine = text.split('\n').find(l => l.trim().length > 0);
  if (firstLine) {
    return stripMarkdown(firstLine.slice(0, 50));
  }

  return 'Ricetta';
}

/**
 * Extract time from text
 */
function extractTime(text: string): string | undefined {
  const timeMatch = text.match(/(\d+[-–]\d+|\d+)\s*(minuti|min|ore|hours?|minutes?)/i);
  return timeMatch ? timeMatch[0] : undefined;
}

/**
 * Extract servings from text
 */
function extractServings(text: string): string | undefined {
  const servingsMatch = text.match(/(\d+)\s*(porzioni|persone|servings?|portions?)/i);
  return servingsMatch ? servingsMatch[0] : undefined;
}

/**
 * Extract tips from text (look for "Consigli", "Tips", "Suggerimenti")
 */
function extractTips(text: string): string[] {
  return extractSection(text, ['consigli', 'tips', 'suggerimenti', 'note']);
}

/**
 * Main function: Parse a recipe from AI response text
 */
export function parseRecipeFromText(text: string): ParsedRecipe | null {
  // Look for ingredients section (all supported languages)
  const ingredients = extractSection(text, [
    // Italian
    'ingredienti',
    // English
    'ingredients',
    // French
    'ingrédients',
    // Spanish
    'ingredientes',
    // Japanese
    '材料',
    // Chinese
    '食材',
  ]);

  // Look for steps section (all supported languages)
  const steps = extractSection(text, [
    // Italian
    'preparazione',
    // English
    'steps',
    // French
    'préparation',
    // Spanish
    'preparación',
    // Japanese
    '作り方',
    // Chinese
    '步驟',
  ]);

  // Must have both ingredients and steps to be a recipe
  if (ingredients.length === 0 || steps.length === 0) {
    return null;
  }

  return {
    name: extractName(text),
    ingredients,
    steps,
    time: extractTime(text),
    servings: extractServings(text),
    tips: extractTips(text).length > 0 ? extractTips(text) : undefined,
  };
}

/**
 * Check if text likely contains a recipe (quick check)
 */
export function containsRecipe(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Check for ingredients in any language
  const hasIngredients =
    lowerText.includes('ingredienti') ||
    lowerText.includes('ingredients') ||
    lowerText.includes('ingrédients') ||
    lowerText.includes('ingredientes') ||
    text.includes('材料') ||
    text.includes('食材');

  // Check for steps in any language
  const hasSteps =
    lowerText.includes('preparazione') ||
    lowerText.includes('steps') ||
    lowerText.includes('préparation') ||
    lowerText.includes('preparación') ||
    text.includes('作り方') ||
    text.includes('步驟');

  return hasIngredients && hasSteps;
}

/**
 * Extract intro text (before recipe starts) from AI response
 * Returns text before the recipe title/ingredients section
 */
export function extractIntroText(text: string): string {
  const lines = text.split('\n');
  const introLines: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    // Stop when we hit ingredients header in any language
    if (
      lowerLine.match(/^#+\s*\*?\*?[A-Z]/) || // Markdown heading with caps (recipe title)
      lowerLine.includes('ingredienti') ||
      lowerLine.includes('ingredients') ||
      lowerLine.includes('ingrédients') ||
      lowerLine.includes('ingredientes') ||
      line.includes('材料') ||
      line.includes('食材') ||
      lowerLine.match(/^\*\*[A-Z]{3,}/) // Bold all-caps title
    ) {
      break;
    }

    introLines.push(line);
  }

  return introLines.join('\n').trim();
}
