// Helpers for the student's display name.

export const NAME_MIN = 2;
export const NAME_MAX = 40;

/** Tidy what the student typed: no control characters, single spaces, trimmed. */
export function cleanName(raw: string): string {
  return raw.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
}

/** Returns a friendly error message, or null when the name is fine. */
export function checkName(raw: string): string | null {
  const name = cleanName(raw);
  if (name.length < NAME_MIN) return "Please enter at least 2 characters.";
  if (name.length > NAME_MAX) return `Please keep your name under ${NAME_MAX + 1} characters.`;
  if (/(https?:|www\.|\.com\b|\.in\b|\.online\b|@)/i.test(name)) return "Please enter a name, not a link or email.";
  if (/[<>{}\[\]\\\/|=;`~^*_#$%]/.test(name)) return "Please use letters, numbers and spaces only.";
  if (!/\p{L}/u.test(name)) return "Please include at least one letter.";
  return null;
}

/** "priya sharma" -> "Priya" (used in greetings). Works for any script. */
export function firstName(name: string | null | undefined): string {
  const first = cleanName(name ?? "").split(" ")[0] ?? "";
  return first;
}

/** Only allow paths inside this site, so a link cannot send someone to another website. */
export function safeNext(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value === "/welcome" || value.startsWith("/welcome?")) return fallback;
  return value;
}

/** Name Google gave us, if any (never guessed from an email address). */
export function googleName(meta: Record<string, unknown> | undefined): string {
  const v = meta?.full_name ?? meta?.name;
  return typeof v === "string" ? cleanName(v).slice(0, NAME_MAX) : "";
}
