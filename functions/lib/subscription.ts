// Subscription management utilities
// Handles plan lookups and subscription state

import { generateId } from './auth';

export interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  messages_per_day: number;
  max_saved_recipes: number;
  features: string[];
  stripe_price_id: string | null;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: number | null;
  current_period_end: number | null;
  created_at: number;
  updated_at: number;
}

/**
 * Get all available plans
 */
export async function getPlans(db: D1Database): Promise<Plan[]> {
  const result = await db.prepare(
    'SELECT * FROM plans ORDER BY price_monthly ASC'
  ).all<{
    id: string;
    name: string;
    display_name: string;
    price_monthly: number;
    messages_per_day: number;
    max_saved_recipes: number;
    features: string;
    stripe_price_id: string | null;
  }>();

  return (result.results || []).map(p => ({
    ...p,
    features: JSON.parse(p.features || '[]'),
  }));
}

/**
 * Get a single plan by ID
 */
export async function getPlanById(db: D1Database, planId: string): Promise<Plan | null> {
  const result = await db.prepare(
    'SELECT * FROM plans WHERE id = ?'
  ).bind(planId).first<{
    id: string;
    name: string;
    display_name: string;
    price_monthly: number;
    messages_per_day: number;
    max_saved_recipes: number;
    features: string;
    stripe_price_id: string | null;
  }>();

  if (!result) return null;

  return {
    ...result,
    features: JSON.parse(result.features || '[]'),
  };
}

/**
 * Get user's current subscription with plan details
 */
export async function getUserSubscription(
  db: D1Database,
  userId: string
): Promise<UserSubscription | null> {
  const result = await db.prepare(`
    SELECT
      us.*,
      p.name as plan_name,
      p.display_name as plan_display_name,
      p.price_monthly as plan_price_monthly,
      p.messages_per_day as plan_messages_per_day,
      p.max_saved_recipes as plan_max_saved_recipes,
      p.features as plan_features,
      p.stripe_price_id as plan_stripe_price_id
    FROM user_subscriptions us
    JOIN plans p ON us.plan_id = p.id
    WHERE us.user_id = ?
  `).bind(userId).first<{
    id: string;
    user_id: string;
    plan_id: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    status: 'active' | 'canceled' | 'past_due';
    current_period_start: number | null;
    current_period_end: number | null;
    created_at: number;
    updated_at: number;
    plan_name: string;
    plan_display_name: string;
    plan_price_monthly: number;
    plan_messages_per_day: number;
    plan_max_saved_recipes: number;
    plan_features: string;
    plan_stripe_price_id: string | null;
  }>();

  if (!result) return null;

  return {
    id: result.id,
    user_id: result.user_id,
    plan_id: result.plan_id,
    stripe_customer_id: result.stripe_customer_id,
    stripe_subscription_id: result.stripe_subscription_id,
    status: result.status,
    current_period_start: result.current_period_start,
    current_period_end: result.current_period_end,
    created_at: result.created_at,
    updated_at: result.updated_at,
    plan: {
      id: result.plan_id,
      name: result.plan_name,
      display_name: result.plan_display_name,
      price_monthly: result.plan_price_monthly,
      messages_per_day: result.plan_messages_per_day,
      max_saved_recipes: result.plan_max_saved_recipes,
      features: JSON.parse(result.plan_features || '[]'),
      stripe_price_id: result.plan_stripe_price_id,
    },
  };
}

/**
 * Create a free subscription for a new user
 */
export async function createFreeSubscription(
  db: D1Database,
  userId: string
): Promise<void> {
  const now = Date.now();
  const id = generateId();

  await db.prepare(`
    INSERT INTO user_subscriptions (id, user_id, plan_id, status, created_at, updated_at)
    VALUES (?, ?, 'free', 'active', ?, ?)
  `).bind(id, userId, now, now).run();
}

/**
 * Update user's subscription after Stripe webhook
 */
export async function updateSubscription(
  db: D1Database,
  userId: string,
  updates: {
    plan_id?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    status?: 'active' | 'canceled' | 'past_due';
    current_period_start?: number;
    current_period_end?: number;
  }
): Promise<void> {
  const now = Date.now();
  const fields: string[] = ['updated_at = ?'];
  const values: (string | number)[] = [now];

  if (updates.plan_id) {
    fields.push('plan_id = ?');
    values.push(updates.plan_id);
  }
  if (updates.stripe_customer_id) {
    fields.push('stripe_customer_id = ?');
    values.push(updates.stripe_customer_id);
  }
  if (updates.stripe_subscription_id) {
    fields.push('stripe_subscription_id = ?');
    values.push(updates.stripe_subscription_id);
  }
  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.current_period_start) {
    fields.push('current_period_start = ?');
    values.push(updates.current_period_start);
  }
  if (updates.current_period_end) {
    fields.push('current_period_end = ?');
    values.push(updates.current_period_end);
  }

  values.push(userId);

  await db.prepare(`
    UPDATE user_subscriptions
    SET ${fields.join(', ')}
    WHERE user_id = ?
  `).bind(...values).run();
}

/**
 * Get subscription by Stripe subscription ID (for webhook handling)
 */
export async function getSubscriptionByStripeId(
  db: D1Database,
  stripeSubscriptionId: string
): Promise<{ user_id: string; plan_id: string } | null> {
  return await db.prepare(
    'SELECT user_id, plan_id FROM user_subscriptions WHERE stripe_subscription_id = ?'
  ).bind(stripeSubscriptionId).first<{ user_id: string; plan_id: string }>();
}
