// Server-side Paystack API helpers.
// The secret key must NEVER be imported into a client component.

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export function getPaystackSecretKey(): string {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) {
        throw new Error(
            "PAYSTACK_SECRET_KEY is not set. Add it to your environment (.env.local)."
        );
    }
    return key;
}

export interface PaystackInitializeResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export interface PaystackTransactionData {
    id: number;
    status: string; // "success" | "failed" | "abandoned" | ...
    reference: string;
    amount: number; // in kobo (smallest currency unit)
    currency: string;
    paid_at: string | null;
    channel: string | null;
    customer: { email: string } | null;
    metadata: Record<string, unknown> | null;
    [key: string]: unknown;
}

export interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data: PaystackTransactionData;
}

/**
 * Create a transaction on Paystack and get back an authorization_url to
 * redirect the customer to. `amount` must already be in kobo.
 */
export async function initializeTransaction(params: {
    email: string;
    amount: number;
    reference: string;
    callbackUrl: string;
    currency?: string;
    metadata?: Record<string, unknown>;
}): Promise<PaystackInitializeResponse> {
    const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${getPaystackSecretKey()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: params.email,
            amount: params.amount,
            reference: params.reference,
            callback_url: params.callbackUrl,
            currency: params.currency ?? "NGN",
            metadata: params.metadata ?? {},
        }),
        cache: "no-store",
    });

    const json = (await res.json()) as PaystackInitializeResponse;
    if (!res.ok || !json.status) {
        throw new Error(json.message || "Failed to initialize Paystack transaction");
    }
    return json;
}

/**
 * Ask Paystack for the authoritative status of a transaction. This is the
 * source of truth — never trust a client-reported "payment successful".
 */
export async function verifyTransaction(
    reference: string
): Promise<PaystackVerifyResponse> {
    const res = await fetch(
        `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
        {
            headers: { Authorization: `Bearer ${getPaystackSecretKey()}` },
            cache: "no-store",
        }
    );

    const json = (await res.json()) as PaystackVerifyResponse;
    if (!res.ok || !json.status) {
        throw new Error(json.message || "Failed to verify Paystack transaction");
    }
    return json;
}
