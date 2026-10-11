import cn from "@/lib/design/twStyles";

export default function Cover({
  title,
  subject,
  accent,
  coverLine,
  small = false,
}: {
  title: string;
  subject: string;
  accent: string;
  coverLine: string;
  small?: boolean;
}) {
  return (
    <div
      className={cn(`cover cover-${accent} ${small ? "cover-small" : ""}`)}
      role="img"
      aria-label={`${title} book cover`}
    >
      <div className={cn("cover-kicker")}>Toppershelf nursing series</div>
      <strong>{subject.replace(" & ", "\n& ")}</strong>
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
