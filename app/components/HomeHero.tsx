"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { grotesk, serif } from "./landingFonts";

type Slide = {
    image: string;
    alt: string;
    title: string;
    lines: string[];
    href: string;
    external?: boolean;
    /** Where the subject sits in the frame, so narrow screens crop onto it. */
    focus: string;
};

// Reorder this list to change which image opens the page.
const SLIDES: Slide[] = [
    {
        image: "/landing/hero-street-a",
        alt: "Two friends walking down a city street, one in the Whiteheart cream and red cap, the other in the hands-and-heart beanie",
        title: "Shop now",
        lines: ["Caps, beanies and sets", "straight off the line"],
        href: "/shop",
        focus: "76% 50%",
    },
    {
        image: "/landing/hero-cap",
        alt: "The Whiteheart cream and red cap resting on a granite wall",
        title: "Headwear",
        lines: ["Caps and beanies,", "topped off right"],
        href: "/shop?category=headwear",
        focus: "77% 60%",
    },
    {
        image: "/landing/hero-street-b",
        alt: "Two friends laughing as they walk past a shopfront, wearing the Whiteheart cap and beanie",
        title: "Community",
        lines: ["New pieces land on", "our socials first"],
        href: "https://www.instagram.com/whiteheartconcepts?srtk=MWt5cWZ6aWRuczNqcw%3D%3D&utm_source=qr",
        external: true,
        focus: "78% 50%",
    },
];

const INTERVAL_MS = 7000;

export default function HomeHero() {
    // "prev" is the slide being covered; "turn" is 0 until the first change so the first image never animates in.
    const [{ active, prev, turn }, setShow] = useState({ active: 0, prev: -1, turn: 0 });
    const [paused, setPaused] = useState(false);

    const goTo = (next: number | ((current: number) => number)) => {
        setShow((s) => {
            const target = typeof next === "function" ? next(s.active) : next;
            return target === s.active ? s : { active: target, prev: s.active, turn: s.turn + 1 };
        });
    };
    const reducedMotion = useRef(false);

    useEffect(() => {
        reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    useEffect(() => {
        if (paused || reducedMotion.current) return;
        const timer = setTimeout(() => goTo((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
        return () => clearTimeout(timer);
    }, [active, paused]);

    const slide = SLIDES[active];

    const handleScrollDown = () => {
        document.getElementById("after-hero")?.scrollIntoView({ behavior: "smooth" });
    };

    const headline = (
        <>
            <span className="mb-1 block text-white">{slide.title}</span>
            {slide.lines.map((line) => (
                <span key={line} className="block text-white/50">
                    {line}
                </span>
            ))}
        </>
    );

    const headlineClass =
        "block max-w-[20ch] text-[clamp(1.75rem,2.78vw,3.4rem)] font-semibold uppercase leading-none tracking-[-0.03em] outline-offset-8 transition-opacity hover:opacity-85";

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Featured"
            className={`${grotesk.className} relative h-[100svh] min-h-[560px] w-full overflow-clip bg-neutral-900 text-white`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            {/* Images: the new slide drops down from the top over the old one. Clipped in their own box so the zoom never makes the hero scrollable. */}
            <div className="absolute inset-0 isolate overflow-clip">
            {SLIDES.map((s, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    key={s.image}
                    src={`${s.image}.jpg`}
                    srcSet={`${s.image}-1280.jpg 1280w, ${s.image}.jpg 2400w`}
                    sizes="100vw"
                    alt={i === active ? s.alt : ""}
                    aria-hidden={i !== active}
                    loading="eager"
                    fetchPriority={i === 0 ? "high" : "low"}
                    decoding="async"
                    style={{ objectPosition: s.focus }}
                    className={`absolute inset-0 h-full w-full object-cover ${
                        i === active
                            ? `z-10 ${turn > 0 ? "hero-drop" : ""}`
                            : i === prev
                              ? "z-0 hero-out"
                              : "invisible"
                    }`}
                />
            ))}
            </div>

            {/* Tint so white type holds on any image */}
            <div className="pointer-events-none absolute inset-0 bg-black/25" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/35 to-transparent" />

            {/* Slide numbers on the mid-line */}
            <div
                className={`${serif.className} absolute inset-x-0 top-1/2 grid -translate-y-1/2 grid-cols-4 items-center gap-x-2.5 px-5 italic`}
            >
                {SLIDES.map((s, i) => (
                    <button
                        key={s.image}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Show slide ${i + 1}: ${s.title}`}
                        aria-current={i === active}
                        className={`group relative row-start-1 justify-self-start py-3 pr-4 text-left leading-none transition-[font-size,opacity] duration-500 hover:opacity-100 motion-reduce:transition-none ${
                            i === 0 ? "col-start-1" : i === 1 ? "col-start-3" : "col-start-4"
                        } ${i === active ? "text-[2rem] opacity-100" : "text-base opacity-80"}`}
                    >
                        0{i + 1}
                        {/* Preview of that slide, shown on hover or keyboard focus */}
                        {i !== active && (
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute left-0 top-full hidden w-[clamp(5.5rem,7.55vw,9.5rem)] overflow-hidden opacity-0 [clip-path:inset(0_0_100%_0)] transition-[clip-path,opacity] duration-500 ease-out group-hover:opacity-100 group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:opacity-100 group-focus-visible:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none md:block"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`${s.image}.jpg`}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    style={{ objectPosition: s.focus }}
                                    className="aspect-[4/5] w-full object-cover"
                                />
                            </span>
                        )}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={handleScrollDown}
                    className="col-start-4 row-start-1 justify-self-end py-3 pl-4 text-base leading-none opacity-80 transition-opacity hover:opacity-100"
                >
                    Scroll
                </button>
            </div>

            {/* Headline, bottom-left */}
            <div key={active} className="hero-text-in absolute bottom-7 left-5 right-5 md:bottom-5">
                {slide.external ? (
                    <a href={slide.href} target="_blank" rel="noopener noreferrer" className={headlineClass}>
                        {headline}
                    </a>
                ) : (
                    <Link href={slide.href} className={headlineClass}>
                        {headline}
                    </Link>
                )}
            </div>
        </section>
    );
}
