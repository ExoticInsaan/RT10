import { createClient as create, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Same shape as the website's browser client (lib/supabase/client.ts). One shared client; the session is kept on the device. */
export function createClient(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) throw new Error("Supabase keys are not set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).");
  client = create(url, key, { auth: { flowType: "pkce", detectSessionInUrl: false, persistSession: true, autoRefreshToken: true } });
  return client;
}
