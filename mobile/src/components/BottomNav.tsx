import { GridIcon, HeartIcon, HomeIcon, SparkIcon } from "./icons";

const tabs = [
  { path: "/home", label: "Home", Icon: HomeIcon, active: "bg-[#e9f4fc] text-[#1d4ed8]" },
  { path: "/shelf", label: "Shelf", Icon: GridIcon, active: "bg-[#e9f4fc] text-[#1d4ed8]" },
  { path: "/fun", label: "Fun", Icon: SparkIcon, active: "bg-[#f3e8ff] text-[#6b21a8]" },
  { path: "/my-shelf", label: "My Shelf", Icon: HeartIcon, active: "bg-[#e9f4fc] text-[#1d4ed8]" },
];

export const TAB_PATHS = tabs.map((t) => t.path);

export default function BottomNav({ path }: { path: string }) {
  return (
    <nav
      aria-label="Main"
      className="absolute inset-x-0 bottom-0 box-border grid grid-cols-4 gap-1 border-t border-line bg-ivory px-2.5 pt-2 pb-[max(14px,env(safe-area-inset-bottom))]"
    >
      {tabs.map(({ path: to, label, Icon, active }) => {
        const on = path === to;
        return (
          <a
            key={to}
            href={"#" + to}
            aria-current={on ? "page" : undefined}
            className={`flex h-14 flex-col items-center justify-center gap-[3px] rounded-2xl text-[11px] font-bold ${on ? active : "text-[#5b6675]"}`}
          >
            <Icon />
            {label}
          </a>
        );
      })}
    </nav>
  );
}
