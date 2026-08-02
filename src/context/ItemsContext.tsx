import { createContext, useCallback, useContext, useEffect, useState, type FC, type ReactNode } from 'react';
import type { Item, Activity } from '../data/mockData';

interface NewItemInput {
  name: string;
  category: string;
  priority: string;
  quantity: number;
  plannedPrice: number;
  store: string;
  link: string;
  notes: string;
  isWishlist: boolean;
  image?: string;
  description?: string;
}

interface ItemsContextValue {
  items: Item[];
  activities: Activity[];
  loading: boolean;
  addItem: (input: NewItemInput) => Promise<Item | null>;
  toggleFavorite: (id: string) => Promise<void>;
  setStatus: (id: string, status: string) => Promise<void>;
  moveToShoppingList: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ItemsContext = createContext<ItemsContextValue | null>(null);

async function api<T>(url: string, options?: RequestInit): Promise<{ ok: boolean; data: T & { error?: string } }> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  return { ok: res.ok, data };
}

export const ItemsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [itemsRes, activitiesRes] = await Promise.all([
      api<{ items: Item[] }>('/api/items'),
      api<{ activities: Activity[] }>('/api/activities'),
    ]);
    if (itemsRes.ok) setItems(itemsRes.data.items ?? []);
    if (activitiesRes.ok) setActivities(activitiesRes.data.activities ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // No websocket/polling backend — refetch on focus so a change your
    // partner made on their device shows up without a manual reload.
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refresh]);

  const addItem = useCallback(async (input: NewItemInput) => {
    const { ok, data } = await api<{ item: Item }>('/api/items/create', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (!ok) return null;
    await refresh();
    return data.item;
  }, [refresh]);

  const toggleFavorite = useCallback(async (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isFavorite: !i.isFavorite } : i));
    await api('/api/items/toggle-favorite', { method: 'POST', body: JSON.stringify({ id }) });
    await refresh();
  }, [refresh]);

  const setStatus = useCallback(async (id: string, status: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: status as Item['status'] } : i));
    await api('/api/items/set-status', { method: 'POST', body: JSON.stringify({ id, status }) });
    await refresh();
  }, [refresh]);

  const moveToShoppingList = useCallback(async (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isWishlist: false } : i));
    await api('/api/items/move-to-list', { method: 'POST', body: JSON.stringify({ id }) });
    await refresh();
  }, [refresh]);

  const deleteItem = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await api('/api/items/delete', { method: 'POST', body: JSON.stringify({ id }) });
    await refresh();
  }, [refresh]);

  return (
    <ItemsContext.Provider value={{ items, activities, loading, addItem, toggleFavorite, setStatus, moveToShoppingList, deleteItem, refresh }}>
      {children}
    </ItemsContext.Provider>
  );
};

export function useItems(): ItemsContextValue {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error('useItems must be used within ItemsProvider');
  return ctx;
}
