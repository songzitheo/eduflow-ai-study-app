import Stripe from 'stripe';

import { getEnvVar } from '@/utils/get-env-var';

// Use a placeholder key during build if STRIPE_SECRET_KEY is not set
// This allows the app to build without Stripe configured
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_build';

export const stripeAdmin = new Stripe(stripeKey, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2023-10-16',
  // Register this as an official Stripe plugin.
  // https://stripe.com/docs/building-plugins#setappinfo
  appInfo: {
    name: 'UPDATE_THIS_WITH_YOUR_STRIPE_APP_NAME',
    version: '0.1.0',
  },
});
