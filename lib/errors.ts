/**
 * Helpers for reading values off a caught `unknown`.
 *
 * Supabase and Postgres surface failures as plain objects with `message` /
 * `code` rather than real `Error` instances, so an `instanceof Error` check
 * on its own isn't enough to get at either field.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * The error's message, or an empty string if it doesn't carry one — so
 * `getErrorMessage(e) || "fallback"` reads the way you'd expect.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (isRecord(error) && typeof error.message === "string") return error.message;
    return "";
}

/**
 * The Postgres/PostgREST error code (e.g. "PGRST116", "23503"), if present.
 */
export function getErrorCode(error: unknown): string | undefined {
    if (isRecord(error) && typeof error.code === "string") return error.code;
    return undefined;
}

/** Shown when the request never reached a server. */
export const NETWORK_ERROR_MESSAGE =
    "We couldn't reach the server. Check your internet connection and try again.";

/**
 * A `fetch` that never reaches a server rejects with a browser-specific
 * TypeError rather than anything structured, so matching the message is the
 * only portable way to tell "you're offline / the host is unreachable" apart
 * from a real server-side failure.
 */
const NETWORK_ERROR_PATTERNS = [
    "failed to fetch", // Chrome, Edge
    "load failed", // Safari
    "networkerror", // Firefox
    "network request failed",
    "fetch failed", // undici (server-side fetch)
];

export function isNetworkError(error: unknown): boolean {
    // supabase-js wraps some transport failures before they reach us.
    if (isRecord(error) && error.name === "AuthRetryableFetchError") return true;

    const message = getErrorMessage(error).toLowerCase();
    if (!message) return false;
    return NETWORK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

/**
 * The message to actually show a person: a plain-language explanation for
 * connection failures, the error's own message otherwise, and `fallback` when
 * it doesn't carry one.
 */
export function getUserFacingErrorMessage(error: unknown, fallback: string): string {
    if (isNetworkError(error)) return NETWORK_ERROR_MESSAGE;
    return getErrorMessage(error) || fallback;
}
