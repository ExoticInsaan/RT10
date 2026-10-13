import type { Metadata } from "next";
import AdminClient from "@/components/admin/AdminClient";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <AdminClient />
    </main>
  );
}
