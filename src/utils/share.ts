// Share utilities - Link-based sharing for WhatsApp and other platforms

const BASE_URL = 'https://gusto-8cx.pages.dev';

export interface RecipeData {
  name: string;
  time?: string;
  servings?: string;
  ingredients: string[];
  steps: string[];
  tips?: string[];
}

/**
 * Create a shareable link for a recipe
 * Saves the recipe to DB and returns the share URL
 */
export async function createShareLink(recipe: RecipeData): Promise<string | null> {
  try {
    const response = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });

    if (!response.ok) {
      console.error('Failed to create share link');
      return null;
    }

    const data = await response.json() as { shareUrl: string };
    return data.shareUrl;
  } catch (error) {
    console.error('Share link creation error:', error);
    return null;
  }
}

/**
 * Check if device is mobile
 */
function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Share a recipe via link
 * Creates a shareable link and opens the share dialog
 */
export async function shareRecipe(recipe: RecipeData): Promise<boolean> {
  // Create shareable link
  const shareUrl = await createShareLink(recipe);

  if (!shareUrl) {
    // Fallback to text sharing if link creation fails
    return shareRecipeAsText(recipe);
  }

  const shareText = `${recipe.name} - Ricetta su Gusto`;

  // Try native Web Share API first (works great on mobile)
  if (navigator.share && isMobile()) {
    try {
      await navigator.share({
        title: recipe.name,
        text: shareText,
        url: shareUrl,
      });
      return true;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return false; // User cancelled
      }
    }
  }

  // Desktop: Copy link to clipboard
  if (!isMobile()) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Show notification (will be handled by caller)
      alert(`Link copiato!\n${shareUrl}`);
      return true;
    } catch {
      // Fallback: open in new tab
      window.open(shareUrl, '_blank');
      return true;
    }
  }

  // Mobile fallback: Open WhatsApp with link
  const whatsappText = `${shareText}\n${shareUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
  window.open(whatsappUrl, '_blank');
  return true;
}

/**
 * Fallback: Share recipe as text (if link creation fails)
 */
function shareRecipeAsText(recipe: RecipeData): boolean {
  let text = `*${recipe.name}*\n\n`;

  if (recipe.time) text += `Tempo: ${recipe.time}\n`;
  if (recipe.servings) text += `Porzioni: ${recipe.servings}\n`;

  text += '\nIngredienti:\n';
  recipe.ingredients.forEach(ing => {
    text += `- ${ing}\n`;
  });

  text += '\nScoperto con Gusto - gusto-8cx.pages.dev';

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
  return true;
}

/**
 * Share a text message (for non-recipe content)
 */
export async function shareMessage(content: string, title?: string): Promise<boolean> {
  const shareText = title ? `*${title}*\n\n${content}` : content;
  const fullText = `${shareText}\n\nScoperto con Gusto - gusto-8cx.pages.dev`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'Gusto',
        text: fullText,
      });
      return true;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return false;
      }
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  window.open(whatsappUrl, '_blank');
  return true;
}

/**
 * Copy share link to clipboard
 */
export async function copyShareLink(recipe: RecipeData): Promise<string | null> {
  const shareUrl = await createShareLink(recipe);

  if (!shareUrl) {
    return null;
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    return shareUrl;
  } catch {
    return shareUrl; // Return URL even if clipboard fails
  }
}

/**
 * Get share URL for a recipe (without creating new share)
 */
export function getRecipeShareUrl(shareId: string): string {
  return `${BASE_URL}/share/${shareId}`;
}
