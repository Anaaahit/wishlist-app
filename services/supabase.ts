import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import * as Crypto from 'expo-crypto';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '@/constants/supabase';
import { WishlistItem, Priority } from '@/types/wishlist';

export { isSupabaseConfigured };

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export interface SharedWish {
  code: string;
  ownerEmail: string;
  title: string;
  price: number | null;
  currency: string;
  imageUri: string | null;
  link: string;
  notes: string;
  priority: Priority;
  categories: string[];
  createdAt: number;
}

interface WishRow {
  id: string;
  owner_id: string;
  title: string;
  price: number | null;
  currency: string;
  image_uri: string | null;
  link: string;
  notes: string;
  priority: Priority;
  categories: string[];
  saved_amount: number;
  completed: boolean;
  completed_at: number | null;
  created_at: number;
}

interface SharedWishRow {
  code: string;
  owner_email: string;
  title: string;
  price: number | null;
  currency: string;
  image_uri: string | null;
  link: string;
  notes: string;
  priority: Priority;
  categories: string[];
  created_at: number;
}

function toRow(item: WishlistItem, ownerId: string): WishRow {
  return {
    id: item.id,
    owner_id: ownerId,
    title: item.title,
    price: item.price,
    currency: item.currency,
    image_uri: item.imageUri,
    link: item.link,
    notes: item.notes,
    priority: item.priority,
    categories: item.categories,
    saved_amount: item.savedAmount,
    completed: item.completed,
    completed_at: item.completedAt,
    created_at: item.createdAt,
  };
}

function fromRow(row: WishRow): WishlistItem {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    currency: row.currency,
    imageUri: row.image_uri,
    link: row.link,
    notes: row.notes,
    priority: row.priority,
    categories: row.categories,
    savedAmount: row.saved_amount,
    completed: row.completed,
    completedAt: row.completed_at,
    trashed: false,
    createdAt: row.created_at,
  };
}

function mapSharedRow(row: SharedWishRow): SharedWish {
  return {
    code: row.code,
    ownerEmail: row.owner_email,
    title: row.title,
    price: row.price,
    currency: row.currency,
    imageUri: row.image_uri,
    link: row.link,
    notes: row.notes,
    priority: row.priority,
    categories: row.categories,
    createdAt: row.created_at,
  };
}

function requireClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('Set up Supabase first. Add your project URL and anon key in constants/supabase.ts');
  }
  return supabase;
}

export async function pushWishes(ownerId: string, items: WishlistItem[]): Promise<void> {
  if (!supabase || items.length === 0) return;
  const { error } = await supabase.from('wishes').upsert(
    items.map((item) => toRow(item, ownerId)),
    { onConflict: 'id' }
  );
  if (error) throw error;
}

export async function pullWishes(ownerId: string): Promise<WishlistItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .eq('owner_id', ownerId);
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function deleteServerWish(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('wishes').delete().eq('id', id);
  if (error) throw error;
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

async function generateCode(): Promise<string> {
  const bytes = Crypto.getRandomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

export async function createSharedWish(
  ownerId: string,
  ownerEmail: string,
  wish: WishlistItem
): Promise<string> {
  const client = requireClient();
  const imageUri = wish.imageUri && wish.imageUri.startsWith('http') ? wish.imageUri : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = await generateCode();
    const { error } = await client.from('shared_wishes').insert({
      code,
      owner_id: ownerId,
      owner_email: ownerEmail,
      wish_id: wish.id,
      title: wish.title,
      price: wish.price,
      currency: wish.currency,
      image_uri: imageUri,
      link: wish.link,
      notes: wish.notes,
      priority: wish.priority,
      categories: wish.categories,
    });
    if (error) {
      if (error.code === '23505') continue;
      throw error;
    }
    return code;
  }
  throw new Error('Could not create a share code. Please try again.');
}

export async function fetchSharedWishByCode(code: string): Promise<SharedWish | null> {
  const client = requireClient();
  const { data, error } = await client.rpc('get_shared_wish', { p_code: code });
  if (error) throw error;
  if (!data) return null;
  return mapSharedRow(data as SharedWishRow);
}

export async function listMySharedWishes(ownerId: string): Promise<SharedWish[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('shared_wishes')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSharedRow);
}

export async function deleteSharedWishByCode(code: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('shared_wishes').delete().eq('code', code);
  if (error) throw error;
}
