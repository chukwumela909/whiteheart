import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import JivoWidget from "./components/JivoWidget";

// Fonts are bundled in /public/fonts and declared in globals.css (no download at build time).

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
        className="antialiased"
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
        <JivoWidget />
      </body>
    </html>
  );
}
