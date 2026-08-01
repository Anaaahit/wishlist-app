import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodoItem, TodoSortOption } from '@/types/todo';

const STORAGE_KEY = '@todo_items';

interface TodoContextType {
  items: TodoItem[];
  isLoading: boolean;
  addTodo: (item: Omit<TodoItem, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'trashed'>) => void;
  updateTodo: (id: string, updates: Partial<TodoItem>) => void;
  deleteTodo: (id: string) => void;
  permanentDeleteTodo: (id: string) => void;
  completeTodo: (id: string) => void;
  restoreTodo: (id: string) => void;
  restoreTodoFromTrash: (id: string) => void;
  activeTodos: TodoItem[];
  completedTodos: TodoItem[];
  deletedTodos: TodoItem[];
  sortBy: TodoSortOption;
  setSortBy: (sort: TodoSortOption) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<TodoSortOption>('deadline');

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    loadTodos();
  }, []);

  const normalizeTodo = (item: Partial<TodoItem>): TodoItem => ({
    id: item.id ?? generateId(),
    title: item.title ?? '',
    notes: item.notes ?? '',
    deadline: item.deadline ?? null,
    priority: item.priority ?? 'medium',
    completed: item.completed ?? false,
    trashed: item.trashed ?? false,
    createdAt: item.createdAt ?? Date.now(),
    completedAt: item.completedAt ?? null,
  });

  const loadTodos = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Partial<TodoItem>[] = JSON.parse(stored);
        setItems(parsed.map(normalizeTodo));
      }
    } catch (e) {
      console.error('Failed to load todos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTodos = useCallback(async (newItems: TodoItem[]) => {
    setItems(newItems);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save todos:', e);
    }
  }, []);

  const addTodo = useCallback(
    (item: Omit<TodoItem, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'trashed'>) => {
      const newTodo: TodoItem = {
        ...item,
        id: generateId(),
        createdAt: Date.now(),
        completed: false,
        completedAt: null,
        trashed: false,
      };
      saveTodos([newTodo, ...itemsRef.current]);
    },
    [saveTodos]
  );

  const updateTodo = useCallback(
    (id: string, updates: Partial<TodoItem>) => {
      saveTodos(itemsRef.current.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    },
    [saveTodos]
  );

  const deleteTodo = useCallback(
    (id: string) => {
      saveTodos(itemsRef.current.map((item) => (item.id === id ? { ...item, trashed: true } : item)));
    },
    [saveTodos]
  );

  const permanentDeleteTodo = useCallback(
    (id: string) => {
      saveTodos(itemsRef.current.filter((item) => item.id !== id));
    },
    [saveTodos]
  );

  const restoreTodoFromTrash = useCallback(
    (id: string) => {
      saveTodos(itemsRef.current.map((item) => (item.id === id ? { ...item, trashed: false } : item)));
    },
    [saveTodos]
  );

  const completeTodo = useCallback(
    (id: string) => {
      saveTodos(
        itemsRef.current.map((item) =>
          item.id === id ? { ...item, completed: true, completedAt: Date.now() } : item
        )
      );
    },
    [saveTodos]
  );

  const restoreTodo = useCallback(
    (id: string) => {
      saveTodos(
        itemsRef.current.map((item) =>
          item.id === id ? { ...item, completed: false, completedAt: null } : item
        )
      );
    },
    [saveTodos]
  );

  const sortItems = useCallback(
    (list: TodoItem[]): TodoItem[] => {
      const sorted = [...list];
      switch (sortBy) {
        case 'priority': {
          const order = { high: 0, medium: 1, low: 2 };
          return sorted.sort((a, b) => order[a.priority] - order[b.priority]);
        }
        case 'deadline':
          return sorted.sort((a, b) => {
            if (a.deadline == null && b.deadline == null) return b.createdAt - a.createdAt;
            if (a.deadline == null) return 1;
            if (b.deadline == null) return -1;
            return a.deadline - b.deadline;
          });
        case 'date':
        default:
          return sorted.sort((a, b) => b.createdAt - a.createdAt);
      }
    },
    [sortBy]
  );

  const activeTodos = sortItems(items.filter((item) => !item.completed && !item.trashed));
  const completedTodos = sortItems(items.filter((item) => item.completed && !item.trashed));
  const deletedTodos = sortItems(items.filter((item) => item.trashed));

  return (
    <TodoContext.Provider
      value={{
        items,
        isLoading,
        addTodo,
        updateTodo,
        deleteTodo,
        permanentDeleteTodo,
        completeTodo,
        restoreTodo,
        restoreTodoFromTrash,
        activeTodos,
        completedTodos,
        deletedTodos,
        sortBy,
        setSortBy,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos(): TodoContextType {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}
