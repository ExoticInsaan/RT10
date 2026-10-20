"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Flipkart / Meesho style picture strip for the product page: swipe sideways (or use the arrows
// on a computer) and the dots below show where you are. Slide 1 is the cover; the rest are the
// free preview pages from the resource's sample file.
export default function PreviewGallery({ slug, title, cover }: { slug: string; title: string; cover: ReactNode }) {
  const [pages, setPages] = useState(0);
  const [failed, setFailed] = useState<number[]>([]);
  const [position, setPosition] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/preview/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { pages: 0 }))
      .then((data) => setPages(Number.isInteger(data?.pages) && data.pages > 0 ? data.pages : 0))
      .catch(() => {});
    return () => controller.abort();
  }, [slug]);

  const previews = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => !failed.includes(n));
  const total = 1 + previews.length;
  const active = Math.min(position, total - 1);

  function goTo(index: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(total - 1, index));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const el = track.current;
    if (!el || el.clientWidth === 0) return;
    setPosition(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={track}
          onScroll={onScroll}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              goTo(active + 1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              goTo(active - 1);
            }
          }}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${title} pictures`}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-3 outline-none [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-blue/40 [&::-webkit-scrollbar]:hidden"
        >
          <div className="w-full shrink-0 snap-center">{cover}</div>
          {previews.map((n) => (
            <div key={n} className="w-full shrink-0 snap-center">
              <div className="relative w-full overflow-hidden rounded-[3px] bg-white shadow-[0_8px_15px_rgba(16,42,76,0.14)] ring-1 ring-[#102a4c]/15 [aspect-ratio:3_/_4] [max-height:560px] max-[560px]:[max-height:none]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/preview/${encodeURIComponent(slug)}/${n}?w=960`}
                  alt={`${title}, sample page ${n}`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  onError={() => setFailed((f) => (f.includes(n) ? f : [...f, n]))}
                  className="absolute inset-0 h-full w-full select-none object-contain"
                />
                <span className="absolute left-2 top-2 rounded-full bg-navy/80 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  Free sample · page {n}
                </span>
              </div>
            </div>
          ))}
        </div>

        {total > 1 && active > 0 && (
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous picture"
            className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-lg font-bold text-navy shadow-md ring-1 ring-black/10 hover:bg-white max-[560px]:hidden"
          >
            ‹
          </button>
        )}
        {total > 1 && active < total - 1 && (
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next picture"
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-lg font-bold text-navy shadow-md ring-1 ring-black/10 hover:bg-white max-[560px]:hidden"
          >
            ›
          </button>
        )}
      </div>

      {total > 1 && (
        <>
          <div className="mt-3 flex items-center justify-center gap-1.5" role="tablist" aria-label="Choose picture">
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={i === 0 ? "Cover" : `Sample page ${i}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-200 ${i === active ? "w-5 bg-navy" : "w-2 bg-navy/25 hover:bg-navy/45"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-muted">Swipe to see the free sample pages</p>
        </>
      )}
    </div>
  );
}
