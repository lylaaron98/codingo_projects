/**
 * Format a number as currency
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse a currency string to a number
 */
export function parseMoney(value: string): number {
  const cleaned = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Calculate total from items with price and quantity
 */
export function calculateTotal(
  items: Array<{ price: number; qty: number }>
): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}
