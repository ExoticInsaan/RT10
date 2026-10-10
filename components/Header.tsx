import Link from "next/link";
import HeaderAuth from "@/components/HeaderAuth";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-teal-700">
          TopperShelf
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/browse" className="hover:text-teal-700">Browse</Link>
          <Link href="/library" className="hover:text-teal-700">My Library</Link>
          <HeaderAuth />
        </nav>
      </div>
    </header>
  );
}
