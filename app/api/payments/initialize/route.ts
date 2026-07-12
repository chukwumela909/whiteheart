import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payments/initialize
 * Body: { orderId: string }
 *
 * Creates a Paystack transaction for an already-persisted order and returns
 * the authorization_url the browser should redirect to. The amount is read
 * from the order in the database (NOT from the client) so it can't be tampered
 * with, and the reference is the order_number so the webhook / verify step can
 * reconcile it later.
 */
export async function POST(request: Request) {
    try {
        const { orderId } = await request.json();
        if (!orderId || typeof orderId !== "string") {
            return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data: order, error } = await supabase
            .from("orders")
            .select("id, order_number, total_amount, payment_status, contact_info")
            .eq("id", orderId)
            .maybeSingle();

        if (error || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        if (order.payment_status === "paid") {
            return NextResponse.json(
                { error: "This order has already been paid for." },
                { status: 400 }
            );
        }

        const email = order.contact_info?.email;
        if (!email) {
            return NextResponse.json(
                { error: "Order is missing a contact email." },
                { status: 400 }
            );
        }

        const amountKobo = Math.round(Number(order.total_amount) * 100);
        if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
            return NextResponse.json({ error: "Invalid order amount." }, { status: 400 });
        }

        const origin =
            process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

        const init = await initializeTransaction({
            email,
            amount: amountKobo,
            reference: order.order_number,
            callbackUrl: `${origin}/payment/callback`,
            metadata: {
                order_id: order.id,
                order_number: order.order_number,
            },
        });

        return NextResponse.json({
            authorization_url: init.data.authorization_url,
            reference: init.data.reference,
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to initialize payment";
        console.error("[payments/initialize]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
