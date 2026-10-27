import Image from "next/image";
import Link from "next/link";
import { tools } from "@/lib/tools/registry";

/**
 * A "view all" tile for a row of three ShelfItems: the TopperShelf owl peeks up and points to the full shelf.
 * Only shown below the lg breakpoint, where rows have two columns and this fills the empty fourth slot.
 */
export default function ShelfViewAll({ text = "QR codes, flashcards, reminders and more." }: { text?: string }) {
  const count = tools.filter((tool) => tool.category === "The Shelf").length;
  return (
    <Link
      href="/the-shelf"
      className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-hover lg:hidden"
    >
      <div className="shelf-object relative mx-2 flex aspect-[4/3] flex-col items-center justify-end overflow-hidden rounded-t-2xl rounded-b-md border-2 border-dashed border-blue/50 bg-blue-soft">
        <span className="relative mb-2 rounded-2xl bg-white px-3 py-1.5 text-xs font-extrabold text-blue-hover shadow-sm transition-colors group-hover:bg-blue-hover group-hover:text-white sm:text-sm">
          View all {count}
          <span className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-inherit" aria-hidden="true" />
        </span>
        <Image src="/mascot/owl-peek.webp" alt="" width={360} height={282} className="h-auto w-[52%]" />
      </div>
      <div className="shelf-plank" aria-hidden="true" />
      <div className="px-1 pt-3 sm:px-2 sm:pt-4">
        <h3 className="m-0 text-sm font-bold leading-5 tracking-tight text-navy sm:text-base">More on The Shelf</h3>
        <p className="m-0 mt-1 text-[0.8rem] leading-5 text-muted sm:text-sm sm:leading-6">{text}</p>
      </div>
    </Link>
  );
}
