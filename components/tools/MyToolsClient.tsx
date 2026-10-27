"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import FunSticker from "@/components/tools/FunSticker";
import { ShelfGrid } from "@/components/tools/ToolsBrowser";
import { FAVOURITES_KEY, IconTile, RECENT_KEY } from "@/components/tools/ui";
import { categoryHref, toolById, tools, type Tool } from "@/lib/tools/registry";
import { useStoredList } from "@/lib/tools/useStoredList";

const toTools = (ids: string[]) => ids.map(toolById).filter((tool): tool is Tool => Boolean(tool));
const tilts = [-2, 1.5, -1, 2, -1.5];

// False on the server and the first paint, true once the browser's saved lists can be read. Avoids flashing
// the empty state for a moment before someone's favourites appear.
const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="m-0 text-xl font-extrabold tracking-tight text-navy sm:text-2xl">{title}</h2>
      {action}
    </div>
  );
}

/**
 * The Fun Zone's colourful field, shrunk into a panel, so fun favourites keep their look on this page.
 * Stickers have a fixed width and wrap, so one sticker or ten both look deliberate.
 */
function FunPanel({ title, text, list, link }: { title: string; text: string; list: Tool[]; link: ReactNode }) {
  return (
    <div className="fun-field grid gap-6 rounded-[2rem] px-4 py-7 sm:px-8 sm:py-9 lg:grid-cols-[13rem_1fr] lg:gap-10">
      <div>
        <h3 className="m-0 text-xl font-extrabold text-white">{title}</h3>
        <p className="mb-3 mt-2 text-sm leading-6 text-white/85">{text}</p>
        {link}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-6 sm:gap-x-6">
        {list.map((tool, index) => (
          <div key={tool.id} className="flex w-[calc(50%-0.5rem)] sm:w-52">
            <FunSticker tool={tool} tilt={tilts[index % tilts.length]} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Recently opened tools as small chips: picture, name and which section it lives in. */
function RecentRow({ list }: { list: Tool[] }) {
  return (
    <ul className="hide-scrollbar m-0 -mx-3.5 flex list-none gap-3 overflow-x-auto px-3.5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {list.map((tool) => (
        <li key={tool.id} className="shrink-0">
          <Link
            href={`/tool/${tool.id}`}
            className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-white py-2 pl-2 pr-5 transition hover:border-blue/60 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-hover"
          >
            <IconTile tool={tool} />
            <span>
              <span className="block text-sm font-bold text-navy">{tool.name}</span>
              <span className="block text-xs text-muted">{tool.category}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const textButton =
  "cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold underline-offset-4 hover:underline focus-visible:underline";

export default function MyToolsClient() {
  const hydrated = useHydrated();
  const { user } = useAuth();
  const [favouriteIds] = useStoredList(FAVOURITES_KEY);
  const [recentIds, setRecentIds] = useStoredList(RECENT_KEY);
  const favourites = toTools(favouriteIds);
  const recent = toTools(recentIds);
  const shelfFavourites = favourites.filter((tool) => tool.category === "The Shelf");
  const funFavourites = favourites.filter((tool) => tool.category === "Fun Zone");

  const fullName = (user?.user_metadata?.full_name ?? user?.user_metadata?.name) as string | undefined;
  const firstName = fullName?.trim().split(/\s+/)[0];

  const header = (
    <header className="mb-12">
      <h1 className="m-0 font-display text-5xl font-normal leading-none tracking-tight text-navy sm:text-6xl">
        {firstName ? `Welcome back, ${firstName}` : "My Shelf"}
      </h1>
      <p className="mb-0 mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">
        {!hydrated
          ? "Your favourite tools and the ones you used last."
          : favourites.length || recent.length
            ? `${favourites.length} ${favourites.length === 1 ? "favourite" : "favourites"} and ${recent.length} recently used, saved in this browser.`
            : "Your favourite tools and the ones you used last will live here."}
      </p>
    </header>
  );

  // Before the saved lists are read: header plus a quiet placeholder of the same rough height.
  if (!hydrated) {
    return (
      <>
        {header}
        <div className="h-64 rounded-3xl bg-surface/60" aria-hidden="true" />
      </>
    );
  }

  // First visit: nothing saved yet. Explain the heart and offer a few good places to start.
  if (!favourites.length && !recent.length) {
    const shelfPicks = tools.filter((tool) => tool.category === "The Shelf" && tool.popular).slice(0, 3);
    const funPicks = tools
      .filter((tool) => tool.category === "Fun Zone")
      .sort((a, b) => Number(!!b.popular) - Number(!!a.popular))
      .slice(0, 4);
    return (
      <>
        {header}
        <div className="mb-14 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="m-0 text-xl font-extrabold text-navy">Your shelf is empty, for now</h2>
          <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-muted">
            Tap the heart on any tool to keep it here. Tools you open show up here too, so you can jump straight back in
            next time. Here are a few people start with.
          </p>
        </div>
        <section className="mb-14">
          <SectionTitle
            title="Popular on The Shelf"
            action={
              <Link href="/the-shelf" className={`${textButton} text-blue-hover`}>
                See all
              </Link>
            }
          />
          <ShelfGrid list={shelfPicks} />
        </section>
        <FunPanel
          title="Popular in the Fun Zone"
          text="Quick, silly and made to share. Start with one of these."
          list={funPicks}
          link={
            <Link href="/fun" className={`${textButton} text-white underline`}>
              See all ten
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      {header}

      {recent.length > 0 && (
        <section className="mb-14" aria-labelledby="recent">
          <SectionTitle
            title="Jump back in"
            action={
              <button type="button" onClick={() => setRecentIds([])} className={`${textButton} text-muted hover:text-navy`}>
                Clear history
              </button>
            }
          />
          <RecentRow list={recent} />
        </section>
      )}

      <section aria-labelledby="favourites">
        <SectionTitle title="Your favourites" />
        {favourites.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line px-6 py-10 text-center">
            <p className="m-0 font-bold text-navy">No favourites yet</p>
            <p className="mx-auto mb-0 mt-1 max-w-md text-sm leading-6 text-muted">
              Tap the heart on any tool and it will wait for you here.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link href={categoryHref("The Shelf")} className={`${textButton} text-blue-hover`}>
                Browse The Shelf
              </Link>
              <Link href={categoryHref("Fun Zone")} className={`${textButton} text-purple-600`}>
                Open the Fun Zone
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-12">
            {shelfFavourites.length > 0 && (
              <div>
                <h3 className="mb-5 mt-0 text-base font-bold text-muted">From The Shelf</h3>
                <ShelfGrid list={shelfFavourites} />
              </div>
            )}
            {funFavourites.length > 0 && (
              <FunPanel
                title="From the Fun Zone"
                text={`${funFavourites.length} saved for your next break.`}
                list={funFavourites}
                link={
                  <Link href="/fun" className={`${textButton} text-white underline`}>
                    Find more
                  </Link>
                }
              />
            )}
          </div>
        )}
      </section>
    </>
  );
}
