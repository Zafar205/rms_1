const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLL_KEY;

export function getSupabaseUrl() {
  return supabaseUrl;
}

export function getSupabaseAnonKey() {
  return supabaseAnonKey;
}

export function getSupabaseServiceRoleKey() {
  return supabaseServiceRoleKey;
}

export function hasSupabaseAuthConfiguration() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function hasSupabaseConfiguration() {
  return Boolean(supabaseUrl && (supabaseServiceRoleKey ?? supabaseAnonKey));
}
