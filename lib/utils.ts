import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parses a number, handling undefined, null, and invalid values
 */
export function safeNumber(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Safely formats currency amounts
 */
export function formatAmount(amount: number): string {
  if (isNaN(amount)) return '₵0.0K';
  if (amount >= 1000000) {
    return `₵${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `₵${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₵${amount.toLocaleString()}`;
  }
}

/**
 * Safely formats dates
 */
export function formatDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
}
