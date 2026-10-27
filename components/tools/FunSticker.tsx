import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/tools/ui";
import type { Tool } from "@/lib/tools/registry";

/**
 * A Fun Zone tool as a die-cut sticker: white border, a slight tilt that straightens when pointed at.
 * `big` is the playable layout (picture on top, Play button); otherwise a compact row for tools still to come.
 */
export default function FunSticker({ tool, tilt = 0, big = false }: { tool: Tool; tilt?: number; big?: boolean }) {
  const style = { "--tilt": `${tilt}deg` } as CSSProperties;
  const picture = tool.image && (
    <Image
      src={tool.image}
      alt=""
      fill
      sizes={big ? "(min-width: 1024px) 16rem, 45vw" : "6rem"}
      className="scale-[1.04] object-cover"
    />
  );

  if (big) {
    return (
      <article className="fun-sticker group relative rounded-[1.75rem] bg-white p-2.5 sm:p-3" style={style}>
        <Link
          href={`/tool/${tool.id}`}
          className="block rounded-[1.4rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <div className="relative aspect-square overflow-hidden rounded-[1.25rem]" style={{ backgroundColor: tool.imageBg }}>
            {picture}
          </div>
          <div className="px-1.5 pb-1.5 pt-3 sm:px-2 sm:pb-2">
            <h3 className="m-0 text-[0.95rem] font-extrabold leading-5 tracking-tight text-navy sm:text-lg sm:leading-6">{tool.name}</h3>
            <p className="m-0 mt-1 hidden text-sm leading-6 text-muted sm:block">{tool.description}</p>
            <span className="mt-3 inline-flex min-h-9 items-center rounded-full bg-navy px-4 text-sm font-bold text-white transition-colors group-hover:bg-purple-600">
              Play now
            </span>
          </div>
        </Link>
        <FavoriteButton id={tool.id} className="absolute right-4 top-4 scale-90 bg-white/95 shadow-sm sm:right-5 sm:top-5 sm:scale-100" />
      </article>
    );
  }

  return (
    <article className="fun-sticker group relative rounded-3xl bg-white p-2.5" style={style}>
      <Link
        href={`/tool/${tool.id}`}
        className="flex items-center gap-3 rounded-[1.25rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:gap-4"
      >
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl sm:size-24" style={{ backgroundColor: tool.imageBg }}>
          {picture}
        </div>
        <div className="min-w-0 py-1 pr-2">
          <p className="m-0 text-[0.7rem] font-bold text-purple-600">Coming soon</p>
          <h3 className="m-0 mt-0.5 text-base font-extrabold leading-5 tracking-tight text-navy">{tool.name}</h3>
          <p className="m-0 mt-1 text-[0.8rem] leading-5 text-muted sm:text-sm">{tool.description}</p>
        </div>
      </Link>
    </article>
  );
}
