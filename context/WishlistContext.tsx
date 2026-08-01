import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistItem, SortOption } from '@/types/wishlist';
import { useAuth } from '@/context/AuthContext';
import { pushWishes, pullWishes, deleteServerWish } from '@/services/supabase';

const STORAGE_KEY = '@wishlist_items';

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  addItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'trashed'>) => void;
  updateItem: (id: string, updates: Partial<WishlistItem>) => void;
  deleteItem: (id: string) => void;
  permanentDeleteItem: (id: string) => void;
  completeItem: (id: string) => void;
  restoreItem: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  activeItems: WishlistItem[];
  completedItems: WishlistItem[];
  deletedItems: WishlistItem[];
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const serverId = user && !user.isGuest ? user.id : null;

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (!serverId) return;
    let active = true;
    const sync = async () => {
      try {
        const local = itemsRef.current;
        await pushWishes(serverId, local);
        const serverItems = await pullWishes(serverId);
        if (!active) return;
        const byId = new Map(serverItems.map((item) => [item.id, item]));
        local.forEach((item) => {
          if (!byId.has(item.id)) byId.set(item.id, item);
        });
        const merged = Array.from(byId.values());
        setItems(merged);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
      } catch (e) {
        console.error('Wishlist sync failed:', e);
      }
    };
    sync();
    return () => {
      active = false;
    };
  }, [serverId]);

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
    trashed: item.trashed ?? false,
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

  const syncToServer = useCallback(
    async (newItems: WishlistItem[]) => {
      if (serverId) {
        try {
          await pushWishes(serverId, newItems);
        } catch (e) {
          console.error('Failed to push wishlist to server:', e);
        }
      }
    },
    [serverId]
  );

  const persist = useCallback(
    (newItems: WishlistItem[]) => {
      saveItems(newItems);
      syncToServer(newItems);
    },
    [saveItems, syncToServer]
  );

  const addItem = useCallback(
    (item: Omit<WishlistItem, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'trashed'>) => {
      const newItem: WishlistItem = {
        ...item,
        savedAmount: item.savedAmount ?? 0,
        id: generateId(),
        createdAt: Date.now(),
        completed: false,
        completedAt: null,
        trashed: false,
      };
      persist([newItem, ...itemsRef.current]);
    },
    [persist]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<WishlistItem>) => {
      persist(itemsRef.current.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    },
    [persist]
  );

  const deleteItem = useCallback(
    (id: string) => {
      persist(itemsRef.current.map((item) => (item.id === id ? { ...item, trashed: true } : item)));
    },
    [persist]
  );

  const permanentDeleteItem = useCallback(
    (id: string) => {
      persist(itemsRef.current.filter((item) => item.id !== id));
      if (serverId) {
        deleteServerWish(id).catch((e) => console.error('Failed to delete wish on server:', e));
      }
    },
    [persist, serverId]
  );

  const restoreFromTrash = useCallback(
    (id: string) => {
      persist(itemsRef.current.map((item) => (item.id === id ? { ...item, trashed: false } : item)));
    },
    [persist]
  );

  const completeItem = useCallback(
    (id: string) => {
      persist(
        itemsRef.current.map((item) =>
          item.id === id ? { ...item, completed: true, completedAt: Date.now() } : item
        )
      );
    },
    [persist]
  );

  const restoreItem = useCallback(
    (id: string) => {
      persist(
        itemsRef.current.map((item) =>
          item.id === id ? { ...item, completed: false, completedAt: null } : item
        )
      );
    },
    [persist]
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

  const activeItems = sortItems(items.filter((item) => !item.completed && !item.trashed));
  const completedItems = sortItems(items.filter((item) => item.completed && !item.trashed));
  const deletedItems = sortItems(items.filter((item) => item.trashed));

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        updateItem,
        deleteItem,
        permanentDeleteItem,
        completeItem,
        restoreItem,
        restoreFromTrash,
        activeItems,
        completedItems,
        deletedItems,
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
