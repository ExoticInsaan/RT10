import Image from "next/image";
import Link from "next/link";

/**
 * The TopperShelf mark (mortarboard over a shelf of books) plus the name.
 * `onDark` is for permanently dark backgrounds such as the footer. Everywhere else the light-mode and
 * dark-mode versions of the mark are swapped by the "dark" class on <html>.
 */
export default function Logo({ small = false, onDark = false }: { small?: boolean; onDark?: boolean }) {
  const px = small ? 36 : 44;
  const size = small ? "size-9" : "size-11";
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="TopperShelf home">
      {onDark ? (
        <Image src="/logo-mark-light.png" alt="" width={px} height={px} className={`${size} shrink-0`} priority={small} />
      ) : (
        <>
          <Image src="/logo-mark.png" alt="" width={px} height={px} className={`${size} shrink-0 dark:hidden`} priority={small} />
          <Image src="/logo-mark-light.png" alt="" width={px} height={px} className={`${size} hidden shrink-0 dark:block`} priority={small} />
        </>
      )}
      <span className={`${small ? "text-lg" : "text-xl"} font-bold tracking-tight ${onDark ? "text-white" : "text-navy dark:text-white"}`}>
        Topper<span className={onDark ? "text-blue" : "text-blue-hover dark:text-blue"}>Shelf</span>
      </span>
    </Link>
  );
}
