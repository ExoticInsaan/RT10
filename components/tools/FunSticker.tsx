import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/tools/ui";
import type { Tool } from "@/lib/tools/registry";

/** A Fun Zone tool as a die-cut sticker: white border, a slight tilt that straightens when pointed at. */
export default function FunSticker({ tool, tilt = 0 }: { tool: Tool; tilt?: number }) {
  const style = { "--tilt": `${tilt}deg` } as CSSProperties;
  const picture = tool.image && (
    <Image
      src={tool.image}
      alt=""
      fill
      sizes="(min-width: 1024px) 13rem, (min-width: 768px) 30vw, 45vw"
      className="scale-[1.04] object-cover"
    />
  );

  return (
    <article className="fun-sticker group relative flex flex-col rounded-[1.75rem] bg-white p-2.5 sm:p-3" style={style}>
      <Link
        href={`/tool/${tool.id}`}
        className="flex flex-1 flex-col rounded-[1.4rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <div className="relative aspect-square overflow-hidden rounded-[1.25rem]" style={{ backgroundColor: tool.imageBg }}>
          {picture}
        </div>
        <div className="flex flex-1 flex-col items-start px-1.5 pb-1.5 pt-3 sm:px-2 sm:pb-2">
          <h3 className="m-0 text-[0.95rem] font-extrabold leading-5 tracking-tight text-navy sm:text-lg sm:leading-6">
            {tool.name}
          </h3>
          <span className="h-3 sm:hidden" aria-hidden="true" />
          <p className="m-0 mb-3 mt-1 hidden text-sm leading-6 text-muted sm:block">{tool.description}</p>
          <span className="mt-auto inline-flex min-h-9 items-center rounded-full bg-navy px-4 text-sm font-bold text-white transition-colors group-hover:bg-purple-600">
            Play now
          </span>
        </div>
      </Link>
      <FavoriteButton id={tool.id} className="absolute right-4 top-4 scale-90 bg-white/95 shadow-sm sm:right-5 sm:top-5 sm:scale-100" />
    </article>
  );
}
