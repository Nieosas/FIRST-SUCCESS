import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhoneDeck — Phone Accessories",
  description:
    "Cases, screen protectors, chargers, cables and more for your phone.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
            PhoneDeck — a demo phone accessories shop.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
