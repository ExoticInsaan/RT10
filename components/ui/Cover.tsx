import cn from "@/lib/design/twStyles";

export default function Cover({
  title,
  heading,
  accent,
  coverLine,
  image = null,
  small = false,
  large = false,
}: {
  title: string;
  heading: string;
  accent: string;
  coverLine: string;
  image?: string | null;
  small?: boolean;
  large?: boolean; // product page: let the real page grow taller
}) {
  // On the small covers a long word does not fit across the cover, so make the text a little
  // smaller instead of letting the word break in the middle.
  const longest = Math.max(...heading.split(/[\s&]+/).map((w) => w.length), 0);
  const smallSize = small ? (longest >= 11 ? "!text-[7px]" : longest >= 7 ? "!text-[9px]" : "") : "";
  // The real first page of the PDF. It is scaled down to fit the frame, never cropped, so the
  // whole page is visible (pages that are not the frame's shape get white bars).
  if (image) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-[3px] bg-white [aspect-ratio:3_/_4] ${large ? "[max-height:560px]" : "[max-height:300px]"} shadow-[0_8px_15px_rgba(16,42,76,0.14)] ring-1 ring-[#102a4c]/15 max-[560px]:[max-height:none]`}
        role="img"
        aria-label={`${title} front page`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain"
        />
      </div>
    );
  }
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
