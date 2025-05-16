import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price in cents to a string representation (e.g., $10.00).
 * @param priceInCents - The price in cents.
 * @returns A string representing the formatted price.
 */
export function formatPrice(priceInCents: number): string {
  const priceInDollars = priceInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInDollars);
}