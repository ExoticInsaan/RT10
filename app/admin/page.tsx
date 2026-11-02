import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

// Not linked anywhere and kept out of search results. Access is decided by the database (see supabase/migrations/0008).
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="container-app max-w-5xl pb-20 pt-10">
      <AdminDashboard />
    </div>
  );
}
