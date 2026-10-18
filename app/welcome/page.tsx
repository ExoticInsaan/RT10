import type { Metadata } from "next";
import WelcomeFlow from "@/components/welcome/WelcomeFlow";

export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return (
    <div className="mx-auto flex min-h-[68vh] w-full max-w-md items-center px-4 py-10">
      <WelcomeFlow />
    </div>
  );
}
