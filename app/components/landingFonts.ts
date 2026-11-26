// The two fonts of the hero and shop pages, served from /public/fonts instead of being
// downloaded from Google during every build (that download failed twice on the build server
// and took the deploy down with it). The @font-face rules live in app/globals.css.
//
// Each export keeps the `{ className }` shape that next/font gives, so components use them
// the same way: className={grotesk.className}.

/** Bold grotesque (Inter Tight, weights 500–700) for the wordmark, nav, hero headline and shop page. */
export const grotesk = { className: "wh-font-grotesk" };

/** Serif (Instrument Serif, regular and italic) for the small slide numbers and "Scroll". */
export const serif = { className: "wh-font-serif" };

/** The file worth preloading: every page that uses `grotesk` needs it for its first paint. */
export const GROTESK_PRELOAD = "/fonts/inter-tight-latin.woff2";
