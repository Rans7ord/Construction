import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeNumber(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

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