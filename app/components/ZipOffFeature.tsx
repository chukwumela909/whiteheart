// "Trousers or shorts": shows that the 2Track Suit trousers zip off at the knee.
// Used on the homepage and on the 2Track Suit product page. Photos are the client's own (sent 2026-11-27).
import Link from "next/link";
import { serif } from "./landingFonts";
import { resized, resizedSet } from "@/lib/img";

export const TRACKSUIT_ID = "d3b8c8b2-993f-4d5b-b230-5a53f2ec8dd8";

const KNEE = "/categories/zip-off-knee.jpg";
const WALK = "/categories/zip-off-walk.jpg";
// Tiny blurred copies shown while the photos load.
const KNEE_PLACEHOLDER =
    "data:image/webp;base64,UklGRqoAAABXRUJQVlA4IJ4AAAAQBACdASoQABgAPu1iqU2ppaOiMAgBMB2JYgCdACDpbBq5Otys6cq7cAD+m24tc4N17DJvtxGIk98LC7LJEn1mZuZUXyWSk7zAqjis7rdNRo2SGvc6MC/uZrqmRIgZyiTo1hD+a2KCunVL8dggqKTa2S3D6Gm6XpD3KAI3KK4mGd5II76Ees3H4LtGXAiJqzl9Ckreqld18RONOUJQAA==";
const WALK_PLACEHOLDER =
    "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAACwAwCdASoQABUAPu1iqU2ppaOiMAgBMB2JaAC7MoABd1Xl2O/c4AD+ugPp2KgpA2l0ST3rNKxvG+9RIg7v+XI2RsYKpZa4WdH5VUv90LXKTBZYCWoeHhasAhU+Ser3gisZ1vR2i2ytsLoCO/rlXf2X0Vq6gAAA";

const LABEL = "text-[11px] font-bold uppercase leading-[1.25] tracking-[0.01em]";

const STEPS = [
    { title: "Unzip at the knee", text: "The zip runs round each leg just below the knee, along the white trim." },
    { title: "Slide the lower leg off", text: "Pull it down and off. The top half stays on as shorts." },
    { title: "Zip it back on", text: "Put the lower legs back whenever you want full length again." },
];

export default function ZipOffFeature({ shopLink = true }: { shopLink?: boolean }) {
    return (
        <section aria-labelledby="zip-off-heading" className="px-5 pb-28 md:pb-44">
            <p className={`${serif.className} mb-6 text-center text-[15px] uppercase leading-none tracking-[0.04em]`}>
                ( The 2Track Suit )
            </p>

            <div className="grid grid-cols-4 gap-x-2.5 gap-y-12">
                {/* The zip, close up */}
                <figure className="col-span-4 md:col-span-2">
                    <div
                        className="relative aspect-[2/3] overflow-hidden bg-[#f1f1f1] bg-cover bg-center"
                        style={{ backgroundImage: `url(${KNEE_PLACEHOLDER})` }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={resized(KNEE, 828)}
                            srcSet={resizedSet(KNEE, [640, 828])}
                            sizes="(min-width: 768px) 50vw, 100vw"
                            alt="Close-up of the 2Track Suit trousers with the lower part of one leg unzipped at the knee and sliding down"
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        {/* Marks where the zip is */}
                        <span aria-hidden="true" className="absolute left-[57%] top-[74.5%] -translate-x-1/2 -translate-y-1/2">
                            <span className="absolute inset-0 rounded-full bg-white/70 motion-safe:animate-ping" />
                            <span className="relative block h-3.5 w-3.5 rounded-full border-2 border-white bg-black/80" />
                        </span>
                        <span
                            aria-hidden="true"
                            className={`${LABEL} absolute left-[57%] top-[74.5%] ml-4 -translate-y-1/2 whitespace-nowrap bg-white px-2 py-1 text-black`}
                        >
                            Zips off here
                        </span>
                    </div>
                </figure>

                <div className="col-span-4 flex flex-col md:col-span-2">
                    <h2
                        id="zip-off-heading"
                        className={`${serif.className} text-[clamp(3.6rem,8.4vw,9rem)] uppercase leading-[0.84] tracking-[-0.035em]`}
                    >
                        Trousers
                        <br />
                        <span className="text-[0.5em] lowercase italic tracking-normal text-[#8a8a8a]">or</span> shorts
                    </h2>
                    <p className="mt-8 max-w-[42ch] text-[clamp(1.05rem,1.3vw,1.35rem)] font-medium leading-[1.2] tracking-[-0.02em]">
                        The 2Track Suit trousers zip off at the knee. Wear them full length, or take the lower legs off
                        and wear them as shorts.
                    </p>

                    <ol className="mt-10 md:mt-14">
                        {STEPS.map((step, i) => (
                            <li key={step.title} className="grid grid-cols-4 gap-x-2.5 border-t border-black/25 py-3.5 last:border-b">
                                <span className={LABEL}>{String(i + 1).padStart(2, "0")}</span>
                                <span className="col-span-3">
                                    <span className={`${LABEL} block`}>{step.title}</span>
                                    <span className="mt-0.5 block text-[13px] font-medium leading-[1.3] tracking-[-0.01em] text-[#555]">
                                        {step.text}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-10 grid grid-cols-2 items-end gap-x-2.5 md:mt-auto md:pt-14">
                        <div
                            className="relative aspect-[3/4] overflow-hidden bg-[#f1f1f1] bg-cover bg-center"
                            style={{ backgroundImage: `url(${WALK_PLACEHOLDER})` }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={resized(WALK, 640)}
                                srcSet={resizedSet(WALK, [384, 640, 828])}
                                sizes="(min-width: 768px) 24vw, 48vw"
                                alt="Someone walking in the full 2Track Suit with the hood up"
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                        {shopLink && (
                            <Link href={`/product/${TRACKSUIT_ID}`} className="group justify-self-start py-2">
                                <span className={`${LABEL} inline-flex items-center gap-1.5`}>
                                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transition-none">
                                        [
                                    </span>
                                    Shop the 2Track Suit
                                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
                                        ]
                                    </span>
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
