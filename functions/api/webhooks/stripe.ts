// POST /api/webhooks/stripe - Handle Stripe webhook events

import { verifyWebhookSignature, getSubscription } from '../../lib/stripe';
import {
  updateSubscription,
  getSubscriptionByStripeId,
  createFreeSubscription,
} from '../../lib/subscription';

interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRO_PRICE_ID: string;
  STRIPE_PREMIUM_PRICE_ID: string;
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      customer?: string;
      subscription?: string;
      status?: string;
      current_period_start?: number;
      current_period_end?: number;
      metadata?: { user_id?: string };
      items?: { data: Array<{ price: { id: string } }> };
    };
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const payload = await request.text();

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(payload) as StripeEvent;
    console.log('Stripe webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        // New subscription created via checkout
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        if (!userId || !subscriptionId || !customerId) {
          console.error('Missing data in checkout session:', { userId, subscriptionId, customerId });
          break;
        }

        // Get subscription details from Stripe
        const stripeSub = await getSubscription(
          { secretKey: env.STRIPE_SECRET_KEY },
          subscriptionId as string
        );

        if ('error' in stripeSub) {
          console.error('Error fetching subscription:', stripeSub.error);
          break;
        }

        // Determine plan based on price ID
        const priceId = stripeSub.items.data[0]?.price.id;
        let planId = 'free';
        if (priceId === env.STRIPE_PRO_PRICE_ID) planId = 'pro';
        else if (priceId === env.STRIPE_PREMIUM_PRICE_ID) planId = 'premium';

        // Check if user has subscription record
        const existing = await getSubscriptionByStripeId(env.DB, subscriptionId as string);

        if (!existing) {
          // Ensure user has a subscription record first
          await createFreeSubscription(env.DB, userId);
        }

        // Update subscription
        await updateSubscription(env.DB, userId, {
          plan_id: planId,
          stripe_customer_id: customerId as string,
          stripe_subscription_id: subscriptionId as string,
          status: 'active',
          current_period_start: stripeSub.current_period_start * 1000,
          current_period_end: stripeSub.current_period_end * 1000,
        });

        console.log(`Updated subscription for user ${userId} to ${planId}`);
        break;
      }

      case 'customer.subscription.updated': {
        // Subscription updated (plan change, renewal, etc.)
        const subscription = event.data.object;
        const subscriptionId = subscription.id;

        // Find user by Stripe subscription ID
        const existing = await getSubscriptionByStripeId(env.DB, subscriptionId);
        if (!existing) {
          console.error('Subscription not found for:', subscriptionId);
          break;
        }

        // Determine plan based on price ID
        const priceId = subscription.items?.data[0]?.price.id;
        let planId = 'free';
        if (priceId === env.STRIPE_PRO_PRICE_ID) planId = 'pro';
        else if (priceId === env.STRIPE_PREMIUM_PRICE_ID) planId = 'premium';

        // Map Stripe status to our status
        let status: 'active' | 'canceled' | 'past_due' = 'active';
        if (subscription.status === 'past_due') status = 'past_due';
        else if (subscription.status === 'canceled' || subscription.status === 'unpaid') status = 'canceled';

        await updateSubscription(env.DB, existing.user_id, {
          plan_id: planId,
          status,
          current_period_start: (subscription.current_period_start || 0) * 1000,
          current_period_end: (subscription.current_period_end || 0) * 1000,
        });

        console.log(`Updated subscription ${subscriptionId}: plan=${planId}, status=${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription canceled
        const subscription = event.data.object;
        const subscriptionId = subscription.id;

        // Find user by Stripe subscription ID
        const existing = await getSubscriptionByStripeId(env.DB, subscriptionId);
        if (!existing) {
          console.error('Subscription not found for deletion:', subscriptionId);
          break;
        }

        // Downgrade to free plan
        await updateSubscription(env.DB, existing.user_id, {
          plan_id: 'free',
          status: 'canceled',
          stripe_subscription_id: '',
        });

        console.log(`Canceled subscription for user ${existing.user_id}`);
        break;
      }

      case 'invoice.payment_failed': {
        // Payment failed - mark as past_due
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (!subscriptionId) break;

        const existing = await getSubscriptionByStripeId(env.DB, subscriptionId as string);
        if (!existing) break;

        await updateSubscription(env.DB, existing.user_id, {
          status: 'past_due',
        });

        console.log(`Marked subscription ${subscriptionId} as past_due`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
