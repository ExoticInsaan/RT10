"use client";

import { useAuth } from "@/components/AuthProvider";

export default function HeaderAuth() {
  const { user, ready, openSignIn, signOut } = useAuth();

  if (ready && user) {
    return (
      <button
        type="button"
        onClick={signOut}
        className="rounded-full border border-slate-300 px-4 py-1.5 text-slate-700 hover:bg-slate-50"
      >
        Logout
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openSignIn}
      className="rounded-full bg-teal-600 px-4 py-1.5 text-white hover:bg-teal-700"
    >
      Login
    </button>
  );
}
