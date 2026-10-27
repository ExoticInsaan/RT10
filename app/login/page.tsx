import type { Metadata } from "next";
import AuthPanel from "@/components/AuthPanel";
import Logo from "@/components/shell/Logo";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: true } };

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center bg-auth-pattern px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-line bg-white p-6 text-slate-900 shadow-float sm:p-8">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <AuthPanel next="/" />
      </section>
    </div>
  );
}
