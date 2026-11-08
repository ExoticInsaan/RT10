"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { ShelfItem } from "./Shelf3D";

// Three.js is large, so it is only fetched when this scene is actually shown.
const Shelf3D = dynamic(() => import("./Shelf3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[#fbf1e2] text-sm font-semibold text-muted" role="status">
      Setting up the shelves…
    </div>
  ),
});

/** Opens the 3D shelf and sends a tapped tool to its page. `fallback` is the normal grid, used if WebGL isn't available. */
export default function Shelf3DLoader({ items, fallback }: { items: ShelfItem[]; fallback?: React.ReactNode }) {
  const router = useRouter();
  return <Shelf3D items={items} fallback={fallback} onOpen={(id) => router.push(`/tool/${id}`)} />;
}
