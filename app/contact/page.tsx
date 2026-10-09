import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Contact</h1>
      <div className="mt-4 space-y-3 text-slate-700">
        <p>Add your support email, for example support@toppershelf.online.</p>
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Draft placeholder. Replace this with your final text before applying for payment gateway approval.
        </p>
      </div>
    </div>
  );
}
