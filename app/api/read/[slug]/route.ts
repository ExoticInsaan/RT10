import { NextResponse } from "next/server";
import { authorizeRead } from "@/lib/reader-access";
import { getPdf } from "@/lib/reader-server";

// GET /api/read/<slug>
// For a student who PAID: the title, their email, and the size of every page.
// The PDF itself is never sent. Pages come one at a time as watermarked pictures
// from /api/read/<slug>/page/<n>.
//
// Codes: login_required, not_found, not_owned, file_missing, file_error
const reply = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function GET(_request: Request, { params }: RouteContext<"/api/read/[slug]">) {
  const { slug } = await params;
  const access = await authorizeRead(slug);
  if (!access.ok) return reply(access.status, { code: access.code, error: access.error });

  try {
    const { sizes } = await getPdf(access.filePath);
    return reply(200, { title: access.title, email: access.email, pages: sizes });
  } catch (err) {
    console.error("Reader: could not open PDF", slug, err);
    return reply(500, { code: "file_error", error: "Could not open the PDF. Please try again." });
  }
}
