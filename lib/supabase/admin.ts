import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client authenticated with the service-role key. It bypasses Row
 * Level Security, so it must ONLY ever be used in trusted server code
 * (webhooks, payment verification) — never in a client component.
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error(
            "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        );
    }

    return createSupabaseClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
