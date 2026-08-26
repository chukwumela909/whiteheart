import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CreateOrderItem {
    product_id: string;
    quantity: number;
    price: number;
    color: string | null;
    size: string | null;
}

interface ShippingAddress {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

/**
 * POST /api/orders/create
 * Body: { items, contactInfo, shippingAddress, shippingAddressId? }
 *
 * Creates the order + order_items rows using the admin client, bypassing RLS.
 * The browser never gets direct write access to `orders` — user_id is resolved
 * from the caller's own session cookie here, never trusted from the request
 * body, so nobody can attach an order to someone else's account.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const items: CreateOrderItem[] = body.items;
        const contactInfo: { email?: string; phone?: string } = body.contactInfo || {};
        const shippingAddress: ShippingAddress | undefined = body.shippingAddress;
        const shippingAddressId: string | undefined = body.shippingAddressId;

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
        }
        if (!contactInfo.email || !contactInfo.phone) {
            return NextResponse.json({ error: "Missing contact information." }, { status: 400 });
        }
        if (!shippingAddress) {
            return NextResponse.json({ error: "Missing shipping address." }, { status: 400 });
        }
        for (const item of items) {
            if (!item.product_id || !item.quantity || !item.price || item.quantity <= 0 || item.price <= 0) {
                return NextResponse.json({ error: "Invalid item in cart." }, { status: 400 });
            }
        }

        // Resolve the caller's identity from their own session — guests (no
        // session) are allowed through with a null user_id.
        const sessionClient = await createServerClient();
        const {
            data: { user },
        } = await sessionClient.auth.getUser();

        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const orderNumber = `WH${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const admin = createAdminClient();

        const orderData: Record<string, unknown> = {
            user_id: user?.id ?? null,
            order_number: orderNumber,
            total_amount: total,
            status: "pending",
            payment_status: "pending",
            payment_method: "paystack",
            contact_info: { email: contactInfo.email, phone: contactInfo.phone },
            shipping_address: shippingAddress,
        };
        if (shippingAddressId) {
            orderData.shipping_address_id = shippingAddressId;
        }

        const { data: order, error: orderError } = await admin
            .from("orders")
            .insert(orderData)
            .select()
            .single();

        if (orderError || !order) {
            console.error("[orders/create] order insert failed:", orderError?.message);
            return NextResponse.json(
                { error: `Database error: ${orderError?.message ?? "unknown error"}` },
                { status: 500 }
            );
        }

        const orderItems = items.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            size: item.size,
        }));

        const { error: itemsError } = await admin.from("order_items").insert(orderItems);

        if (itemsError) {
            console.error("[orders/create] order_items insert failed:", itemsError.message);
            // Roll back the order so we don't leave an item-less order behind.
            await admin.from("orders").delete().eq("id", order.id);
            return NextResponse.json(
                { error: "Failed to add items to order. Please contact support." },
                { status: 500 }
            );
        }

        return NextResponse.json({ orderId: order.id, orderNumber: order.order_number });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to create order";
        console.error("[orders/create]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
