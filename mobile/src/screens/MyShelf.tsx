import { tools } from "@/lib/tools/registry";
import { FAVOURITES_KEY, RECENT_KEY } from "@/components/tools/ui";
import { useAuth } from "@/components/AuthProvider";
import { useStoredList } from "@/lib/tools/useStoredList";
import { ShelfTile, Sticker } from "../components/tiles";

const shelf = tools.filter((t) => t.category === "The Shelf");
const byId = (id: string) => tools.find((t) => t.id === id)!;
const funPicks = ["how-cooked", "excuse-generator"].map(byId);

export default function MyShelf() {
  const [favs] = useStoredList(FAVOURITES_KEY);
  const [recent] = useStoredList(RECENT_KEY);
  const { user, ready, openSignIn, signOut } = useAuth();
  const favTools = favs.map((id) => tools.find((t) => t.id === id)).filter(Boolean) as typeof tools;
  const recentTools = recent.filter((id) => !favs.includes(id)).map((id) => tools.find((t) => t.id === id)).filter(Boolean) as typeof tools;
  const empty = !favTools.length && !recentTools.length;
  const name = (user?.user_metadata?.name as string | undefined) ?? user?.email;

  return (
    <div className="hide-scrollbar absolute inset-0 overflow-y-auto pb-[100px]">
      <div className="px-5 pt-5">
        <h1 className="m-0 font-display text-[40px] leading-none font-normal">My Shelf</h1>
        <p className="mt-2 mb-0 text-[15px] leading-[1.45] text-[#5b6675]">Your favourite tools and the ones you used last will live here.</p>
      </div>

      {ready && (
        <div className="mx-5 mt-5 flex items-center justify-between gap-3 rounded-3xl border border-line bg-white p-4">
          <div className="min-w-0">
            <div className="text-[15px] font-extrabold">{user ? "Signed in" : "You are browsing as a guest"}</div>
            <div className="truncate text-[13px] text-[#5b6675]">{user ? name : "Sign in to run the tools and keep your favourites."}</div>
          </div>
          <button
            type="button"
            onClick={user ? () => void signOut() : openSignIn}
            className="min-h-11 shrink-0 cursor-pointer rounded-full border-0 bg-navy px-5 text-sm font-bold text-white"
          >
            {user ? "Sign out" : "Sign in"}
          </button>
        </div>
      )}

      {empty ? (
        <div className="mx-5 mt-5 box-border rounded-3xl border border-line bg-white p-5">
          <h2 className="m-0 text-[19px] font-extrabold tracking-[-0.01em]">Your shelf is empty, for now</h2>
          <p className="mt-2 mb-0 text-sm leading-[1.55] text-[#5b6675]">
            Tap the heart on any tool to keep it here. Tools you open show up here too, so you can jump straight back in next time. Here are a few people start with.
          </p>
        </div>
      ) : (
        <>
          {favTools.length > 0 && <Row title="Favourites" items={favTools} />}
          {recentTools.length > 0 && <Row title="Recently used" items={recentTools} />}
        </>
      )}

      {empty && (
        <>
          <div className="flex items-center justify-between px-5 pt-6">
            <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.01em]">Popular on The Shelf</h2>
            <a href="#/shelf" className="flex min-h-11 items-center text-sm font-extrabold text-[#1d4ed8]">See all</a>
          </div>
          <div className="hide-scrollbar flex gap-3.5 overflow-x-auto px-5 pt-1 pb-2">
            {shelf.slice(0, 3).map((t) => (
              <ShelfTile key={t.id} tool={t} />
            ))}
          </div>
        </>
      )}

      <div className="bg-fun-field mx-5 mt-[22px] rounded-[28px] py-[22px] text-white">
        <div className="px-5">
          <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.01em]">Popular in the Fun Zone</h2>
          <p className="mt-1.5 mb-0 text-sm leading-normal">Quick, silly and made to share. Start with one of these.</p>
        </div>
        <div className="grid grid-cols-2 gap-3.5 px-5 pt-[18px] pb-1.5">
          {funPicks.map((t, i) => (
            <Sticker key={t.id} tool={t} tilt={i ? 1.5 : -2} size="sm" />
          ))}
        </div>
        <div className="px-5 pt-1.5">
          <a href="#/fun" className="inline-flex min-h-11 items-center text-sm font-extrabold text-white underline">See all ten</a>
        </div>
      </div>
    </div>
  );
}

function Row({ title, items }: { title: string; items: typeof tools }) {
  return (
    <>
      <h2 className="m-0 px-5 pt-6 text-[22px] font-extrabold tracking-[-0.01em]">{title}</h2>
      <div className="hide-scrollbar flex gap-3.5 overflow-x-auto px-5 pt-2 pb-2">
        {items.map((t) =>
          t.category === "Fun Zone" ? <Sticker key={t.id} tool={t} tilt={0} size="sm" className="w-[150px] shrink-0" /> : <ShelfTile key={t.id} tool={t} />,
        )}
      </div>
    </>
  );
}
