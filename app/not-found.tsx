import type { Metadata } from "next";
import StatusPage from "@/components/shell/StatusPage";
import { ButtonLink } from "@/components/tools/ui";
import { isReady, tools } from "@/lib/tools/registry";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

// Shown for any address that does not exist. Instead of a dead end it suggests popular tools.
export default function NotFound() {
  const popular = tools.filter((tool) => tool.popular && isReady(tool)).slice(0, 4);
  return (
    <StatusPage
      label="Error 404"
      title="We couldn’t find that page"
      actions={
        <>
          <ButtonLink href="/the-shelf">Browse all tools</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Go to home
          </ButtonLink>
        </>
      }
    >
      <p className="m-0">The link may be old or mistyped, or the tool may have moved. These are popular right now:</p>
      <ul className="m-0 mt-4 flex list-none flex-wrap justify-center gap-2 p-0">
        {popular.map((tool) => (
          <li key={tool.id}>
            <Link
              href={`/tool/${tool.id}`}
              className="inline-block rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy transition hover:border-blue hover:bg-blue-soft dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {tool.name}
            </Link>
          </li>
        ))}
      </ul>
    </StatusPage>
  );
}
