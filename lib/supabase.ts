import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // This will surface in development to ensure ENV is configured
  console.warn('Missing Supabase ENV. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Tables = {
  items: {
    id: string;
    user_id: string;
    url: string;
    platform: string | null;
    title: string | null;
    caption: string | null;
    author: string | null;
    thumbnail_url: string | null;
    created_at: string;
    updated_at: string;
    is_done: boolean;
  };
  item_tags: {
    item_id: string;
    tag:
      | 'Inbox'
      | 'Food'
      | 'Travel'
      | 'Tech'
      | 'Fitness'
      | 'Home'
      | 'Style'
      | 'Finance'
      | 'Learning'
      | 'Events'
      | 'DIY'
      | 'Beauty'
      | 'Health'
      | 'Parenting'
      | 'Pets'
      | 'Other';
    confidence: number | null;
  };
  notes: {
    item_id: string;
    body: string | null;
    updated_at: string;
  };
};

export const TAGS: Tables['item_tags']['tag'][] = [
  'Inbox',
  'Food',
  'Travel',
  'Tech',
  'Fitness',
  'Home',
  'Style',
  'Finance',
  'Learning',
  'Events',
  'DIY',
  'Beauty',
  'Health',
  'Parenting',
  'Pets',
  'Other',
];
