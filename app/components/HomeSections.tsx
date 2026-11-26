"use client";

// Everything on the homepage between the hero and the footer:
// manifesto, featured products, three entry tiles, delivery note, lookbook strip, socials.
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { grotesk, serif } from "./landingFonts";
import { MODEL_SHOTS, shotSrc, shotSrcSet } from "@/lib/modelShots";
import { originalOnError, resized, resizedSet } from "@/lib/img";
import { isSoldOut } from "@/lib/stock";

export interface HomeProduct {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    images?: string[] | null;
    category: string;
    stock_quantity: number;
    sizes?: { name: string; stock: number }[] | null;
}

const INSTAGRAM = "https://www.instagram.com/whiteheartconcepts?srtk=MWt5cWZ6aWRuczNqcw%3D%3D&utm_source=qr";
const WHATSAPP = "https://wa.me/qr/ZLOYJC5K3GZXG1";

/** Small bold capitals used for every label on the page. */
const LABEL = "text-[11px] font-bold uppercase leading-[1.25] tracking-[0.01em]";

/** A text link wrapped in square brackets that open up on hover. Put it inside an element with the `group` class. */
export function Bracketed({ children }: { children: ReactNode }) {
    return (
        <span className={`${LABEL} inline-flex items-center gap-1.5`}>
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transition-none">
                [
            </span>
            {children}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
                ]
            </span>
        </span>
    );
}

/** Fades its content up the first time it scrolls into view. */
function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === "undefined") {
            setShown(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "0px 0px -8% 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`wh-reveal ${shown ? "is-in" : ""} ${className}`}>
            {children}
        </div>
    );
}

/* ───────────────────────── Manifesto ───────────────────────── */

function Manifesto() {
    return (
        <section className="grid grid-cols-4 gap-x-2.5 px-5 pb-24 pt-5 md:pb-36">
            <div className="col-span-4 md:col-span-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={resized("/landing/wh-logo-red.png", 384)}
                    alt="Whiteheart"
                    width={132}
                    height={68}
                    className="h-auto w-[clamp(5.5rem,8.7vw,9rem)]"
                />
            </div>
            <Reveal className="col-span-4 mt-12 md:col-span-2 md:mt-0">
                {/* Placeholder wording built from the existing site copy; swap in the client's own brand story when it arrives. */}
                <p className="max-w-[27ch] text-[clamp(1.6rem,2.42vw,3rem)] font-medium leading-[1.06] tracking-[-0.04em] text-black">
                    WhiteHeart makes caps, tees and tracksuits for everyday wear. Built on simplicity and value, every
                    piece is made to be worn often, worn hard and kept.
                </p>
            </Reveal>
        </section>
    );
}

/* ───────────────────── Featured products ───────────────────── */

function FeaturedProducts({ products, loading }: { products: HomeProduct[]; loading: boolean }) {
    const rowRef = useRef<HTMLUListElement>(null);
    // The second pose is only downloaded once the pointer reaches a tile, and only shown once it has arrived.
    const [armed, setArmed] = useState<ReadonlySet<string>>(new Set());
    const [ready, setReady] = useState<ReadonlySet<string>>(new Set());
    const arm = (id: string) => setArmed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    const markReady = (id: string) => setReady((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

    const scrollRow = (direction: 1 | -1) => {
        const row = rowRef.current;
        if (!row) return;
        const tile = row.querySelector("li");
        const step = tile ? tile.getBoundingClientRect().width + 5 : row.clientWidth * 0.8;
        row.scrollBy({ left: direction * step * 2, behavior: "smooth" });
    };

    const tileSizes = "(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 78vw";
    const tileClass = "w-[78vw] flex-none snap-start sm:w-[46vw] lg:w-[23.6vw]";

    return (
        <section aria-labelledby="featured-heading" className="pb-24 md:pb-40">
            <div className="relative mb-6 flex items-center justify-center px-5">
                <h2 id="featured-heading" className={`${serif.className} text-[15px] uppercase leading-none tracking-[0.04em]`}>
                    ( Featured products )
                </h2>
                <div className="absolute right-5 hidden gap-1 md:flex">
                    <button
                        type="button"
                        onClick={() => scrollRow(-1)}
                        aria-label="Previous products"
                        className="flex h-8 w-8 items-center justify-center text-base transition-opacity hover:opacity-50"
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollRow(1)}
                        aria-label="Next products"
                        className="flex h-8 w-8 items-center justify-center text-base transition-opacity hover:opacity-50"
                    >
                        →
                    </button>
                </div>
            </div>

            {loading ? (
                <ul aria-hidden="true" className="flex gap-[5px] overflow-hidden">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <li key={i} className={tileClass}>
                            <div className="aspect-[2/3] animate-pulse bg-[#f1f1f1]" />
                        </li>
                    ))}
                </ul>
            ) : products.length === 0 ? (
                <p className={`${LABEL} px-5 py-16 text-center text-[#777]`}>No products available yet.</p>
            ) : (
                <ul
                    ref={rowRef}
                    className="flex snap-x gap-[5px] overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {products.map((product) => {
                        const shots = MODEL_SHOTS[product.id];
                        const own = product.images?.[0] || product.image_url;
                        const src = shots?.[0] ? shotSrc(shots[0]) : own ? resized(own, 640) : null;
                        const srcSet = shots?.[0] ? shotSrcSet(shots[0]) : own ? resizedSet(own, [384, 640, 828, 1080]) : undefined;
                        const second = shots?.[1];
                        return (
                            <li key={product.id} className={tileClass}>
                                <Link
                                    href={`/product/${product.id}`}
                                    className="group block"
                                    onPointerEnter={() => arm(product.id)}
                                    onFocus={() => arm(product.id)}
                                >
                                    <div
                                        className="relative aspect-[2/3] overflow-hidden bg-[#f1f1f1] bg-cover bg-center"
                                        style={shots?.[0]?.placeholder ? { backgroundImage: `url(${shots[0].placeholder})` } : undefined}
                                    >
                                        {src ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={src}
                                                srcSet={srcSet}
                                                sizes={srcSet ? tileSizes : undefined}
                                                onError={!shots?.[0] && own ? originalOnError(own) : undefined}
                                                alt={product.name.trim()}
                                                loading="lazy"
                                                decoding="async"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className={`${LABEL} flex h-full w-full items-center justify-center text-[#999]`}>
                                                No picture yet
                                            </div>
                                        )}
                                        {second && armed.has(product.id) && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={shotSrc(second)}
                                                srcSet={shotSrcSet(second)}
                                                sizes={tileSizes}
                                                alt=""
                                                decoding="async"
                                                onLoad={() => markReady(product.id)}
                                                className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ${
                                                    ready.has(product.id) ? "group-hover:opacity-100" : ""
                                                }`}
                                            />
                                        )}
                                        {isSoldOut(product) && (
                                            <span className={`${LABEL} absolute left-2.5 top-2.5 bg-black px-1.5 py-1 leading-none text-white`}>
                                                Sold out
                                            </span>
                                        )}
                                    </div>
                                    <div className={`${LABEL} flex items-baseline justify-between gap-4 px-5 pt-3 md:px-2.5`}>
                                        <h3 className="truncate">{product.name.trim()}</h3>
                                        <p className="flex-none text-[#6b6b6b]">₦{product.price.toLocaleString()}</p>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            <div className="mt-12 text-center">
                <Link href="/shop" className="group inline-block py-2">
                    <Bracketed>View all products</Bracketed>
                </Link>
            </div>
        </section>
    );
}

/* ──────────────────────── Entry tiles ──────────────────────── */

type Tile = {
    label: string;
    href: string;
    external?: boolean;
    alt: string;
    /** Classes for where the tile sits in the four-column grid, and the shape of its picture. */
    cell: string;
    frame: string;
    sizes: string;
    image: { src: string; srcSet?: string; placeholder?: string; position?: string };
};

const productsShot = MODEL_SHOTS["8e7bed4e-e891-4ce3-bb9e-7e22da238759"][0]; // The White Tee, first pose

// Three pictures of deliberately different sizes: one big, one short, one tall.
const TILES: Tile[] = [
    {
        label: "Our products",
        href: "/shop",
        alt: "A model in the Whiteheart White Tee",
        cell: "col-span-4 md:col-span-2",
        frame: "aspect-[5/6]",
        sizes: "(min-width: 768px) 50vw, 100vw",
        image: {
            src: shotSrc(productsShot),
            srcSet: shotSrcSet(productsShot),
            placeholder: productsShot.placeholder,
            position: "50% 12%",
        },
    },
    {
        label: "Headwear",
        href: "/shop?category=headwear",
        alt: "Three Whiteheart caps laid out on a blue sports court",
        cell: "col-span-2 md:col-span-1",
        frame: "aspect-[4/5]",
        sizes: "(min-width: 768px) 25vw, 50vw",
        image: {
            src: resized("/categories/category-6.jpeg", 828),
            srcSet: resizedSet("/categories/category-6.jpeg", [384, 640, 828, 1080]),
        },
    },
    {
        label: "Our community",
        href: INSTAGRAM,
        external: true,
        alt: "Two friends in Whiteheart tees on a tennis court",
        cell: "col-span-2 md:col-span-1",
        frame: "aspect-[2/3]",
        sizes: "(min-width: 768px) 25vw, 50vw",
        image: {
            src: resized("/categories/category-3.jpeg", 828),
            srcSet: resizedSet("/categories/category-3.jpeg", [384, 640, 828, 1080]),
        },
    },
];

function EntryTiles() {
    return (
        <section aria-label="Explore" className="grid grid-cols-4 items-start gap-x-2.5 gap-y-10 px-5 pb-28 md:pb-44">
            {TILES.map((tile) => {
                const inner = (
                    <>
                        <span className={`${LABEL} mb-2 block`}>{tile.label}</span>
                        <span
                            className={`relative block overflow-hidden bg-[#f1f1f1] bg-cover bg-center ${tile.frame}`}
                            style={tile.image.placeholder ? { backgroundImage: `url(${tile.image.placeholder})` } : undefined}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={tile.image.src}
                                srcSet={tile.image.srcSet}
                                sizes={tile.image.srcSet ? tile.sizes : undefined}
                                alt={tile.alt}
                                loading="lazy"
                                decoding="async"
                                style={tile.image.position ? { objectPosition: tile.image.position } : undefined}
                                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
                            />
                        </span>
                    </>
                );
                return (
                    <Reveal key={tile.label} className={tile.cell}>
                        {tile.external ? (
                            <a href={tile.href} target="_blank" rel="noopener noreferrer" className="group block">
                                {inner}
                            </a>
                        ) : (
                            <Link href={tile.href} className="group block">
                                {inner}
                            </Link>
                        )}
                    </Reveal>
                );
            })}
        </section>
    );
}

/* ─────────────────────── Delivery note ─────────────────────── */

function DeliveryNote() {
    return (
        <section aria-label="Delivery and returns" className="px-5 pb-28 text-center md:pb-40">
            <Reveal>
                <p className={`${serif.className} text-[clamp(1.05rem,1.35vw,1.5rem)] uppercase leading-[1.1] tracking-[0.02em]`}>
                    WH©{new Date().getFullYear()}
                    <br />
                    Free delivery on every order
                </p>
                <div className={`${LABEL} mt-7 grid grid-cols-4 items-start gap-x-2.5 text-[#4a4a4a]`}>
                    <p className="col-span-2 text-left md:col-span-1 md:text-center">Port Harcourt</p>
                    <p className="order-last col-span-4 mx-auto mt-6 max-w-[46ch] md:order-none md:col-span-2 md:mt-0">
                        Delivery is free on every order, straight to your door. Return unused items with their tags
                        within 14 days of delivery.
                    </p>
                    <p className="col-span-2 text-right md:col-span-1 md:text-center">Nigeria</p>
                </div>
                <Link href="/terms" className="group mt-8 inline-block py-2">
                    <Bracketed>Delivery and returns</Bracketed>
                </Link>
            </Reveal>
        </section>
    );
}

/* ─────────────────────── Lookbook strip ─────────────────────── */

const LOOKBOOK = [
    { src: "/categories/category-1.jpeg", alt: "A hooded figure in a pale blue Whiteheart tracksuit standing in a painted phone box", position: "50% 55%" },
    { src: "/categories/category-4.jpeg", alt: "Black and white photo of someone resting on a sofa in a Whiteheart tracksuit", position: "50% 40%" },
    { src: "/categories/category-5.jpeg", alt: "Side view of a hooded Whiteheart jacket against a pale wall", position: "50% 35%" },
];

function Lookbook() {
    return (
        <section aria-label="Lookbook" className={`${serif.className} relative bg-neutral-900 text-white`}>
            <ul className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible [&::-webkit-scrollbar]:hidden">
                {LOOKBOOK.map((photo) => (
                    <li key={photo.src} className="w-[84vw] flex-none snap-start md:w-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={resized(photo.src, 828)}
                            srcSet={resizedSet(photo.src, [640, 828, 1080])}
                            sizes="(min-width: 768px) 34vw, 84vw"
                            alt={photo.alt}
                            loading="lazy"
                            decoding="async"
                            style={{ objectPosition: photo.position }}
                            className="aspect-[3/4] w-full object-cover md:aspect-auto md:h-[min(100svh,58vw)]"
                        />
                    </li>
                ))}
            </ul>
            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-5 text-base italic leading-none [text-shadow:0_1px_12px_rgb(0_0_0/0.45)]">
                <span>WH_26</span>
                <span>Lookbook</span>
            </div>
        </section>
    );
}

/* ────────────────────────── Socials ────────────────────────── */

const SOCIALS = [
    { name: "Instagram", handle: "@whiteheartconcepts", note: "New pieces land here first.", action: "Follow", href: INSTAGRAM },
    { name: "TikTok", handle: "@whiteheart_outfits", note: "The pieces in motion.", action: "Follow", href: "https://www.tiktok.com/@whiteheart_outfits" },
    { name: "Pinterest", handle: "WhiteHeart", note: "Looks worth saving.", action: "Follow", href: "https://pin.it/7ptAQ8aEP" },
    { name: "X", handle: "@thebrandwh", note: "Drop news, as it happens.", action: "Follow", href: "https://x.com/thebrandwh?s=21" },
    { name: "WhatsApp", handle: "Chat with us", note: "Questions about sizes and stock, answered.", action: "Message", href: WHATSAPP },
];

function Community() {
    return (
        <section aria-labelledby="community-heading" className="pb-24 md:pb-36">
            <div className="px-5 pt-20 md:pt-28">
                <Reveal>
                    <h2
                        id="community-heading"
                        className={`${serif.className} text-[clamp(4rem,12.4vw,13rem)] uppercase leading-[0.82] tracking-[-0.035em]`}
                    >
                        First to
                        <br />
                        the drop
                    </h2>
                </Reveal>
                <div className="mt-16 grid grid-cols-4 gap-x-2.5 md:mt-28">
                    <Reveal className="col-span-4 md:col-span-2 md:col-start-3">
                        <h3 className={LABEL}>On our socials</h3>
                        <p className="mt-1 max-w-[62ch] text-[13px] font-medium leading-[1.3] tracking-[-0.01em] text-[#555]">
                            New pieces land on our socials first. Follow WhiteHeart to see each drop before it reaches
                            the shop, or message us on WhatsApp with any questions about sizes and stock.
                        </p>
                    </Reveal>
                </div>
            </div>

            <div className="mt-20 grid grid-cols-1 md:mt-28 md:grid-cols-2">
                <div className="px-5 md:pr-2.5">
                    <h3 className={`${LABEL} mb-3`}>Where to find us</h3>
                    <ul>
                        {SOCIALS.map((social) => (
                            <li key={social.name} className="border-t border-black/25 last:border-b">
                                <a
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group grid grid-cols-2 gap-x-2.5 py-3.5 transition-colors hover:bg-[#f4f4f4] md:min-h-[7.5rem]"
                                >
                                    <span className="self-start">
                                        <Bracketed>{social.action}</Bracketed>
                                    </span>
                                    <span>
                                        <span className={`${LABEL} block`}>{social.name}</span>
                                        <span className="mt-0.5 block text-[13px] font-medium leading-[1.3] tracking-[-0.01em] text-[#555]">
                                            {social.handle}
                                            <br />
                                            {social.note}
                                        </span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative order-first mb-10 aspect-[4/3] bg-neutral-900 md:order-none md:mb-0 md:aspect-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={resized("/categories/category-2.jpeg", 1080)}
                        srcSet={resizedSet("/categories/category-2.jpeg", [640, 828, 1080])}
                        sizes="(min-width: 768px) 50vw, 100vw"
                        alt="Close-up of a black Whiteheart tee with a silver graphic and a Whiteheart chain"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </div>
            </div>
        </section>
    );
}

export default function HomeSections({ products, loading }: { products: HomeProduct[]; loading: boolean }) {
    return (
        <div className={`${grotesk.className} bg-white text-black`}>
            <Manifesto />
            <FeaturedProducts products={products} loading={loading} />
            <EntryTiles />
            <DeliveryNote />
            <Lookbook />
            <Community />
        </div>
    );
}
