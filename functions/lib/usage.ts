// Usage tracking utilities for Cloudflare Workers
// Tracks daily message limits and other usage

import { generateId } from './auth';

export interface UsageResult {
  count: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
}

/**
 * Get today's date as YYYY-MM-DD string (UTC)
 */
function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get current usage count for a user and action on a given date
 */
export async function getUsageCount(
  db: D1Database,
  userId: string,
  action: string,
  date?: string
): Promise<number> {
  const targetDate = date || getTodayDate();

  const result = await db.prepare(
    'SELECT count FROM usage_logs WHERE user_id = ? AND action = ? AND date = ?'
  ).bind(userId, action, targetDate).first<{ count: number }>();

  return result?.count || 0;
}

/**
 * Increment usage count for a user and action
 * Uses UPSERT to handle both new and existing records
 */
export async function incrementUsage(
  db: D1Database,
  userId: string,
  action: string
): Promise<number> {
  const date = getTodayDate();
  const id = generateId();

  // Try to increment existing record, or insert new one
  await db.prepare(`
    INSERT INTO usage_logs (id, user_id, action, date, count)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT (user_id, action, date)
    DO UPDATE SET count = count + 1
  `).bind(id, userId, action, date).run();

  // Return the new count
  return await getUsageCount(db, userId, action, date);
}

/**
 * Get user's plan and check if action is within limits
 */
export async function checkUsageLimit(
  db: D1Database,
  userId: string,
  action: string
): Promise<UsageResult> {
  // Get user's subscription and plan
  const subscription = await db.prepare(`
    SELECT p.messages_per_day, p.max_saved_recipes
    FROM user_subscriptions us
    JOIN plans p ON us.plan_id = p.id
    WHERE us.user_id = ? AND us.status = 'active'
  `).bind(userId).first<{ messages_per_day: number; max_saved_recipes: number }>();

  // Default to free plan if no subscription
  let limit: number;
  if (!subscription) {
    // Free plan defaults
    limit = action === 'message' ? 3 : 5;
  } else {
    limit = action === 'message'
      ? subscription.messages_per_day
      : subscription.max_saved_recipes;
  }

  const count = await getUsageCount(db, userId, action);

  // -1 means unlimited
  const isLimitReached = limit !== -1 && count >= limit;
  const remaining = limit === -1 ? -1 : Math.max(0, limit - count);

  return {
    count,
    limit,
    remaining,
    isLimitReached,
  };
}

/**
 * Get all usage stats for a user (for dashboard display)
 */
export async function getUserUsageStats(
  db: D1Database,
  userId: string
): Promise<{
  messages: UsageResult;
  recipes: UsageResult;
}> {
  const messages = await checkUsageLimit(db, userId, 'message');
  const recipes = await checkUsageLimit(db, userId, 'recipe_save');

  return { messages, recipes };
}
