import Image from "next/image";
import Link from "next/link";
import ToolIcon from "@/components/tools/ToolIcon";
import { toneClasses } from "@/components/tools/toneStyles";
import { FavoriteButton } from "@/components/tools/ui";
import type { Tool } from "@/lib/tools/registry";

/**
 * One tool as an object standing on The Shelf: its picture sits on a wooden plank and the name and description
 * read like the label on the shelf's edge. Planks reach half a grid gap past each side, so neighbours in a row
 * join into one continuous shelf at every screen width (the grid using this must have a 1.5rem column gap).
 */
export default function ShelfItem({ tool, priority = false }: { tool: Tool; priority?: boolean }) {
  return (
    <article className="group relative">
      <Link
        href={`/tool/${tool.id}`}
        className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-hover"
      >
        <div
          className={`shelf-object relative mx-2 aspect-[4/3] overflow-hidden rounded-t-2xl rounded-b-md ${
            tool.image ? "" : toneClasses[tool.tone] ?? toneClasses.blue
          } ${tool.imageBg === "#ffffff" || tool.imageBg === "#f8f8f8" ? "ring-1 ring-inset ring-line/70" : ""}`}
          style={tool.image ? { backgroundColor: tool.imageBg } : undefined}
        >
          {tool.image ? (
            <Image
              src={tool.image}
              alt=""
              fill
              priority={priority}
              sizes="(min-width: 1024px) 22rem, 45vw"
              className={tool.imageFit === "cover" ? "object-cover" : "object-contain p-3 sm:p-6"}
            />
          ) : (
            <span className="grid h-full place-items-center">
              <ToolIcon name={tool.icon} size={56} />
            </span>
          )}
          {!tool.ready && (
            <span className="absolute left-3 top-3 hidden rounded-full bg-white/95 px-2.5 py-1 text-[0.7rem] font-semibold text-navy shadow-sm sm:inline">
              Coming soon
            </span>
          )}
        </div>
        <div className="shelf-plank" aria-hidden="true" />
        <div className="px-1 pt-3 sm:px-2 sm:pt-4">
          {!tool.ready && <p className="m-0 mb-0.5 text-[0.7rem] font-semibold text-blue-hover sm:hidden">Coming soon</p>}
          <h3 className="m-0 text-sm font-bold leading-5 tracking-tight text-navy sm:text-base transition-colors group-hover:text-blue-hover">
            {tool.name}
          </h3>
          <p className="m-0 mt-1 text-[0.8rem] leading-5 text-muted sm:text-sm sm:leading-6">{tool.description}</p>
        </div>
      </Link>
      <FavoriteButton id={tool.id} className="absolute right-3 top-1 scale-90 bg-white/95 shadow-sm sm:right-4 sm:top-2 sm:scale-100" />
    </article>
  );
}
