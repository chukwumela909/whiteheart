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

export const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

export const metadata: Metadata = {
  title: "Whiteheart",
  description: "An e-commerce platform for whiteheart brand caps.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    title: "Whiteheart",
    description: "An e-commerce platform for whiteheart brand caps.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: "Whiteheart",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/WH-NEW-LOGO-transparent.png`,
        width: 1200,
        height: 630,
        alt: "Whiteheart logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Whiteheart",
    description: "An e-commerce platform for whiteheart brand caps.",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/WH-NEW-LOGO-transparent.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
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
            {/* JSON-LD Organization metadata to help search engines pick up the site logo */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  name: "Whiteheart",
                  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                  logo:
                    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/WH-NEW-LOGO-transparent.png`,
                }),
              }}
            />
            {children}
          </CartProvider>
        </NotificationProvider>
        <script src="//code.jivosite.com/widget/T17Ve3l6eo" async></script>
      </body>
    </html>
  );
}
