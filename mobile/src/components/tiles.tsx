import type { ReactNode } from "react";
import { HeartIcon } from "./icons";
import type { Tool } from "@/lib/tools/registry";
import { FAVOURITES_KEY } from "@/components/tools/ui";
import { useStoredList } from "@/lib/tools/useStoredList";

/** Registry image paths start with "/"; the app serves them from its own bundle, relative to the page. */
export const asset = (p: string) => "." + p;

/** Square tool picture. "contain" artwork sits padded on white; "cover" artwork fills its tile. */
export function Thumb({ tool, className = "", pad = 14 }: { tool: Tool; className?: string; pad?: number }) {
  const contain = tool.imageFit === "contain";
  return (
    <div
      className={`overflow-hidden ${className} ${contain ? "shadow-[0_0_0_1px_#e8e4dd]" : ""}`}
      style={{ background: tool.imageBg ?? "#ffffff" }}
    >
      {tool.image && (
        <img
          src={asset(tool.image)}
          alt=""
          className={`block size-full ${contain ? "box-border object-contain" : "object-cover"}`}
          style={contain ? { padding: pad } : undefined}
        />
      )}
    </div>
  );
}

/** Home / My Shelf carousel tile: big picture and a name. */
export function ShelfTile({ tool }: { tool: Tool }) {
  const contain = tool.imageFit === "contain";
  return (
    <a href={"#/tool/" + tool.id} className="flex w-[156px] shrink-0 flex-col gap-2.5">
      <Thumb tool={tool} className={`size-[156px] rounded-[22px] ${contain ? "shadow-[0_0_0_1px_#e8e4dd,0_10px_24px_-14px_rgba(16,42,76,.4)]" : "shadow-[0_10px_24px_-14px_rgba(16,42,76,.4)]"}`} />
      <div className="px-0.5 text-[15px] font-bold">{shortName(tool)}</div>
    </a>
  );
}

/** The design shortens one long name on tiles. */
export const shortName = (tool: Tool) => (tool.id === "cgpa-calculator" ? "CGPA & Percentage" : tool.name);

/** Tilted white sticker card used for Fun Zone games. */
export function Sticker({
  tool,
  tilt,
  size = "lg",
  play = false,
  className = "",
}: {
  tool: Tool;
  tilt: number;
  size?: "sm" | "lg";
  play?: boolean;
  className?: string;
}) {
  const lg = size === "lg";
  return (
    <a
      href={"#/tool/" + tool.id}
      style={{ rotate: `${tilt}deg` }}
      className={`flex flex-col bg-white shadow-[0_22px_44px_-18px_rgb(60_8_40/55%)] ${lg ? "rounded-[26px] p-[9px]" : "rounded-3xl p-2"} ${className}`}
    >
      <div className={`aspect-square overflow-hidden ${lg ? "rounded-[19px]" : "rounded-[17px]"}`} style={{ background: tool.imageBg }}>
        {tool.image && <img src={asset(tool.image)} alt="" className="block size-full scale-[1.04] object-cover" />}
      </div>
      <div className={`font-extrabold leading-tight text-navy ${lg ? "px-1 pt-[11px] pb-[3px] text-[15px] tracking-[-0.01em]" : "px-[3px] pt-[9px] pb-1 text-sm"}`}>{tool.name}</div>
      {play && <div className="mt-2.5 mb-0.5 ml-1 flex min-h-9 items-center self-start rounded-full bg-navy px-4 text-sm font-bold text-white">Play now</div>}
    </a>
  );
}

/** Row on The Shelf: picture, name, one line, and a heart to keep it on My Shelf. */
export function ToolRow({ tool }: { tool: Tool }) {
  const [favs, setFavs] = useStoredList(FAVOURITES_KEY);
  const on = favs.includes(tool.id);
  return (
    <div className="flex items-center gap-3.5 rounded-3xl border border-[#e8e4dd] bg-white py-2.5 pr-1.5 pl-2.5">
      <a href={"#/tool/" + tool.id} className="flex min-w-0 flex-1 items-center gap-3.5">
        <Thumb tool={tool} pad={8} className="size-[76px] shrink-0 rounded-[18px]" />
        <div className="min-w-0 flex-1">
          <div className="text-base leading-tight font-bold">{tool.name}</div>
          <div className="mt-[3px] text-[13px] leading-[1.4] text-[#5b6675]">{tool.description}</div>
        </div>
      </a>
      <button
        type="button"
        aria-label={`${on ? "Remove" : "Add"} ${tool.name} ${on ? "from" : "to"} favourites`}
        aria-pressed={on}
        onClick={() => setFavs((cur) => (cur.includes(tool.id) ? cur.filter((x) => x !== tool.id) : [tool.id, ...cur]))}
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent ${on ? "text-rose-500" : "text-[#5b6675]"}`}
      >
        <HeartIcon size={22} filled={on} />
      </button>
    </div>
  );
}

export function Chip({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a href={href} className="flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-bold whitespace-nowrap">
      {children}
    </a>
  );
}
