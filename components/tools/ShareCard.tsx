import ToolIcon, { type ToolIconName } from "@/components/tools/ToolIcon";
import type { FunResult } from "@/lib/tools/fun";

/** The 9:16 result card shown on the share page (the downloadable PNG is drawn by app/share/[id]/image/route.tsx). */
export default function ShareCard({
  result,
  icon,
  miniature = false,
}: {
  result: FunResult;
  icon: ToolIconName;
  miniature?: boolean;
}) {
  return (
    <div
      className={`relative mx-auto aspect-[9/16] overflow-hidden rounded-3xl bg-share-gradient p-5 text-center text-navy shadow-float ${
        miniature ? "w-44" : "w-full max-w-sm"
      }`}
    >
      <div className="flex items-center justify-center gap-2 text-sm font-extrabold">
        <span className="grid size-7 place-items-center rounded-lg bg-navy text-white">
          <ToolIcon name="sparkles" size={14} />
        </span>
        TopperShelf
      </div>
      <div className="absolute inset-x-4 top-[20%]">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/60 text-coral shadow-sm">
          <ToolIcon name={icon} size={30} />
        </span>
        <p className="mb-1 mt-6 text-xs font-bold uppercase tracking-widest text-purple-700">{result.kicker}</p>
        {result.subject && (
          <p className={`mx-auto mb-1 truncate font-semibold text-slate-600 ${miniature ? "max-w-32 text-[0.6rem]" : "max-w-64 text-sm"}`}>
            {result.subject}
          </p>
        )}
        <strong className={`block font-extrabold tracking-tight ${miniature ? "text-4xl" : "text-6xl"}`}>{result.big}</strong>
        <h2 className={`m-0 mt-1 font-extrabold ${miniature ? "text-lg" : "text-3xl"}`}>{result.title}</h2>
        <p className={`mx-auto mt-2 leading-5 text-slate-700 ${miniature ? "text-[0.6rem]" : "max-w-64 text-sm"}`}>
          {result.message}
        </p>
      </div>
      <div className="absolute inset-x-5 bottom-5 border-t border-navy/10 pt-3 text-[0.6rem] font-bold uppercase tracking-widest">
        Try yours at toppershelf.online
      </div>
    </div>
  );
}
