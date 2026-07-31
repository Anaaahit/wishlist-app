export const SUPABASE_URL = 'https://ounhrkimkhwlgggbsbkr.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bmhya2lta2h3bGdnZ2JzYmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzgwNDYsImV4cCI6MjEwMTA1NDA0Nn0.jhxq1sd_S3MoUn_56lqs87MzcIVeeWJQtb_BdQ1DTIw';

export const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_ANON_KEY.length > 20;
