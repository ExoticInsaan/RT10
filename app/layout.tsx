import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "TopperShelf: Nursing notes, quizzes & tests", template: "%s | TopperShelf" },
  description:
    "Affordable nursing notes, quizzes and mock tests for GNM, BSc Nursing and Post Basic students. Notes and quizzes at ₹19, full tests at ₹28.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FFFBF7" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${dmSerif.variable}`}>
      <body className="flex min-h-full flex-col font-sans">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
