import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
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
    default: "Toppershelf: BSc Nursing Notes, Important Questions & Flashcards",
    template: "%s | Toppershelf",
  },
  description:
    "Exam-focused nursing study material for B.Sc. Nursing, GNM and Post Basic: important questions, care plans, case studies, flashcards, notes and assignments, organized by course and semester.",
  applicationName: "Toppershelf",
  keywords: [
    "Toppershelf",
    "BSc nursing notes",
    "GNM notes",
    "Post Basic nursing notes",
    "nursing important questions",
    "nursing flashcards",
    "nursing care plans",
    "nursing case studies",
  ],
  // Every page names itself as the one official address (query strings like ?course=gnm are dropped).
  alternates: { canonical: "./" },
  openGraph: {
    siteName: "Toppershelf",
    type: "website",
    locale: "en_IN",
    title: "Toppershelf: Better Resources. Better Results.",
    description:
      "Important questions, care plans, case studies, flashcards, notes and assignments for nursing students.",
  },
  twitter: { card: "summary_large_image" },
  // Optional: paste the Google Search Console HTML-tag code into this Vercel variable if you verify that way.
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FFFBF7" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${dmSerif.variable}`}>
      <body className="flex min-h-full flex-col font-sans">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <Analytics />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
