import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge Tailwind classes cleanly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah (IDR)
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a WhatsApp order message from cart items
 */
export function generateWhatsAppMessage(
  items: { name: string; quantity: number; price: number }[],
  total: number
): string {
  let message = `*JTT Shop Order Request*\n\n`;
  message += `Hello, I would like to order the following items:\n\n`;
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} (x${item.quantity}) - ${formatIDR(item.price * item.quantity)}\n`;
  });
  
  message += `\n*Total: ${formatIDR(total)}*\n\n`;
  message += `Please confirm availability and shipping details. Thank you!`;
  
  return encodeURIComponent(message);
}
