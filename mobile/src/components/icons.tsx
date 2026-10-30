import type { ReactNode, SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number, children: ReactNode, props: SVGProps<SVGSVGElement>, sw = 2) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {children}
  </svg>
);

export const HomeIcon = ({ size = 24, ...p }: P) => base(size, <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>, p);
export const GridIcon = ({ size = 24, ...p }: P) =>
  base(size, <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>, p);
export const SparkIcon = ({ size = 24, ...p }: P) =>
  base(size, <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></>, p);
export const HeartIcon = ({ size = 24, filled, ...p }: P & { filled?: boolean }) =>
  base(size, <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill={filled ? "currentColor" : "none"} />, p);
export const BellIcon = ({ size = 24, ...p }: P) => base(size, <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>, p);
export const OfflineIcon = ({ size = 24, ...p }: P) =>
  base(size, <><path d="M1 1l22 22" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.58 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><path d="M12 20h.01" /></>, p);
export const CloudIcon = ({ size = 24, ...p }: P) => base(size, <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />, p);
export const UserIcon = ({ size = 22, ...p }: P) => base(size, <><circle cx="12" cy="8" r="4" /><path d="M4 22c1-5 3.7-7 8-7s7 2 8 7" /></>, p);
export const SearchIcon = ({ size = 20, ...p }: P) => base(size, <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>, p);
export const BackIcon = ({ size = 22, ...p }: P) => base(size, <path d="M15 5l-7 7 7 7" />, p, 2.6);
export const ArrowIcon = ({ size = 18, ...p }: P) => base(size, <path d="M5 12h14M13 6l6 6-6 6" />, p, 2.4);

export const GoogleIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
    <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);
