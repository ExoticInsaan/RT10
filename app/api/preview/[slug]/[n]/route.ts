import { NextResponse } from "next/server";
import { MAX_PREVIEW_PAGES, samplePathFor } from "@/lib/preview-server";
import { pickWidth, renderPage } from "@/lib/reader-server";

// GET /api/preview/<slug>/<n>?w=<pixels>
// One free preview page as a picture (no email watermark: it is free and public).
const headers = {
  "Content-Disposition": "inline",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request, { params }: RouteContext<"/api/preview/[slug]/[n]">) {
  const { slug, n } = await params;
  const page = Number(n);
  const missing = () => NextResponse.json({ error: "No such preview page." }, { status: 404, headers: { ...headers, "Cache-Control": "no-store" } });
  if (!Number.isInteger(page) || page < 1 || page > MAX_PREVIEW_PAGES) return missing();

  try {
    const path = await samplePathFor(slug);
    if (!path) return missing();
    const wanted = Number(new URL(request.url).searchParams.get("w")) || 960;
    const picture = await renderPage(path, page, pickWidth(wanted), "");
    if (!picture) return missing();
    return new Response(new Uint8Array(picture), {
      headers: {
        ...headers,
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("Preview: could not draw page", slug, n, err);
    return NextResponse.json({ error: "Could not draw this page." }, { status: 500, headers: { ...headers, "Cache-Control": "no-store" } });
  }
}
