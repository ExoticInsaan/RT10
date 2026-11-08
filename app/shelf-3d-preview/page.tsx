import type { Metadata } from "next";
import Shelf3DLoader from "@/components/shelf3d/Shelf3DLoader";
import { ShelfGrid } from "@/components/tools/ToolsBrowser";
import { tools } from "@/lib/tools/registry";

// Temporary preview of the 3D shelf while it is built on a branch. Not linked anywhere and kept out of Google.
export const metadata: Metadata = {
  title: "3D Shelf preview",
  robots: { index: false, follow: false },
  alternates: { canonical: "/shelf-3d-preview" },
};

export default function Shelf3DPreviewPage() {
  const items = tools.map(({ id, name, description, category, image, imageBg, imageFit }) => ({ id, name, description, category, image, imageBg, imageFit }));
  return (
    <div className="container-app pb-16 pt-8 sm:pt-12">
      <h1 className="m-0 font-display text-4xl font-normal leading-none tracking-tight text-navy sm:text-5xl">The Shelf, in 3D</h1>
      <p className="mb-6 mt-3 max-w-xl text-base leading-7 text-muted">Walk the aisle. The Shelf is on the left, the Fun Zone on the right.</p>
      <div className="h-[min(78vh,720px)] min-h-[460px] overflow-hidden rounded-3xl border border-line">
        <Shelf3DLoader items={items} fallback={<ShelfGrid list={tools} />} />
      </div>
    </div>
  );
}
