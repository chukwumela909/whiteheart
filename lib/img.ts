// Resized copies of photos, made on the fly by the site's built-in image resizer (/_next/image).
//
// Product photos are uploaded at full camera size (1.4–1.7 MB each) and Supabase serves them
// with caching switched off, so showing them directly makes every thumbnail a multi-megabyte
// download on every visit. These helpers ask the resizer for a WebP at the width the page
// actually needs; the result is cached on the server and in the browser.
//
// Only the widths below are accepted by the resizer (Next's default size list).
const WIDTHS = [96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

// Must match the host allowed in next.config.ts (images.remotePatterns); other hosts are refused.
const BUCKET = "https://evzecjzuvqzpzjrclnny.supabase.co/storage/v1/object/public/";

/** Photos the resizer may fetch: files in /public, and the store's Supabase bucket (see next.config.ts). */
const canResize = (src: string) =>
    typeof src === "string" &&
    ((src.startsWith("/") && !src.startsWith("//")) || src.startsWith(BUCKET));

/** The smallest accepted width that is at least `width`. */
const snap = (width: number) => WIDTHS.find((w) => w >= width) ?? WIDTHS[WIDTHS.length - 1];

/** A resized copy of `src`, about `width` pixels wide. Falls back to the original when it can't be resized. */
export const resized = (src: string, width: number) =>
    canResize(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=${snap(width)}&q=75` : src;

/** A srcset of resized copies, for use with a `sizes` attribute. Undefined when `src` can't be resized. */
export const resizedSet = (src: string, widths: number[]) =>
    canResize(src)
        ? [...new Set(widths.map(snap))].map((w) => `${resized(src, w)} ${w}w`).join(", ")
        : undefined;

/**
 * If a resized copy fails to load (the resizer gives up when the original takes too long to
 * fetch), show the original photo instead of a broken image. Use as `onError` on the <img>.
 */
export const originalOnError = (original: string) => (event: { currentTarget: HTMLImageElement }) => {
    const img = event.currentTarget;
    if (!original || img.dataset.fellBack) return;
    img.dataset.fellBack = "1";
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.src = original;
};
