import { NextResponse } from "next/server";
import { MAX_PREVIEW_PAGES, samplePathFor } from "@/lib/preview-server";
import { getPdf } from "@/lib/reader-server";

// GET /api/preview/<slug>
// How many free preview pages this resource has: { pages: number }. 0 means no preview.
// Public: previews are free, and only published resources have one.
const cached = { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" };

export async function GET(_request: Request, { params }: RouteContext<"/api/preview/[slug]">) {
  const { slug } = await params;
  try {
    const path = await samplePathFor(slug);
    if (!path) return NextResponse.json({ pages: 0 }, { headers: cached });
    const { doc } = await getPdf(path); // only the page count is needed, no need to measure every page
    return NextResponse.json({ pages: Math.min(doc.numPages, MAX_PREVIEW_PAGES) }, { headers: cached });
  } catch (err) {
    console.error("Preview: could not open sample", slug, err);
    return NextResponse.json({ pages: 0 }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
