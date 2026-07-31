export const SUPABASE_URL = 'https://ounhrkimkhwlgggbsbkr.supabase.co/rest/v1/';
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' &&
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
