import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { markOrderPaidByReference } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payments/verify
 * Body: { reference: string }
 *
 * Called by the /payment/callback page after Paystack redirects the customer
 * back. Asks Paystack for the authoritative transaction status and, only if it
 * succeeded, marks the order paid. This is the trusted confirmation — the
 * browser never gets to declare a payment successful on its own.
 */
export async function POST(request: Request) {
    try {
        const { reference } = await request.json();
        if (!reference || typeof reference !== "string") {
            return NextResponse.json({ error: "Missing reference" }, { status: 400 });
        }

        const verification = await verifyTransaction(reference);
        const tx = verification.data;

        if (tx.status !== "success") {
            return NextResponse.json({ paid: false, status: tx.status });
        }

        const result = await markOrderPaidByReference(reference, tx);
        if (!result.ok) {
            console.error("[payments/verify] reconcile failed", result);
            return NextResponse.json(
                { paid: false, status: tx.status, reason: result.reason },
                { status: 400 }
            );
        }

        return NextResponse.json({ paid: true, orderId: result.orderId });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to verify payment";
        console.error("[payments/verify]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
