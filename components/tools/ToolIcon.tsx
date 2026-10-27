// Icon set for the tools experience

const iconPaths = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  file: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v5h5M9 13h6M9 17h5" />
    </>
  ),
  fileText: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v5h5M9 12h6M9 16h6" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m4 17 5-5 4 4 2-2 5 5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 22c1-5 3.7-7 8-7s7 2 8 7" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M8 6h8v4H8zM8 14h1M12 14h1M16 14h1M8 18h1M12 18h1M16 18h1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
    </>
  ),
  graduation: (
    <>
      <path d="m2 9 10-5 10 5-10 5zM6 11v5c3 3 9 3 12 0v-5M22 9v7" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  flame: (
    <path d="M12 22c5 0 8-3 8-8 0-4-2-7-6-11 0 4-2 6-4 8 0-2-1-3-2-4-2 3-4 5-4 8 0 4 3 7 8 7Z" />
  ),
  message: (
    <>
      <path d="M4 4h16v13H8l-4 4z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 2c.5 5 2.5 7 7.5 7.5-5 .5-7 2.5-7.5 7.5-.5-5-2.5-7-7.5-7.5C9.5 9 11.5 7 12 2Z" />
      <path d="M19 16c.2 2 1 2.8 3 3-2 .2-2.8 1-3 3-.2-2-1-2.8-3-3 2-.2 2.8-1 3-3Z" />
    </>
  ),
  zap: <path d="m13 2-9 12h8l-1 8 9-12h-8z" />,
  heart: (
    <path d="M20.8 5.8a5.4 5.4 0 0 0-7.6 0L12 7l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </>
  ),
  moon: <path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 15v5h16v-5" />
    </>
  ),
  download: <path d="M12 3v13M7 11l5 5 5-5M4 20h16" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.5 10.5 7-4M8.5 13.5l7 4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  home: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z" />,
  google: (
    <>
      <path d="M21 12.2c0-.7-.1-1.4-.2-2H12v3.7h5.1a4.4 4.4 0 0 1-1.9 2.8v2.4h3.1c1.8-1.7 2.7-4.1 2.7-6.9Z" />
      <path d="M12 21c2.6 0 4.8-.9 6.4-2.3l-3.1-2.4c-.9.6-2 1-3.3 1-2.5 0-4.6-1.7-5.4-4H3.4v2.5A9.7 9.7 0 0 0 12 21Z" />
      <path d="M6.6 13.3A5.8 5.8 0 0 1 6.3 12c0-.5.1-.9.2-1.3V8.2H3.4A9.2 9.2 0 0 0 2.5 12c0 1.4.3 2.7.9 3.8Z" />
      <path d="M12 6.7c1.4 0 2.7.5 3.7 1.4l2.8-2.8A9.3 9.3 0 0 0 3.4 8.2l3.2 2.5c.7-2.3 2.9-4 5.4-4Z" />
    </>
  ),
}

export type ToolIconName = keyof typeof iconPaths;

export default function ToolIcon({
  name,
  size = 20,
  filled = false,
}: {
  name: ToolIconName;
  size?: number;
  filled?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  );
}
