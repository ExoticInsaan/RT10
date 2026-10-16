import { NextResponse } from "next/server";
import { authorizeRead } from "@/lib/reader-access";
import { pickWidth, renderPage } from "@/lib/reader-server";

// GET /api/read/<slug>/page/<n>?w=<pixels>
// One page of the PDF as a picture with the reader's email burned in.
// Needs the student's own sign-in, so a copied link is useless to anyone else.
const headers = {
  "Cache-Control": "private, no-store",
  "Content-Disposition": "inline",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request, { params }: RouteContext<"/api/read/[slug]/page/[n]">) {
  const { slug, n } = await params;
  const access = await authorizeRead(slug);
  if (!access.ok) {
    return NextResponse.json({ code: access.code, error: access.error }, { status: access.status, headers });
  }

  const wanted = Number(new URL(request.url).searchParams.get("w")) || 960;
  try {
    const picture = await renderPage(access.filePath, Number(n), pickWidth(wanted), access.email);
    if (!picture) return NextResponse.json({ code: "no_such_page", error: "No such page." }, { status: 404, headers });
    return new Response(new Uint8Array(picture), { headers: { ...headers, "Content-Type": "image/webp" } });
  } catch (err) {
    console.error("Reader: could not draw page", slug, n, err);
    return NextResponse.json({ code: "file_error", error: "Could not draw this page." }, { status: 500, headers });
  }
}
