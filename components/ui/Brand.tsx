import Link from "next/link";
import cn from "@/lib/design/twStyles";

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={cn("brand")} aria-label="Toppershelf home">
      <span className={cn("brand-mark")}>
        <i />
        <i />
        <i />
      </span>
      <span className={cn(compact ? "brand-small" : "")}>
        Topper<span>shelf</span>
      </span>
    </Link>
  );
}
