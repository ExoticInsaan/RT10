import Image from "next/image";
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
        <Image src="/logo-mark.png" alt="" width={28} height={28} className="size-7" />
        TopperShelf
      </div>
      <div className={`absolute inset-x-4 ${miniature ? "top-[15%]" : "top-[20%]"}`}>
        <span
          className={`mx-auto grid place-items-center rounded-2xl bg-white/60 text-coral shadow-sm ${miniature ? "size-11" : "size-16"}`}
        >
          <ToolIcon name={icon} size={miniature ? 22 : 30} />
        </span>
        <p className={`mb-1 font-bold uppercase tracking-widest text-purple-700 ${miniature ? "mt-3 text-[0.6rem]" : "mt-6 text-xs"}`}>
          {result.kicker}
        </p>
        {result.subject && (
          <p className={`mx-auto mb-1 truncate font-semibold text-slate-600 ${miniature ? "max-w-32 text-[0.6rem]" : "max-w-64 text-sm"}`}>
            {result.subject}
          </p>
        )}
        <strong className={`block font-extrabold tracking-tight ${miniature ? "text-3xl" : "text-6xl"}`}>{result.big}</strong>
        <h2 className={`m-0 mt-1 font-extrabold ${miniature ? "text-base leading-5" : "text-3xl"}`}>{result.title}</h2>
        <p className={`mx-auto mt-2 text-slate-700 ${miniature ? "text-[0.6rem] leading-4" : "max-w-64 text-sm leading-5"}`}>
          {result.message}
        </p>
      </div>
      <div
        className={`absolute border-t border-navy/10 font-bold uppercase tracking-widest ${
          miniature ? "inset-x-4 bottom-3 pt-2 text-[0.5rem]" : "inset-x-5 bottom-5 pt-3 text-[0.6rem]"
        }`}
      >
        Try yours at toppershelf.online
      </div>
    </div>
  );
}
