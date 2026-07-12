import { createAdminClient } from "@/lib/supabase/admin";
import type { PaystackTransactionData } from "@/lib/paystack";

export type ReconcileResult =
    | { ok: true; orderId: string; alreadyPaid: boolean }
    | {
          ok: false;
          reason: "order_not_found" | "amount_mismatch" | "update_failed";
          detail?: string;
      };

/**
 * Mark an order as paid based on a VERIFIED Paystack transaction.
 *
 * The Paystack `reference` equals our `order_number` (we set it that way when
 * initializing the transaction). This function is:
 *   - idempotent  — safe to call from both the webhook and the callback verify,
 *                   and safe to call more than once (returns alreadyPaid).
 *   - amount-safe — refuses to mark paid if the amount charged doesn't match
 *                   the order total, guarding against tampering.
 *
 * The caller MUST have already confirmed `transaction.status === "success"`
 * with Paystack before calling this.
 */
export async function markOrderPaidByReference(
    reference: string,
    transaction: PaystackTransactionData
): Promise<ReconcileResult> {
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
        .from("orders")
        .select("id, total_amount, payment_status")
        .eq("order_number", reference)
        .maybeSingle();

    if (error || !order) {
        return { ok: false, reason: "order_not_found", detail: error?.message };
    }

    // Idempotency: nothing to do if it's already been reconciled.
    if (order.payment_status === "paid") {
        return { ok: true, orderId: order.id, alreadyPaid: true };
    }

    // Guard against amount tampering. Paystack amounts are in kobo.
    const expectedKobo = Math.round(Number(order.total_amount) * 100);
    if (transaction.amount !== expectedKobo) {
        return {
            ok: false,
            reason: "amount_mismatch",
            detail: `expected ${expectedKobo}, got ${transaction.amount}`,
        };
    }

    // Try the rich update first (extra audit columns), and fall back to the
    // core columns if those optional columns haven't been added to the schema.
    // See payment_schema_update.sql to add them.
    const richUpdate = {
        payment_status: "paid",
        status: "processing",
        payment_reference: transaction.reference,
        paid_at: transaction.paid_at ?? new Date().toISOString(),
        payment_details: transaction as unknown as Record<string, unknown>,
    };

    let updateError = (
        await supabase.from("orders").update(richUpdate).eq("id", order.id)
    ).error;

    if (updateError) {
        updateError = (
            await supabase
                .from("orders")
                .update({ payment_status: "paid", status: "processing" })
                .eq("id", order.id)
        ).error;
    }

    if (updateError) {
        return { ok: false, reason: "update_failed", detail: updateError.message };
    }

    return { ok: true, orderId: order.id, alreadyPaid: false };
}
