import type { ReactNode } from "react";
import cn from "@/lib/design/twStyles";
import Icon from "@/components/ui/Icon";

export default function SectionLabel({
  children,
  variant = "content",
  number,
}: {
  children: ReactNode;
  variant?: "hero" | "content" | "editorial";
  number?: string;
}) {
  return (
    <p className={cn(`section-label label-${variant}`)}>
      {variant === "hero" && <Icon name="sparkle" size={14} />}
      {variant === "content" && <span className={cn("label-marker")} />}
      {variant === "editorial" && <span className={cn("label-number")}>{number || "01"} /</span>}
      <span>{children}</span>
    </p>
  );
}
