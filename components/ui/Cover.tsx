import cn from "@/lib/design/twStyles";

export default function Cover({
  title,
  heading,
  accent,
  coverLine,
  small = false,
}: {
  title: string;
  heading: string;
  accent: string;
  coverLine: string;
  small?: boolean;
}) {
  // On the small covers a long word does not fit across the cover, so make the text a little
  // smaller instead of letting the word break in the middle.
  const longest = Math.max(...heading.split(/[\s&]+/).map((w) => w.length), 0);
  const smallSize = small ? (longest >= 11 ? "!text-[7px]" : longest >= 7 ? "!text-[9px]" : "") : "";
  return (
    <div
      className={cn(`cover cover-${accent} ${small ? "cover-small" : ""}`)}
      role="img"
      aria-label={`${title} book cover`}
    >
      <div className={cn("cover-kicker")}>Toppershelf nursing series</div>
      <strong className={`line-clamp-3 ${smallSize}`}>{heading.replace(" & ", "\n& ")}</strong>
      <div className={cn("cover-art")}>
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <small>{coverLine}</small>
    </div>
  );
}
