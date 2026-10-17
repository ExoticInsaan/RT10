import type { ReactNode } from "react";
import cn from "@/lib/design/twStyles";
import SectionLabel from "@/components/ui/SectionLabel";

/** Full-page message used by the 404 and error pages. Same look as the empty states. */
export default function StatusPage({
  label,
  title,
  children,
  actions,
}: {
  label: string;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={`${cn("container")} py-12 max-[560px]:py-8`}>
      <section className={cn("empty")}>
        <div className={cn("empty-art")}>
          <span className={cn("paper")}>
            <i />
            <i />
            <i />
          </span>
          <span className={cn("glass")}>
            <b />
          </span>
        </div>
        <SectionLabel variant="content">{label}</SectionLabel>
        <h1 className="font-display m-0 mb-3 text-[clamp(27px,3.2vw,40px)] font-normal leading-[1.12] text-navy">
          {title}
        </h1>
        {children && <div className="m-0 mb-6 max-w-md text-[15px] leading-relaxed text-muted">{children}</div>}
        {actions && <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>}
      </section>
    </div>
  );
}
