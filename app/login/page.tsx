import type { Metadata } from "next";
import AuthPanel from "@/components/AuthPanel";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <AuthPanel next="/" />
      </div>
    </div>
  );
}
