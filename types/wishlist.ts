export type Priority = 'low' | 'medium' | 'high';

export interface WishlistItem {
  id: string;
  title: string;
  price: number | null;
  currency: string;
  imageUri: string | null;
  link: string;
  notes: string;
  priority: Priority;
  categories: string[];
  savedAmount: number;
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
}

export type SortOption = 'date' | 'price-asc' | 'price-desc' | 'priority';

export const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home',
  'Books',
  'Gaming',
  'Sports',
  'Beauty',
  'Food',
  'Travel',
  'Other',
] as const;

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
  low: { label: 'Low', color: '#34C759', icon: '○' },
  medium: { label: 'Medium', color: '#FF9500', icon: '◑' },
  high: { label: 'High', color: '#FF3B30', icon: '●' },
};

export const CURRENCIES = ['$', '€', '£', '¥', '₹', 'MX$', '֏'] as const;
