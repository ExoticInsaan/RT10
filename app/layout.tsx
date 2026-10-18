import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import Analytics from "@/components/Analytics";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.toppershelf.online"),
  title: {
    default: "Toppershelf: Nursing study notes, important questions and flashcards",
    template: "%s | Toppershelf",
  },
  description:
    "Exam-focused nursing study material: important questions, care plans, case studies, flashcards, notes and assignments, organized by course and semester.",
  openGraph: {
    siteName: "Toppershelf",
    type: "website",
    locale: "en_IN",
    title: "Toppershelf: Better Resources. Better Results.",
    description:
      "Important questions, care plans, case studies, flashcards, notes and assignments for nursing students.",
  },
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
