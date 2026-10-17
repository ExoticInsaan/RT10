import type { Metadata } from "next";
import cn from "@/lib/design/twStyles";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import StatusPage from "@/components/ui/StatusPage";

export const metadata: Metadata = { title: "Page not found" };

// Shown for any address that does not exist, and when a page calls notFound()
// (for example a resource that was unpublished or whose link was mistyped).
export default function NotFound() {
  return (
    <StatusPage
      label="Error 404"
      title="We couldn’t find that page"
      actions={
        <>
          <Button href="/browse">Browse resources</Button>
          <Button variant="secondary" href="/">
            Go to home
          </Button>
        </>
      }
    >
      <p className="m-0 mb-5">
        The link may be old or mistyped, or the resource may no longer be available. Search for what you need:
      </p>
      <form className={cn("hero-search")} action="/browse" method="get" role="search">
        <Icon name="search" size={18} />
        <input
          name="q"
          type="search"
          aria-label="Search by document name"
          placeholder="Search by document name"
          autoComplete="off"
        />
        <Button type="submit" ariaLabel="Search">
          <Icon name="search" size={18} />
        </Button>
      </form>
    </StatusPage>
  );
}
