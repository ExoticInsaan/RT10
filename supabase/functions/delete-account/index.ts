// Supabase Edge Function: lets a signed-in person delete their own TopperShelf account (Google Play requires this).
// Deploy once:  supabase functions deploy delete-account --project-ref <your TopperShelf project ref>
// It keeps "Verify JWT" on, so only a signed-in person can call it, and it only ever deletes the caller's own account.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  // Who is asking? Read the user from their own token, never from the request body.
  const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await asUser.auth.getUser();
  if (error || !data.user) return json({ error: "Not signed in." }, 401);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const id = data.user.id;

  // Saved tool data (also removed by the cascade on auth.users, deleted first to be explicit).
  const wipe = await admin.from("user_tool_data").delete().eq("user_id", id);
  if (wipe.error) return json({ error: "Could not remove saved data." }, 500);

  const gone = await admin.auth.admin.deleteUser(id);
  if (gone.error) return json({ error: "Could not delete the account." }, 500);

  return json({ ok: true });
});
