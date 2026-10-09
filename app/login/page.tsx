import type { Metadata } from "next";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="mt-1 text-sm text-slate-600">Sign in to see what you have bought.</p>
      <button
        disabled
        className="mt-6 w-full rounded-full border border-slate-300 bg-white px-4 py-3 font-medium text-slate-800 opacity-60"
      >
        Continue with Google
      </button>
      <p className="mt-3 text-xs text-slate-500">Google sign-in is connected in the Supabase step.</p>
    </div>
  );
}
