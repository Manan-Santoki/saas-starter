import { Team } from '@/lib/db/schema';

export async function createCheckoutSession({
  team,
  priceId,
}: {
  team: Team | null;
  priceId: string;
}) {
  throw new Error('Stripe billing is disabled in this deployment.');
}

export async function createCustomerPortalSession(team: Team) {
  throw new Error('Stripe billing is disabled in this deployment.');
}

export async function handleSubscriptionChange(subscription: unknown) {
  return;
}

export async function getStripePrices() {
  return [] as {
    id: string;
    productId: string;
    unitAmount: number | null;
    currency: string;
    interval: string | null | undefined;
    trialPeriodDays: number | null | undefined;
  }[];
}

export async function getStripeProducts() {
  return [] as {
    id: string;
    name: string;
    description: string | null;
    defaultPriceId: string | null | undefined;
  }[];
}
