import type { ReactNode } from "react";

export const SUPPORT_EMAIL = "support@toppershelf.online";
export const BUSINESS = "TopperShelf";
export const ADDRESS = "Bharatpur, Rajasthan, India";
export const GRIEVANCE_NAME = "Jatin Sinsinwar";
export const LEGAL_EFFECTIVE = "27 October 2026";

/** Shared layout for the Privacy Policy and Terms of Use. */
export function LegalPage({ title, effective, children }: { title: string; effective: string; children: ReactNode }) {
  return (
    <div className="container-app max-w-3xl pb-20 pt-10">
      <span className="eyebrow">Legal</span>
      <h1 className="mb-1 mt-4 text-3xl font-extrabold tracking-tight text-navy dark:text-white sm:text-4xl">{title}</h1>
      <p className="m-0 text-sm text-muted dark:text-slate-400">Effective date: {effective}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mb-0 mt-9 text-lg font-bold text-navy dark:text-white">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-0 mt-2 leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mb-0 mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-slate-700 dark:text-slate-300">{children}</ul>;
}
