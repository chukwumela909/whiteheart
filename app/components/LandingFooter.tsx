// The pale grey footer of the homepage and shop page: logo and tagline on top,
// four columns of links at the bottom. Other pages still use Footer.tsx.
import Link from "next/link";
import { grotesk } from "./landingFonts";
import { Bracketed } from "./HomeSections";
import { resized } from "@/lib/img";

const WHATSAPP = "https://wa.me/qr/ZLOYJC5K3GZXG1";

const LABEL = "text-[11px] font-bold uppercase leading-[1.25] tracking-[0.01em]";

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
    {
        title: "Site index",
        links: [
            { label: "Shop now", href: "/shop" },
            { label: "Headwear", href: "/shop?category=headwear" },
            { label: "Home", href: "/" },
            { label: "My orders", href: "/orders" },
        ],
    },
    {
        title: "Social",
        links: [
            { label: "Instagram", href: "https://www.instagram.com/whiteheartconcepts?srtk=MWt5cWZ6aWRuczNqcw%3D%3D&utm_source=qr", external: true },
            { label: "TikTok", href: "https://www.tiktok.com/@whiteheart_outfits", external: true },
            { label: "Pinterest", href: "https://pin.it/7ptAQ8aEP", external: true },
            { label: "X", href: "https://x.com/thebrandwh?s=21", external: true },
        ],
    },
    {
        title: "Get in touch",
        links: [{ label: "Customer service on WhatsApp", href: WHATSAPP, external: true }],
    },
    {
        title: "Legal",
        links: [
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
        ],
    },
];

export default function LandingFooter() {
    const linkClass = "text-[#6b6b6b] transition-colors hover:text-black";

    return (
        <footer className={`${grotesk.className} flex w-full flex-col bg-[#f4f4f4] px-5 pb-5 pt-5 text-black md:min-h-[100svh]`}>
            <div className="grid grid-cols-4 gap-x-2.5 gap-y-10">
                <Link href="/" aria-label="Whiteheart home" className="col-span-4 md:col-span-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={resized("/landing/wh-logo-red.png", 640)}
                        alt="Whiteheart"
                        width={260}
                        height={134}
                        loading="lazy"
                        decoding="async"
                        className="h-auto w-[clamp(9rem,17vw,17rem)]"
                    />
                </Link>
                <p className={`${LABEL} col-span-4 md:col-span-1`}>
                    WhiteHeart®
                    <br />
                    Caps, tees and tracksuits for everyday wear
                </p>
                <div className="col-span-4 md:col-span-1">
                    <p className={`${LABEL} border-t border-black/25 pt-2 text-[#6b6b6b]`}>Get help buying</p>
                    <p className={`${LABEL} mt-2 border-t border-black/25 pt-2 text-[#6b6b6b]`}>
                        Questions about sizes and stock
                    </p>
                    <a
                        href={WHATSAPP}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-2 block border-t border-black/25 pt-2"
                    >
                        <Bracketed>Chat with us</Bracketed>
                    </a>
                </div>
            </div>

            <nav
                aria-label="Footer"
                className="mt-20 grid grid-cols-2 gap-x-2.5 gap-y-10 md:mt-auto md:grid-cols-4 md:pt-24"
            >
                {COLUMNS.map((column) => (
                    <div key={column.title}>
                        <h2 className={`${LABEL} mb-2 border-b border-black/15 pb-2`}>{column.title}</h2>
                        <ul className={LABEL}>
                            {column.links.map((link) => (
                                <li key={link.label}>
                                    {link.external ? (
                                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link href={link.href} className={linkClass}>
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                            {column.title === "Get in touch" && <li className="text-[#6b6b6b]">Delivering to Port Harcourt (RIV)</li>}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Kept clear of the bottom-right corner, where the chat button sits */}
            <p className={`${LABEL} mt-16 pb-14 md:mt-12 md:pb-0`}>All rights reserved _ WH©{new Date().getFullYear()}</p>
        </footer>
    );
}
