import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistItem, SortOption } from '@/types/wishlist';

const STORAGE_KEY = '@wishlist_items';

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  addItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => void;
  updateItem: (id: string, updates: Partial<WishlistItem>) => void;
  deleteItem: (id: string) => void;
  completeItem: (id: string) => void;
  restoreItem: (id: string) => void;
  activeItems: WishlistItem[];
  completedItems: WishlistItem[];
  totalActiveValue: number;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('date');

  useEffect(() => {
    loadItems();
  }, []);

  const normalizeItem = (item: Partial<WishlistItem>): WishlistItem => ({
    id: item.id ?? generateId(),
    title: item.title ?? '',
    price: item.price ?? null,
    currency: item.currency ?? '$',
    imageUri: item.imageUri ?? null,
    link: item.link ?? '',
    notes: item.notes ?? '',
    priority: item.priority ?? 'medium',
    categories: item.categories ?? [],
    savedAmount: item.savedAmount ?? 0,
    completed: item.completed ?? false,
    createdAt: item.createdAt ?? Date.now(),
    completedAt: item.completedAt ?? null,
  });

  const loadItems = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Partial<WishlistItem>[] = JSON.parse(stored);
        setItems(parsed.map(normalizeItem));
      }
    } catch (e) {
      console.error('Failed to load wishlist items:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveItems = useCallback(async (newItems: WishlistItem[]) => {
    setItems(newItems);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save wishlist items:', e);
    }
  }, []);

  const addItem = useCallback(
    (item: Omit<WishlistItem, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => {
      const newItem: WishlistItem = {
        ...item,
        savedAmount: item.savedAmount ?? 0,
        id: generateId(),
        createdAt: Date.now(),
        completed: false,
        completedAt: null,
      };
      saveItems([newItem, ...items]);
    },
    [items, saveItems]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<WishlistItem>) => {
      saveItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    },
    [items, saveItems]
  );

  const deleteItem = useCallback(
    (id: string) => {
      saveItems(items.filter((item) => item.id !== id));
    },
    [items, saveItems]
  );

  const completeItem = useCallback(
    (id: string) => {
      saveItems(
        items.map((item) =>
          item.id === id ? { ...item, completed: true, completedAt: Date.now() } : item
        )
      );
    },
    [items, saveItems]
  );

  const restoreItem = useCallback(
    (id: string) => {
      saveItems(
        items.map((item) =>
          item.id === id ? { ...item, completed: false, completedAt: null } : item
        )
      );
    },
    [items, saveItems]
  );

  const sortItems = useCallback(
    (list: WishlistItem[]): WishlistItem[] => {
      const sorted = [...list];
      switch (sortBy) {
        case 'price-asc':
          return sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        case 'price-desc':
          return sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        case 'priority': {
          const order = { high: 0, medium: 1, low: 2 };
          return sorted.sort((a, b) => order[a.priority] - order[b.priority]);
        }
        case 'date':
        default:
          return sorted.sort((a, b) => b.createdAt - a.createdAt);
      }
    },
    [sortBy]
  );

  const activeItems = sortItems(items.filter((item) => !item.completed));
  const completedItems = sortItems(items.filter((item) => item.completed));
  const totalActiveValue = activeItems.reduce((sum, item) => sum + (item.price ?? 0), 0);

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        updateItem,
        deleteItem,
        completeItem,
        restoreItem,
        activeItems,
        completedItems,
        totalActiveValue,
        sortBy,
        setSortBy,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
