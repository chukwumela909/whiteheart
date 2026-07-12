import { NextResponse } from "next/server";
import crypto from "crypto";
import { getPaystackSecretKey } from "@/lib/paystack";
import type { PaystackTransactionData } from "@/lib/paystack";
import { markOrderPaidByReference } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/paystack
 *
 * Configure this URL in the Paystack dashboard
 * (Settings → API Keys & Webhooks). Paystack POSTs event notifications here.
 *
 * This is the RELIABLE confirmation path: it fires even if the customer closes
 * the browser before the redirect back to /payment/callback completes. Every
 * request is authenticated by verifying the x-paystack-signature HMAC so that
 * only Paystack (which knows the secret key) can mark orders as paid.
 */
export async function POST(request: Request) {
    // Read the RAW body — the signature is computed over the exact bytes.
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") ?? "";

    let expected: string;
    try {
        expected = crypto
            .createHmac("sha512", getPaystackSecretKey())
            .update(rawBody)
            .digest("hex");
    } catch (e) {
        console.error("[webhooks/paystack] misconfigured:", e);
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        // Not from Paystack (or tampered) — reject.
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event: { event?: string; data?: PaystackTransactionData };
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Acknowledge fast; only act on successful charges.
    if (event.event === "charge.success" && event.data?.status === "success") {
        try {
            const result = await markOrderPaidByReference(
                event.data.reference,
                event.data
            );
            if (!result.ok) {
                console.error("[webhooks/paystack] reconcile failed", result);
            }
        } catch (e) {
            console.error("[webhooks/paystack] handler error", e);
            // Swallow: returning 200 stops Paystack from retrying a request we
            // can't process anyway. Errors are logged for investigation.
        }
    }

    return NextResponse.json({ received: true });
}
