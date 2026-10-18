"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import Button from "@/components/ui/Button";
import { firstName } from "@/lib/profile";

export default function HeaderAuth() {
  const { user, ready, profile, openSignIn, signOut } = useAuth();

  if (ready && user) {
    const name = firstName(profile?.name);
    return (
      <>
        {name && (
          <Link
            href="/welcome?edit=1"
            title="Change your name"
            className="hidden max-w-[11rem] items-center truncate rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-navy hover:bg-surface md:inline-flex"
          >
            Hi, {name}
          </Link>
        )}
        <Button variant="secondary" onClick={signOut}>
          Logout
        </Button>
      </>
    );
  }
  return <Button onClick={openSignIn}>Login</Button>;
}
