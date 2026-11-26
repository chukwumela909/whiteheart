"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import LandingFooter from "@/app/components/LandingFooter";
import { GROTESK_PRELOAD, grotesk } from "@/app/components/landingFonts";
import { categoryKey, matchesCategory } from "@/lib/categories";
import { isSoldOut } from "@/lib/stock";
import { MODEL_SHOTS, shotSrc, shotSrcSet } from "@/lib/modelShots";
import { originalOnError, resized, resizedSet } from "@/lib/img";

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    images: string[] | null;
    category: string;
    colors: { name: string; hex: string }[] | null;
    stock_quantity: number;
    sizes: { name: string; stock: number }[] | null;
}

const PAGE_SIZE = 24;

const SORTS = [
    { key: "default", label: "Newest" },
    { key: "price-low", label: "Price: low to high" },
    { key: "price-high", label: "Price: high to low" },
    { key: "name", label: "Name: A to Z" },
];

const PRICE_BANDS = [
    { key: "under-50", label: "Under ₦50,000", test: (p: number) => p < 50000 },
    { key: "50-100", label: "₦50,000 to ₦100,000", test: (p: number) => p >= 50000 && p <= 100000 },
    { key: "over-100", label: "Over ₦100,000", test: (p: number) => p > 100000 },
];

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const toggleIn = (set: Set<string>, key: string) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
};

// useSearchParams needs a Suspense boundary in the App Router.
export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <ShopContent />
        </Suspense>
    );
}

function ShopContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    // The category and page live in the URL (/shop?category=caps&page=2) so
    // homepage tiles and shared links open the right view.
    const rawCategory = searchParams.get("category");
    const selectedCategory = categoryKey(rawCategory) || "all";
    const requestedPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

    const [sortBy, setSortBy] = useState("default");
    const [sortOpen, setSortOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [openSection, setOpenSection] = useState<string | null>("category");
    const [sizeFilter, setSizeFilter] = useState<Set<string>>(new Set());
    const [priceFilter, setPriceFilter] = useState<Set<string>>(new Set());
    const [inStockOnly, setInStockOnly] = useState(false);
    // "dense" is 4 across on desktop and 2 on phones; "large" is 2 and 1.
    const [density, setDensity] = useState<"dense" | "large">("dense");
    // Hover photos: which tiles the pointer has reached (start downloading) and which have finished
    const [hoverArmed, setHoverArmed] = useState<Set<string>>(new Set());
    const [hoverReady, setHoverReady] = useState<Set<string>>(new Set());
    const armHover = (id: string) => setHoverArmed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    const markHoverReady = (id: string) => setHoverReady((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    const sortRef = useRef<HTMLDivElement>(null);

    const supabase = createClient();

    useEffect(() => {
        loadProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (error) throw error;

            setProducts(data || []);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter drawer: close on Escape and stop the page scrolling behind it
    useEffect(() => {
        if (!filterOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setFilterOpen(false);
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        // Lets globals.css hide the chat bubble, which would cover the Reset button.
        document.body.dataset.shopDrawer = "open";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            delete document.body.dataset.shopDrawer;
            window.removeEventListener("keydown", onKey);
        };
    }, [filterOpen]);

    // Sort menu: close on Escape or a click anywhere else
    useEffect(() => {
        if (!sortOpen) return;
        const onDown = (e: MouseEvent) => {
            if (!sortRef.current?.contains(e.target as Node)) setSortOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSortOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [sortOpen]);

    // One filter per category, even if it was typed differently on different
    // products ("Caps" / "caps "). The first spelling seen is used as the label.
    const categories = useMemo(() => {
        const list: { key: string; label: string }[] = [{ key: "all", label: "All" }];
        for (const p of products) {
            const key = categoryKey(p.category);
            if (key && !list.some((c) => c.key === key)) {
                list.push({ key, label: p.category.trim() });
            }
        }
        return list;
    }, [products]);

    const sizeOptions = useMemo(() => {
        const names = new Set<string>();
        for (const p of products) for (const s of p.sizes ?? []) names.add(s.name.trim());
        const rank = (n: string) => {
            const i = SIZE_ORDER.indexOf(n.toUpperCase());
            return i === -1 ? SIZE_ORDER.length : i;
        };
        return [...names].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
    }, [products]);

    const goTo = (category: string, page: number) => {
        const params = new URLSearchParams();
        if (category !== "all") params.set("category", category);
        if (page > 1) params.set("page", String(page));
        const query = params.toString();
        router.replace(query ? `/shop?${query}` : "/shop", { scroll: false });
    };

    const selectCategory = (key: string) => goTo(key, 1);

    const changePage = (page: number) => {
        goTo(selectedCategory, page);
        window.scrollTo({ top: 0 });
    };

    // Any filter change starts again from the first page.
    const resetPage = () => {
        if (requestedPage > 1) goTo(selectedCategory, 1);
    };

    const isActiveCategory = (cat: { key: string; label: string }) =>
        cat.key === "all"
            ? selectedCategory === "all"
            : selectedCategory !== "all" && matchesCategory(cat.label, selectedCategory);

    const filteredProducts = useMemo(() => {
        let list = products;

        if (selectedCategory !== "all") {
            list = list.filter((p) => matchesCategory(p.category, selectedCategory));
        }
        if (sizeFilter.size > 0) {
            list = list.filter((p) =>
                (p.sizes ?? []).some((s) => sizeFilter.has(s.name.trim()) && (Number(s.stock) || 0) > 0)
            );
        }
        if (priceFilter.size > 0) {
            list = list.filter((p) => PRICE_BANDS.some((b) => priceFilter.has(b.key) && b.test(p.price)));
        }
        if (inStockOnly) {
            list = list.filter((p) => !isSoldOut(p));
        }

        switch (sortBy) {
            case "price-low":
                return [...list].sort((a, b) => a.price - b.price);
            case "price-high":
                return [...list].sort((a, b) => b.price - a.price);
            case "name":
                return [...list].sort((a, b) => a.name.localeCompare(b.name));
            default:
                // Newest first, as loaded
                return list;
        }
    }, [products, selectedCategory, sizeFilter, priceFilter, inStockOnly, sortBy]);

    const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
    const page = Math.min(requestedPage, pageCount);
    const pageProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const activeFilterCount = sizeFilter.size + priceFilter.size + (inStockOnly ? 1 : 0);

    const resetFilters = () => {
        setSizeFilter(new Set());
        setPriceFilter(new Set());
        setInStockOnly(false);
        resetPage();
    };

    const title =
        selectedCategory === "all"
            ? "Shop all"
            : categories.find((c) => c.key === selectedCategory)?.label ?? rawCategory?.trim() ?? "Shop all";

    // Page links: first, last and the pages around the current one.
    const pageLinks: (number | "gap")[] = [];
    for (let n = 1; n <= pageCount; n++) {
        if (n === 1 || n === pageCount || Math.abs(n - page) <= 1 || (page <= 3 && n <= 4) || (page >= pageCount - 2 && n >= pageCount - 3)) {
            pageLinks.push(n);
        } else if (pageLinks[pageLinks.length - 1] !== "gap") {
            pageLinks.push("gap");
        }
    }

    const gridClass =
        density === "dense" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 lg:grid-cols-2";
    // How wide a tile is on screen, so the browser can pick the sharpest model photo for it
    const tileSizes =
        density === "dense" ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1024px) 50vw, 100vw";

    const toolbarButton =
        "flex h-11 items-center gap-2 text-xs uppercase tracking-[0.07em] text-[#252525] transition-opacity hover:opacity-60";

    return (
        <div className={`${grotesk.className} bg-white text-[#252525]`}>
            <link rel="preload" href={GROTESK_PRELOAD} as="font" type="font/woff2" crossOrigin="anonymous" />
            <div className="sticky top-0 z-40">
                <Navbar variant="shop" />
            </div>

            <main className="min-h-[70vh]">
                {/* Title and category pills */}
                <div className="px-4 pt-8 md:px-[42px] md:pt-[50px]">
                    <h1 className="text-lg font-medium uppercase leading-snug tracking-[0.07em]">{title}</h1>
                </div>
                <div
                    className="mt-6 flex gap-3.5 overflow-x-auto px-4 pb-6 [scrollbar-width:none] md:mt-10 md:px-[42px] md:pb-7 [&::-webkit-scrollbar]:hidden"
                    role="group"
                    aria-label="Categories"
                >
                    {categories.map((category) => {
                        const active = isActiveCategory(category);
                        return (
                            <button
                                key={category.key}
                                type="button"
                                onClick={() => selectCategory(category.key)}
                                aria-pressed={active}
                                className={`h-10 shrink-0 whitespace-nowrap rounded-full border border-black px-5 text-[13px] uppercase tracking-[0.07em] transition-colors ${
                                    active ? "bg-black text-white" : "bg-white text-[#292929] hover:bg-black hover:text-white"
                                }`}
                            >
                                {category.label}
                            </button>
                        );
                    })}
                </div>

                {/* Offer band */}
                <div className="flex min-h-[84px] flex-col items-center justify-center bg-[#fc0420] px-4 py-4 text-center text-white md:min-h-[103px]">
                    <p className="text-2xl font-bold uppercase leading-none tracking-[0.01em] md:text-[2rem]">
                        Free delivery
                    </p>
                    <p className="mt-1 text-sm font-bold uppercase leading-tight tracking-[0.03em] md:text-lg">
                        On every order
                    </p>
                </div>

                {/* Toolbar: layout switch, filter, sort */}
                <div className="sticky top-[92px] z-30 flex h-14 items-center justify-between bg-white px-4 md:top-[116px] md:px-[42px]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1" role="group" aria-label="Grid layout">
                            <button
                                type="button"
                                onClick={() => setDensity("large")}
                                aria-pressed={density === "large"}
                                aria-label="Larger pictures"
                                className={`flex h-9 w-8 items-center justify-center transition-colors ${
                                    density === "large" ? "text-[#252525]" : "text-[#c4c4c4] hover:text-[#252525]"
                                }`}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                                    <rect x="0" y="0" width="8" height="8" />
                                    <rect x="10" y="0" width="8" height="8" />
                                    <rect x="0" y="10" width="8" height="8" />
                                    <rect x="10" y="10" width="8" height="8" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDensity("dense")}
                                aria-pressed={density === "dense"}
                                aria-label="Smaller pictures"
                                className={`flex h-9 w-8 items-center justify-center transition-colors ${
                                    density === "dense" ? "text-[#252525]" : "text-[#c4c4c4] hover:text-[#252525]"
                                }`}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                                    {[0, 6.5, 13].map((y) =>
                                        [0, 6.5, 13].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" />)
                                    )}
                                </svg>
                            </button>
                        </div>
                        {!loading && (
                            <p className="text-xs uppercase tracking-[0.07em] text-[#7a7a7a]" aria-live="polite">
                                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-6 md:gap-10">
                        <button
                            type="button"
                            onClick={() => setFilterOpen(true)}
                            aria-haspopup="dialog"
                            className={toolbarButton}
                        >
                            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                                <path d="M4 8h9M19 8h1M4 16h1M11 16h9" />
                                <circle cx="16" cy="8" r="2.5" />
                                <circle cx="8" cy="16" r="2.5" />
                            </svg>
                        </button>
                        <div className="relative" ref={sortRef}>
                            <button
                                type="button"
                                onClick={() => setSortOpen((open) => !open)}
                                aria-haspopup="listbox"
                                aria-expanded={sortOpen}
                                className={toolbarButton}
                            >
                                Sort by
                                <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 10 10"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                    aria-hidden="true"
                                    className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
                                >
                                    <path d="M1 3l4 4 4-4" />
                                </svg>
                            </button>
                            {sortOpen && (
                                <ul
                                    role="listbox"
                                    aria-label="Sort by"
                                    className="absolute right-0 top-full z-10 w-56 border border-[#e5e5e5] bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                                >
                                    {SORTS.map((option) => (
                                        <li key={option.key} role="option" aria-selected={sortBy === option.key}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSortBy(option.key);
                                                    setSortOpen(false);
                                                    resetPage();
                                                }}
                                                className={`flex h-10 w-full items-center px-5 text-left text-xs uppercase tracking-[0.07em] hover:bg-[#f4f4f4] ${
                                                    sortBy === option.key ? "font-semibold text-black" : "text-[#555]"
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product grid */}
                <div className="px-3 pb-16 md:px-[42px] md:pb-24">
                    {loading ? (
                        <div className={`grid gap-x-[5px] gap-y-10 md:gap-x-[7px] md:gap-y-14 ${gridClass}`} aria-hidden="true">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i}>
                                    <div className="aspect-[2/3] animate-pulse bg-[#f1f1f1]" />
                                    <div className="mt-5 h-3 w-2/3 animate-pulse bg-[#f1f1f1]" />
                                    <div className="mt-4 h-3 w-1/4 animate-pulse bg-[#f1f1f1]" />
                                </div>
                            ))}
                        </div>
                    ) : pageProducts.length === 0 ? (
                        <div className="py-24 text-center">
                            <h2 className="text-lg font-medium uppercase tracking-[0.07em]">No products found</h2>
                            <p className="mt-3 text-sm tracking-[0.04em] text-[#666]">
                                {activeFilterCount > 0
                                    ? "Nothing matches these filters."
                                    : selectedCategory !== "all"
                                      ? "Nothing in this category yet."
                                      : "Check back soon for new products."}
                            </p>
                            {(activeFilterCount > 0 || selectedCategory !== "all") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSizeFilter(new Set());
                                        setPriceFilter(new Set());
                                        setInStockOnly(false);
                                        goTo("all", 1);
                                    }}
                                    className="mt-8 h-11 border border-black px-8 text-xs font-medium uppercase tracking-[0.1em] transition-colors hover:bg-black hover:text-white"
                                >
                                    View all products
                                </button>
                            )}
                        </div>
                    ) : (
                        <ul className={`grid gap-x-[5px] gap-y-10 md:gap-x-[7px] md:gap-y-14 ${gridClass}`}>
                            {pageProducts.map((product, index) => {
                                const shots = MODEL_SHOTS[product.id];
                                // Products without model photos fall back to their own photos, resized for the tile
                                const TILE_WIDTHS = [384, 640, 828, 1080];
                                const ownFirst = product.images?.[0] || product.image_url;
                                const ownSecond = product.images?.[1];
                                const imageUrl = shots?.[0] ? shotSrc(shots[0]) : ownFirst && resized(ownFirst, 640);
                                const secondImageUrl = shots?.[1] ? shotSrc(shots[1]) : ownSecond && resized(ownSecond, 640);
                                const firstSrcSet = shots?.[0] ? shotSrcSet(shots[0]) : ownFirst ? resizedSet(ownFirst, TILE_WIDTHS) : undefined;
                                const secondSrcSet = shots?.[1] ? shotSrcSet(shots[1]) : ownSecond ? resizedSet(ownSecond, TILE_WIDTHS) : undefined;
                                const soldOut = isSoldOut(product);
                                const sizes = product.sizes ?? [];

                                return (
                                    <li key={product.id}>
                                        <Link
                                            href={`/product/${product.id}`}
                                            className="group block"
                                            onPointerEnter={() => armHover(product.id)}
                                            onFocus={() => armHover(product.id)}
                                        >
                                            <div
                                                className="relative aspect-[2/3] overflow-hidden bg-[#f1f1f1] bg-cover bg-center"
                                                style={
                                                    shots?.[0]?.placeholder
                                                        ? { backgroundImage: `url(${shots[0].placeholder})` }
                                                        : undefined
                                                }
                                            >
                                                {imageUrl ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={imageUrl}
                                                            srcSet={firstSrcSet}
                                                            sizes={firstSrcSet ? tileSizes : undefined}
                                                            onError={!shots?.[0] && ownFirst ? originalOnError(ownFirst) : undefined}
                                                            alt={product.name.trim()}
                                                            loading={index < 4 ? "eager" : "lazy"}
                                                            fetchPriority={index < 4 ? "high" : "auto"}
                                                            decoding="async"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        {/* The hover photo is only downloaded once the pointer reaches the tile,
                                                            and only shown once it has fully arrived */}
                                                        {secondImageUrl && hoverArmed.has(product.id) && (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img
                                                                src={secondImageUrl}
                                                                srcSet={secondSrcSet}
                                                                sizes={secondSrcSet ? tileSizes : undefined}
                                                                alt=""
                                                                decoding="async"
                                                                onLoad={() => markHoverReady(product.id)}
                                                                className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ${
                                                                    hoverReady.has(product.id) ? "group-hover:opacity-100" : ""
                                                                }`}
                                                            />
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.1em] text-[#999]">
                                                        No picture yet
                                                    </div>
                                                )}

                                                {soldOut && (
                                                    <span className="absolute left-2.5 top-2.5 bg-white px-1.5 py-1 text-[11px] uppercase leading-none tracking-[0.07em] text-[#252525]">
                                                        Sold out
                                                    </span>
                                                )}

                                                {/* Sizes slide up over the picture on hover (desktop) */}
                                                {sizes.length > 0 && !soldOut && (
                                                    <div
                                                        aria-hidden="true"
                                                        className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full text-center text-[11px] uppercase tracking-[0.07em] transition-transform duration-300 group-hover:translate-y-0 lg:block"
                                                    >
                                                        <p className="bg-[#f1f1f1] py-2 leading-none text-[#252525]">Size</p>
                                                        <p className="flex justify-center gap-4 bg-white py-3 leading-none">
                                                            {sizes.map((size) => (
                                                                <span
                                                                    key={size.name}
                                                                    className={
                                                                        (Number(size.stock) || 0) > 0
                                                                            ? "text-[#252525]"
                                                                            : "text-[#b5b5b5] line-through"
                                                                    }
                                                                >
                                                                    {size.name}
                                                                </span>
                                                            ))}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <h2 className="mt-4 text-[11px] font-medium uppercase leading-[1.5] tracking-[0.07em] group-hover:underline md:mt-[19px]">
                                                {product.name.trim()}
                                                {sizes.length > 0 && (
                                                    <span className="sr-only">
                                                        {`, sizes ${sizes
                                                            .filter((s) => (Number(s.stock) || 0) > 0)
                                                            .map((s) => s.name)
                                                            .join(", ")}`}
                                                    </span>
                                                )}
                                            </h2>
                                            <p className="mt-2.5 text-xs font-semibold leading-none tracking-[0.06em] md:mt-4">
                                                ₦{product.price.toLocaleString()}
                                            </p>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {/* Page numbers */}
                    {!loading && pageCount > 1 && (
                        <nav aria-label="Pages" className="mt-20 flex justify-center md:mt-24">
                            <ul className="flex items-stretch border-b border-[#ddd] text-sm">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => changePage(page - 1)}
                                        disabled={page === 1}
                                        aria-label="Previous page"
                                        className="flex h-[46px] w-11 items-center justify-center disabled:opacity-30 md:w-[63px]"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
                                            <path d="M7 1 3 5l4 4" />
                                        </svg>
                                    </button>
                                </li>
                                {pageLinks.map((item, i) =>
                                    item === "gap" ? (
                                        <li key={`gap-${i}`} className="flex h-[46px] w-11 items-center justify-center md:w-[63px]" aria-hidden="true">
                                            …
                                        </li>
                                    ) : (
                                        <li key={item}>
                                            <button
                                                type="button"
                                                onClick={() => changePage(item)}
                                                aria-label={`Page ${item}`}
                                                aria-current={item === page ? "page" : undefined}
                                                className={`-mb-px flex h-[47px] w-11 items-center justify-center border-b md:w-[63px] ${
                                                    item === page ? "border-black" : "border-transparent hover:border-[#999]"
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        </li>
                                    )
                                )}
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => changePage(page + 1)}
                                        disabled={page === pageCount}
                                        aria-label="Next page"
                                        className="flex h-[46px] w-11 items-center justify-center disabled:opacity-30 md:w-[63px]"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
                                            <path d="M3 1l4 4-4 4" />
                                        </svg>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>

                {/* Collection note */}
                <div className="px-4 pb-12 md:px-[42px] md:pb-14">
                    <h2 className="text-lg font-medium uppercase leading-snug tracking-[0.07em]">{title}</h2>
                    <p className="mt-4 max-w-[1320px] text-sm leading-relaxed tracking-[0.06em]">
                        Every Whiteheart piece in one place. Delivery is free on every order.
                    </p>
                </div>
            </main>

            <LandingFooter />

            {/* Filter drawer */}
            <div
                className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
                    filterOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={() => setFilterOpen(false)}
                aria-hidden="true"
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
                inert={!filterOpen}
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col bg-white text-[#252525] transition-transform duration-300 ease-out ${
                    filterOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="relative flex h-[58px] shrink-0 items-center justify-center border-b border-[#e5e5e5]">
                    <h2 className="text-sm uppercase tracking-[0.1em]">Filters</h2>
                    <button
                        type="button"
                        onClick={() => setFilterOpen(false)}
                        aria-label="Close filters"
                        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center transition-opacity hover:opacity-60"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
                            <path d="M1 1l12 12M13 1 1 13" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <FilterSection id="category" label="Category" open={openSection} onToggle={setOpenSection}>
                        {categories.map((category) => (
                            <FilterOption
                                key={category.key}
                                type="radio"
                                name="shop-category"
                                label={category.label}
                                checked={isActiveCategory(category)}
                                onChange={() => selectCategory(category.key)}
                            />
                        ))}
                    </FilterSection>
                    {sizeOptions.length > 0 && (
                        <FilterSection id="size" label="Size" open={openSection} onToggle={setOpenSection}>
                            {sizeOptions.map((size) => (
                                <FilterOption
                                    key={size}
                                    type="checkbox"
                                    label={size}
                                    checked={sizeFilter.has(size)}
                                    onChange={() => {
                                        setSizeFilter((current) => toggleIn(current, size));
                                        resetPage();
                                    }}
                                />
                            ))}
                        </FilterSection>
                    )}
                    <FilterSection id="price" label="Price" open={openSection} onToggle={setOpenSection}>
                        {PRICE_BANDS.map((band) => (
                            <FilterOption
                                key={band.key}
                                type="checkbox"
                                label={band.label}
                                checked={priceFilter.has(band.key)}
                                onChange={() => {
                                    setPriceFilter((current) => toggleIn(current, band.key));
                                    resetPage();
                                }}
                            />
                        ))}
                    </FilterSection>
                    <FilterSection id="availability" label="Availability" open={openSection} onToggle={setOpenSection}>
                        <FilterOption
                            type="checkbox"
                            label="In stock only"
                            checked={inStockOnly}
                            onChange={() => {
                                setInStockOnly((current) => !current);
                                resetPage();
                            }}
                        />
                    </FilterSection>
                </div>

                <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-[#e5e5e5] p-5">
                    <button
                        type="button"
                        onClick={() => setFilterOpen(false)}
                        className="h-12 bg-[#252525] text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-black"
                    >
                        See {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            resetFilters();
                            if (selectedCategory !== "all") goTo("all", 1);
                        }}
                        className="h-12 border border-[#252525] text-xs font-medium uppercase tracking-[0.1em] transition-colors hover:bg-[#252525] hover:text-white"
                    >
                        Reset
                    </button>
                </div>
            </aside>
        </div>
    );
}

function FilterSection({
    id,
    label,
    open,
    onToggle,
    children,
}: {
    id: string;
    label: string;
    open: string | null;
    onToggle: (id: string | null) => void;
    children: React.ReactNode;
}) {
    const isOpen = open === id;
    return (
        <section className="border-b border-[#e5e5e5]">
            <button
                type="button"
                onClick={() => onToggle(isOpen ? null : id)}
                aria-expanded={isOpen}
                aria-controls={`filter-${id}`}
                className="flex h-[60px] w-full items-center justify-between px-5 text-xs uppercase tracking-[0.1em]"
            >
                {label}
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M0.5 5.5h10" />
                    {!isOpen && <path d="M5.5 0.5v10" />}
                </svg>
            </button>
            <div id={`filter-${id}`} hidden={!isOpen} className="px-5 pb-4">
                {children}
            </div>
        </section>
    );
}

function FilterOption({
    type,
    name,
    label,
    checked,
    onChange,
}: {
    type: "checkbox" | "radio";
    name?: string;
    label: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <label className="flex h-11 cursor-pointer items-center gap-3 text-[13px] uppercase tracking-[0.07em]">
            <input
                type={type}
                name={name}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 shrink-0 accent-black"
            />
            {label}
        </label>
    );
}
