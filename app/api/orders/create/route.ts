import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { availableQuantity, type StockFields } from "@/lib/stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CreateOrderItem {
    product_id: string;
    quantity: number;
    /** Sent by the browser for display only; the order always uses the database price. */
    price?: number;
    color: string | null;
    size: string | null;
}

interface ProductRow extends StockFields {
    id: string;
    name: string;
    price: number;
    is_active: boolean;
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
            if (!item.product_id || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                return NextResponse.json({ error: "Invalid item in cart." }, { status: 400 });
            }
        }

        // Resolve the caller's identity from their own session — guests (no
        // session) are allowed through with a null user_id.
        const sessionClient = await createServerClient();
        const {
            data: { user },
        } = await sessionClient.auth.getUser();

        const admin = createAdminClient();

        // Load the real products so price and stock come from the database,
        // never from the cart in the browser (which the customer can edit).
        const productIds = [...new Set(items.map((item) => item.product_id))];
        const { data: productRows, error: productsError } = await admin
            .from("products")
            .select("id, name, price, stock_quantity, sizes, is_active")
            .in("id", productIds);

        if (productsError) {
            console.error("[orders/create] product lookup failed:", productsError.message);
            return NextResponse.json({ error: "Could not check stock. Please try again." }, { status: 500 });
        }

        const products = new Map((productRows as ProductRow[]).map((p) => [p.id, p]));

        // Add up what's being bought, per product and per size, so the same
        // product in two cart lines can't get past the stock check.
        const qtyByProduct = new Map<string, number>();
        const qtyBySize = new Map<string, { productId: string; size: string; qty: number }>();
        for (const item of items) {
            const product = products.get(item.product_id);
            if (!product || !product.is_active) {
                return NextResponse.json(
                    { error: `${product?.name ?? "An item in your bag"} is no longer available. Please remove it from your bag.` },
                    { status: 409 }
                );
            }
            const hasSizes = (product.sizes ?? []).length > 0;
            if (hasSizes && !(product.sizes ?? []).some((s) => s.name === item.size)) {
                return NextResponse.json(
                    { error: `Please choose a valid size for ${product.name}.` },
                    { status: 400 }
                );
            }
            qtyByProduct.set(product.id, (qtyByProduct.get(product.id) ?? 0) + item.quantity);
            if (hasSizes) {
                const key = JSON.stringify([product.id, item.size]);
                const entry = qtyBySize.get(key) ?? { productId: product.id, size: item.size as string, qty: 0 };
                entry.qty += item.quantity;
                qtyBySize.set(key, entry);
            }
        }

        const outOfStock = (name: string, left: number, size?: string | null) => {
            const what = size ? `${name} in size ${size}` : name;
            const message =
                left === 0
                    ? `Sorry, ${what} is sold out. Please remove it from your bag.`
                    : `Sorry, we only have ${left} of ${what} left. Please reduce the quantity in your bag.`;
            return NextResponse.json({ error: message }, { status: 409 });
        };

        for (const [productId, qty] of qtyByProduct) {
            const product = products.get(productId)!;
            const left = availableQuantity({ stock_quantity: product.stock_quantity });
            if (qty > left) return outOfStock(product.name, left);
        }
        for (const { productId, size, qty } of qtyBySize.values()) {
            const product = products.get(productId)!;
            const left = availableQuantity(product, size);
            if (qty > left) return outOfStock(product.name, left, size);
        }

        const priceOf = (productId: string) => Number(products.get(productId)!.price);
        const total = items.reduce((sum, item) => sum + priceOf(item.product_id) * item.quantity, 0);
        if (!Number.isFinite(total) || total <= 0) {
            return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
        }
        const orderNumber = `WH${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

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
            price: priceOf(item.product_id),
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
