import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/shell/SiteHeader";
import SiteFooter from "@/components/shell/SiteFooter";
import MobileNav from "@/components/shell/MobileNav";
import AuthProvider from "@/components/AuthProvider";
import Analytics from "@/components/Analytics";
import { SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TopperShelf: Free Online Tools for Students & Everyday Life",
    template: "%s | Toppershelf",
  },
  description:
    "Free, fast online tools for students: exam photo and signature resizer, CGPA converter, attendance calculator, leave letters and more, plus a few fun ones to share.",
  applicationName: "Toppershelf",
  keywords: [
    "TopperShelf",
    "free online tools",
    "student tools",
    "cgpa to percentage",
    "attendance calculator",
    "exam photo resizer",
    "leave application letter",
    "image to pdf",
  ],
  // No default canonical here: a relative "./" default made the home page canonical resolve to
  // /index. Each public page now sets its own absolute-path canonical (resolved against
  // metadataBase), which also drops query strings like ?term=1.
  openGraph: {
    siteName: "Toppershelf",
    type: "website",
    locale: "en_IN",
    title: "TopperShelf: Useful tools. A few silly ones. All free.",
    description: "Fast, simple tools for files, numbers, words and everyday life.",
  },
  twitter: { card: "summary_large_image" },
  // Optional: paste the Google Search Console HTML-tag code into this Vercel variable if you verify that way.
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FFFBF7" };

// Sets dark mode before the first paint so the page never flashes light. Reads the saved choice, else the device setting.
const themeScript = `try{var t=localStorage.getItem("toppershelf-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${dmSerif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink antialiased transition-colors dark:bg-slate-950 dark:text-slate-200">
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
