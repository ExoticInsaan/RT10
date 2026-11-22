import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps people signed in.
 *
 * Without this, the login is renewed only by JavaScript in the browser, which then rewrites the login cookie itself.
 * Safari (every iPhone browser, and Instagram's in-app browser) limits cookies written that way to about 7 days, so a
 * student who comes back after a week is asked to sign in with Google again. Here the renewal happens on the server
 * instead, so the new cookie arrives as a normal Set-Cookie header and keeps its full lifetime.
 *
 * It does nothing for visitors who are not signed in, and no network call is made while the login is still valid.
 */
export async function proxy(request: NextRequest) {
  const hasLogin = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!hasLogin) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  try {
    // Renews the login only when the short-lived part has expired; otherwise it just reads the cookie.
    await supabase.auth.getSession();
  } catch {
    /* never block a page because the login could not be renewed right now */
  }
  return response;
}

export const config = {
  // Pages only: skip Next.js internals and anything with a file extension (images, fonts, sitemap, robots, ...).
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
