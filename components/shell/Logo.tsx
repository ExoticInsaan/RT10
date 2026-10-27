import Link from "next/link";

export default function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="TopperShelf home">
      <span
        className={`${small ? "size-8" : "size-10"} relative grid shrink-0 place-items-center rounded-xl bg-navy text-white shadow-sm`}
      >
        <span className="absolute -top-0.5 h-2 w-7 -rotate-6 rounded-sm bg-navy dark:bg-blue" />
        <span className="mt-1 grid gap-0.5">
          <i className="h-1 w-4 rounded-full bg-blue" />
          <i className="h-1 w-4 rounded-full bg-violet" />
          <i className="h-1 w-4 rounded-full bg-teal" />
        </span>
      </span>
      <span className={`${small ? "text-lg" : "text-xl"} font-bold tracking-tight text-navy dark:text-white`}>
        Topper<span className="text-blue-hover dark:text-blue">Shelf</span>
      </span>
    </Link>
  );
}
