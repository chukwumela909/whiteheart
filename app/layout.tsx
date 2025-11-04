import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script, Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", ],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Whiteheart",
  description: "An e-commerce platform for whiteheart brand caps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${lato.variable} antialiased`}
      >
        <NotificationProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </NotificationProvider>
        <script src="//code.jivosite.com/widget/T17Ve3l6eo" async></script>
      </body>
    </html>
  );
}
