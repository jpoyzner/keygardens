import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/lib/cart/cart-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keygardens",
  description: "Keygardens online store",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) inject
          attributes like cz-shortcut-listen onto <body> before React hydrates. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <CartProvider>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
