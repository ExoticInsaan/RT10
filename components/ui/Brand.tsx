import Image from "next/image";
import Link from "next/link";
import cn from "@/lib/design/twStyles";

export default function Brand({ compact = false, tile = false }: { compact?: boolean; tile?: boolean }) {
  return (
    <Link href="/" className={cn("brand")} aria-label="Toppershelf home">
      <span
        className={
          tile
            ? "inline-flex items-center justify-center rounded-lg bg-white p-1.5"
            : "inline-flex items-center"
        }
      >
        <Image
          src="/logo-icon.png"
          alt=""
          width={156}
          height={160}
          priority
          className={tile ? "h-7 w-auto" : "h-8 w-auto max-[900px]:h-7 max-[560px]:h-6"}
        />
      </span>
      <span className={cn(compact ? "brand-small" : "")}>
        Topper<span>shelf</span>
      </span>
    </Link>
  );
}
