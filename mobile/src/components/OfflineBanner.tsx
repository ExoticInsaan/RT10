import { useEffect, useState } from "react";

/** Small notice while the phone has no internet, so people know what still works. Renders nothing when online. */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const off = () => setOffline(true);
    const on = () => setOffline(false);
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    return () => {
      window.removeEventListener("offline", off);
      window.removeEventListener("online", on);
    };
  }, []);

  if (!offline) return null;
  return (
    <div role="status" className="pointer-events-none absolute inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
      <p className="m-0 max-w-sm rounded-full bg-navy px-4 py-2 text-center text-xs font-bold leading-5 text-white shadow-card">
        You&rsquo;re offline. Your tools still work and changes sync when you&rsquo;re back online.
      </p>
    </div>
  );
}
