import type { ReactNode } from "react";

/** Full-page message used by the 404 and error pages. */
export default function StatusPage({
  label,
  title,
  children,
  actions,
}: {
  label: string;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="container-app py-16 sm:py-24">
      <section className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-8 text-center shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-12">
        <span className="eyebrow">{label}</span>
        <h1 className="mb-3 mt-5 text-3xl font-extrabold tracking-tight text-navy dark:text-white sm:text-4xl">{title}</h1>
        {children && <div className="mb-7 text-[15px] leading-relaxed text-muted dark:text-slate-400">{children}</div>}
        {actions && <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>}
      </section>
    </div>
  );
}
