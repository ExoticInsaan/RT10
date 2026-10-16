import { createClient } from "@supabase/supabase-js";

// Cookie-free client for public reads (published products). It uses the anon key, so Row Level
// Security still applies: it can only see published rows. Safe to use inside cached server code.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
