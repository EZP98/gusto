// Share utilities for WhatsApp and native sharing

const BASE_URL = 'https://gusto-8cx.pages.dev';

export interface ShareData {
  title?: string;
  text: string;
  url?: string;
}

/**
 * Share content using Web Share API (mobile) or WhatsApp fallback
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  const shareText = data.title
    ? `*${data.title}*\n\n${data.text}`
    : data.text;

  const fullText = data.url
    ? `${shareText}\n\n${data.url}`
    : `${shareText}\n\nScoperto con Gusto - gusto-8cx.pages.dev`;

  // Try native Web Share API first (works great on mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title || 'Gusto',
        text: fullText,
      });
      return true;
    } catch (err) {
      // User cancelled or error - fall through to WhatsApp
      if ((err as Error).name === 'AbortError') {
        return false; // User cancelled
      }
    }
  }

  // Fallback: Open WhatsApp with pre-filled text
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  window.open(whatsappUrl, '_blank');
  return true;
}

/**
 * Format recipe for sharing
 */
export function formatRecipeForShare(recipe: {
  name: string;
  time?: string;
  servings?: string;
  ingredients: string[];
  steps: string[];
}): string {
  let text = '';

  if (recipe.time) text += `Tempo: ${recipe.time}\n`;
  if (recipe.servings) text += `Porzioni: ${recipe.servings}\n`;

  text += '\nIngredienti:\n';
  recipe.ingredients.forEach(ing => {
    text += `- ${ing}\n`;
  });

  text += '\nPreparazione:\n';
  recipe.steps.forEach((step, i) => {
    text += `${i + 1}. ${step}\n`;
  });

  return text;
}

/**
 * Share a recipe
 * @param recipe - The recipe data
 * @param recipeId - Optional recipe ID for share URL with preview
 */
export async function shareRecipe(recipe: {
  name: string;
  time?: string;
  servings?: string;
  ingredients: string[];
  steps: string[];
}, recipeId?: string): Promise<boolean> {
  // If we have a recipe ID, include the share URL for link preview
  const shareUrl = recipeId ? `${BASE_URL}/share/${recipeId}` : undefined;

  return shareContent({
    title: recipe.name,
    text: formatRecipeForShare(recipe),
    url: shareUrl,
  });
}

/**
 * Generate a share URL for a recipe (for copying link)
 */
export function getRecipeShareUrl(recipeId: string): string {
  return `${BASE_URL}/share/${recipeId}`;
}

/**
 * Share a text message
 */
export async function shareMessage(content: string, title?: string): Promise<boolean> {
  return shareContent({
    title,
    text: content,
  });
}
