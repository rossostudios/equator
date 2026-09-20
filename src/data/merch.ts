export interface MerchItem {
  name: string;
  note: string;
  /** Set once there is something to buy. Without it the item shows as not yet for sale. */
  url?: string;
  price?: string;
}

/**
 * Real products only. Nothing goes in here until it exists and can be bought.
 *
 * { name: 'Studio Pass Tee', note: 'Heavyweight, the ID card printed small on the chest.', price: 'USD 38', url: 'https://…' },
 */
export const merch: MerchItem[] = [];
