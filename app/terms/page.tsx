import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Terms of Use</h1>
      <div className="mt-4 space-y-3 text-slate-700">
        <p>Explain that purchased material is for the buyer&apos;s personal study only and must not be shared or resold.</p>
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Draft placeholder. Replace this with your final text before applying for payment gateway approval.
        </p>
      </div>
    </div>
  );
}
