import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names cleanly using clsx and tailwind-merge.
 * @param  {...any} inputs - Class names or conditional class objects.
 * @returns {string} Merged tailwind class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
