import { useEffect } from "react";
import AccountListsSync from "@/components/AccountListsSync";
import AuthProvider from "@/components/AuthProvider";
import BottomNav, { TAB_PATHS } from "./components/BottomNav";
import ReminderScheduler from "./components/ReminderScheduler";
import SavedToast from "./components/SavedToast";
import { setStatusBar } from "./native";
import { usePath } from "./shims/router";
import FunZone from "./screens/FunZone";
import Home from "./screens/Home";
import MyShelf from "./screens/MyShelf";
import { Onboard1, Onboard2 } from "./screens/Onboard";
import Settings from "./screens/Settings";
import Shelf from "./screens/Shelf";
import SignIn from "./screens/SignIn";
import Splash from "./screens/Splash";
import ToolScreen from "./screens/ToolScreen";

function Screen({ path }: { path: string }) {
  if (path.startsWith("/tool/")) return <ToolScreen id={decodeURIComponent(path.slice(6))} />;
  switch (path) {
    case "/onboard/1":
      return <Onboard1 />;
    case "/onboard/2":
      return <Onboard2 />;
    case "/signin":
      return <SignIn />;
    case "/home":
      return <Home />;
    case "/shelf":
      return <Shelf />;
    case "/fun":
      return <FunZone />;
    case "/my-shelf":
      return <MyShelf />;
    case "/settings":
      return <Settings />;
    default:
      return <Splash />;
  }
}

export default function App() {
  const path = usePath();
  useEffect(() => setStatusBar(path), [path]);
  return (
    <AuthProvider>
      <AccountListsSync />
      <ReminderScheduler />
      <div className="relative mx-auto h-dvh w-full max-w-[480px] overflow-hidden bg-ivory text-navy">
        <Screen key={path} path={path} />
        {TAB_PATHS.includes(path) && <BottomNav path={path} />}
        <SavedToast />
      </div>
    </AuthProvider>
  );
}
