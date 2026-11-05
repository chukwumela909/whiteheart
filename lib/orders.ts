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

    // The update only matches while the order is still unpaid, and returns the
    // rows it changed. The webhook and the callback verify can both arrive at
    // once; only the one that actually flips the order to paid gets a row back,
    // so stock is taken off exactly once.
    const markPaid = (fields: Record<string, unknown>) =>
        supabase
            .from("orders")
            .update(fields)
            .eq("id", order.id)
            .or("payment_status.is.null,payment_status.neq.paid")
            .select("id");

    let result = await markPaid(richUpdate);
    if (result.error) {
        result = await markPaid({ payment_status: "paid", status: "processing" });
    }

    if (result.error) {
        return { ok: false, reason: "update_failed", detail: result.error.message };
    }

    if (!result.data || result.data.length === 0) {
        // Another request marked it paid between our read and our update.
        return { ok: true, orderId: order.id, alreadyPaid: true };
    }

    await decrementStockForOrder(order.id);

    return { ok: true, orderId: order.id, alreadyPaid: false };
}

/**
 * Take a paid order's items off product stock (total and per size). Never
 * throws: the payment is already recorded, so a stock problem is logged for
 * the admin to fix by hand rather than failing the payment confirmation.
 *
 * This is a read-then-write per product, so two orders for the same product
 * paid at the same instant could each read the old count. Stock can't go
 * below zero, and the order-creation check keeps that window small.
 */
async function decrementStockForOrder(orderId: string): Promise<void> {
    const supabase = createAdminClient();
    try {
        const { data: items, error } = await supabase
            .from("order_items")
            .select("product_id, quantity, size")
            .eq("order_id", orderId);

        if (error || !items) {
            console.error("[orders] could not load items to update stock:", orderId, error?.message);
            return;
        }

        const byProduct = new Map<string, { quantity: number; size: string | null }[]>();
        for (const item of items) {
            if (!item.product_id) continue;
            const list = byProduct.get(item.product_id) ?? [];
            list.push({ quantity: Number(item.quantity) || 0, size: item.size });
            byProduct.set(item.product_id, list);
        }

        for (const [productId, lines] of byProduct) {
            const { data: product, error: productError } = await supabase
                .from("products")
                .select("stock_quantity, sizes")
                .eq("id", productId)
                .maybeSingle();

            if (productError || !product) {
                console.error("[orders] could not load product to update stock:", productId, productError?.message);
                continue;
            }

            const totalQty = lines.reduce((sum, line) => sum + line.quantity, 0);
            const sizes = Array.isArray(product.sizes)
                ? (product.sizes as { name: string; stock: number }[]).map((size) => {
                      const sold = lines
                          .filter((line) => line.size === size.name)
                          .reduce((sum, line) => sum + line.quantity, 0);
                      return sold > 0 ? { ...size, stock: Math.max(0, (Number(size.stock) || 0) - sold) } : size;
                  })
                : product.sizes;

            const { error: updateError } = await supabase
                .from("products")
                .update({
                    stock_quantity: Math.max(0, (Number(product.stock_quantity) || 0) - totalQty),
                    sizes,
                })
                .eq("id", productId);

            if (updateError) {
                console.error("[orders] stock update failed:", productId, updateError.message);
            }
        }
    } catch (e) {
        console.error("[orders] stock update threw:", orderId, e instanceof Error ? e.message : e);
    }
}
