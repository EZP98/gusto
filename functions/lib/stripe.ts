// Stripe API helpers for Cloudflare Workers (Edge-compatible)
// Uses fetch instead of official Stripe SDK for better edge runtime support

const STRIPE_API_URL = 'https://api.stripe.com/v1';

interface StripeConfig {
  secretKey: string;
}

/**
 * Make a request to Stripe API
 */
async function stripeRequest(
  config: StripeConfig,
  endpoint: string,
  method: string = 'GET',
  body?: Record<string, string | number | undefined>
): Promise<Response> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    const formBody = Object.entries(body)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    options.body = formBody;
  }

  return fetch(`${STRIPE_API_URL}${endpoint}`, options);
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(
  config: StripeConfig,
  params: {
    priceId: string;
    customerId?: string;
    customerEmail?: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }
): Promise<{ sessionId: string; url: string } | { error: string }> {
  const body: Record<string, string | number | undefined> = {
    'mode': 'subscription',
    'success_url': params.successUrl,
    'cancel_url': params.cancelUrl,
    'line_items[0][price]': params.priceId,
    'line_items[0][quantity]': 1,
    'metadata[user_id]': params.userId,
  };

  if (params.customerId) {
    body['customer'] = params.customerId;
  } else if (params.customerEmail) {
    body['customer_email'] = params.customerEmail;
  }

  const response = await stripeRequest(config, '/checkout/sessions', 'POST', body);
  const data = await response.json() as { id?: string; url?: string; error?: { message: string } };

  if (data.error) {
    return { error: data.error.message };
  }

  return {
    sessionId: data.id!,
    url: data.url!,
  };
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(
  config: StripeConfig,
  params: {
    customerId: string;
    returnUrl: string;
  }
): Promise<{ url: string } | { error: string }> {
  const response = await stripeRequest(config, '/billing_portal/sessions', 'POST', {
    'customer': params.customerId,
    'return_url': params.returnUrl,
  });
  const data = await response.json() as { url?: string; error?: { message: string } };

  if (data.error) {
    return { error: data.error.message };
  }

  return { url: data.url! };
}

/**
 * Retrieve a Stripe subscription
 */
export async function getSubscription(
  config: StripeConfig,
  subscriptionId: string
): Promise<{
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  customer: string;
  items: { data: Array<{ price: { id: string; product: string } }> };
} | { error: string }> {
  const response = await stripeRequest(config, `/subscriptions/${subscriptionId}`);
  const data = await response.json() as {
    id?: string;
    status?: string;
    current_period_start?: number;
    current_period_end?: number;
    customer?: string;
    items?: { data: Array<{ price: { id: string; product: string } }> };
    error?: { message: string };
  };

  if (data.error) {
    return { error: data.error.message };
  }

  return data as {
    id: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
    customer: string;
    items: { data: Array<{ price: { id: string; product: string } }> };
  };
}

/**
 * Verify Stripe webhook signature
 * Note: Simplified version - in production consider using timing-safe comparison
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<boolean> {
  const parts = signature.split(',');
  let timestamp = '';
  let v1Signature = '';

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') v1Signature = value;
  }

  if (!timestamp || !v1Signature) {
    return false;
  }

  // Check timestamp (allow 5 minutes tolerance)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) {
    return false;
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedPayload)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSignature === v1Signature;
}
