import { Inter_Tight, Instrument_Serif } from "next/font/google";

// Bold grotesque for the wordmark, nav and hero headline.
export const grotesk = Inter_Tight({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    display: "swap",
});

// Italic serif for the small slide numbers and "Scroll".
export const serif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    display: "swap",
});
