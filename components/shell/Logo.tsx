import Image from "next/image";
import Link from "next/link";

/**
 * The TopperShelf mark (mortarboard over a shelf of books) plus the name.
 * `onDark` is for permanently dark backgrounds such as the footer. Everywhere else the standard mark is used.
 */
export default function Logo({ small = false, onDark = false }: { small?: boolean; onDark?: boolean }) {
  const px = small ? 36 : 44;
  const size = small ? "size-9" : "size-11";
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="TopperShelf home">
      {onDark ? (
        <Image src="/logo-mark-light.png" alt="" width={px} height={px} className={`${size} shrink-0`} priority={small} />
      ) : (
        <Image src="/logo-mark.png" alt="" width={px} height={px} className={`${size} shrink-0`} priority={small} />
      )}
      <span className={`${small ? "text-lg" : "text-xl"} font-bold tracking-tight ${onDark ? "text-white" : "text-navy"}`}>
        Topper<span className={onDark ? "text-blue" : "text-blue-hover"}>Shelf</span>
      </span>
    </Link>
  );
}
