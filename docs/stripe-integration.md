# Stripe Payment Integration Guide

This guide explains how to set up the straightforward Stripe payment integration for Teamcast UI.

## Overview

We've implemented a client-side Stripe integration that redirects users to Stripe Checkout for payment processing. This approach is secure, simple, and requires minimal backend infrastructure.

## Setup Steps

### 1. Create a Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or log in
3. Get your API keys from the [API Keys section](https://dashboard.stripe.com/apikeys)

### 2. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Create Stripe Products and Prices

In your Stripe Dashboard:

1. Go to [Products](https://dashboard.stripe.com/products)
2. Create products for each subscription tier (Starter, Professional, Enterprise)
3. For each product, create a recurring price (monthly/yearly)
4. Copy the price IDs and update them in `src/lib/utils/stripe.ts`:

```typescript
export const STRIPE_PRICE_IDS = {
  STARTER: 'price_your_starter_price_id',
  PROFESSIONAL: 'price_your_professional_price_id',
  ENTERPRISE: 'price_your_enterprise_price_id',
} as const;
```

### 4. Test the Integration

1. Use Stripe's test mode with test credit cards
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - More test cards: [Stripe Testing Guide](https://stripe.com/docs/testing)

## How It Works

### 1. Payment Flow

1. User clicks "Subscribe" on a package
2. `StripePaymentModal` opens with package details
3. User clicks "Subscribe Now"
4. App calls `redirectToCheckout()` which:
   - Uses Stripe.js to redirect to Stripe Checkout
   - Includes success/cancel URLs
5. User completes payment on Stripe's secure checkout page
6. Stripe redirects back to your app with payment status
7. `checkPaymentStatus()` handles the return and shows appropriate messages

### 2. Key Components

- **`src/lib/utils/stripe.ts`**: Core Stripe utilities and price IDs
- **`src/components/app/common/stripe/stripe-payment-modal.tsx`**: Payment confirmation modal
- **`src/lib/utils/payment-handler.ts`**: Handles payment success/failure
- **`src/lib/providers/stripe-provider.tsx`**: Optional Stripe context provider

### 3. Security

- Uses Stripe's secure hosted checkout (PCI compliant)
- No card details stored in your app
- All payment processing handled by Stripe
- Only publishable key exposed to frontend

## Customization

### Adding New Subscription Tiers

1. Create new product in Stripe Dashboard
2. Add price ID to `STRIPE_PRICE_IDS` in `stripe.ts`
3. Update `getPriceIdForPackage()` function to handle new tier

### Custom Success/Cancel URLs

Update the URLs in `redirectToCheckout()` function:

```typescript
successUrl: `${window.location.origin}/app/client/subscription?payment=success&session_id={CHECKOUT_SESSION_ID}`,
cancelUrl: `${window.location.origin}/app/client/subscription?payment=cancelled`,
```

### Webhook Integration (Optional)

For real-time subscription updates, you can set up Stripe webhooks:

1. Create webhook endpoint in Stripe Dashboard
2. Point to your backend API (e.g., `/api/webhooks/stripe`)
3. Handle events like `checkout.session.completed`, `invoice.payment_succeeded`

## Troubleshooting

### Common Issues

1. **"Stripe failed to load"**

   - Check your publishable key is correct
   - Ensure environment variables are loaded properly

2. **"Invalid price ID"**

   - Verify price IDs in Stripe Dashboard match your code
   - Check if using test vs live mode consistently

3. **Payment doesn't redirect back**
   - Verify success/cancel URLs are correct
   - Check browser console for errors

### Development vs Production

- **Development**: Use `pk_test_` and `sk_test_` keys
- **Production**: Use `pk_live_` and `sk_live_` keys
- Never commit real API keys to version control

## Next Steps

1. Set up Stripe webhooks for real-time subscription status updates
2. Implement billing portal for subscription management
3. Add prorated billing for plan changes
4. Set up usage-based billing if needed

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe.js Reference](https://stripe.com/docs/js)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
