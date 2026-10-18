"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// Pages that are never interrupted by the welcome screen.
const NO_WELCOME_PREFIXES = ["/welcome", "/privacy", "/terms", "/refund", "/contact", "/auth", "/login", "/admin"];

/** After a student's first sign-in, send them to /welcome to choose a name (once). Renders nothing. */
export default function WelcomeGate() {
  const { profile, profileReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!profileReady || !profile || profile.welcomedAt) return;
    if (NO_WELCOME_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;
    const here = `${pathname}${window.location.search}`;
    router.replace(`/welcome?next=${encodeURIComponent(here)}`);
  }, [profileReady, profile, pathname, router]);

  return null;
}
