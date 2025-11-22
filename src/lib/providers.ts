import { type Quote, type UserSettings } from '@prisma/client';

export type Provider = 'stripe' | 'flutterwave';

export function selectProvider(settings: UserSettings | null, quote: Quote) {
  // Seller preference wins if set and supported
  if (settings?.preferredProvider === 'flutterwave') return 'flutterwave';
  // Route based on currency for now (NGN, ZAR -> Flutterwave)
  const currency = (quote.currency || settings?.currency || 'USD').toLowerCase();
  if (['ngn', 'zar', 'kes', 'ghs'].includes(currency)) {
    return 'flutterwave';
  }
  return 'stripe';
}
