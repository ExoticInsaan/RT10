import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses Row Level Security.
// Use ONLY in server routes (checkout, webhook, signed file links).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
