"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/app/contexts/CartContext";
import BrandLogo from "@/app/components/BrandLogo";

type Status = "verifying" | "success" | "failed";

function PaymentCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();

    const [status, setStatus] = useState<Status>("verifying");
    const [message, setMessage] = useState("Confirming your payment…");
    const hasRun = useRef(false);

    useEffect(() => {
        // Guard against React 18 StrictMode double-invocation in dev.
        if (hasRun.current) return;
        hasRun.current = true;

        // Paystack appends ?reference= (and ?trxref=) on redirect.
        const reference =
            searchParams.get("reference") || searchParams.get("trxref");

        if (!reference) {
            setStatus("failed");
            setMessage("No payment reference was found. If you were charged, please contact support.");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch("/api/payments/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reference }),
                });
                const data = await res.json();

                if (res.ok && data.paid) {
                    clearCart();
                    setStatus("success");
                    setMessage("Payment confirmed! Redirecting to your order…");
                    setTimeout(() => router.replace(`/orders/${data.orderId}`), 1500);
                } else {
                    setStatus("failed");
                    setMessage(
                        data.status === "abandoned"
                            ? "Your payment was not completed. Your order is saved — you can try again."
                            : "We couldn't confirm your payment. If you were charged, please contact support."
                    );
                }
            } catch {
                setStatus("failed");
                setMessage("Something went wrong while confirming your payment. Please contact support.");
            }
        };

        verify();
    }, [searchParams, router, clearCart]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <BrandLogo
                        href="/"
                        className="w-[190px] h-[72px]"
                        imageClassName="object-contain"
                        alt="Whiteheart logo"
                    />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="bg-white rounded-lg p-10 max-w-md w-full text-center">
                    {status === "verifying" && (
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full border-b-2 border-black animate-spin" />
                    )}

                    {status === "success" && (
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}

                    {status === "failed" && (
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}

                    <h1 className="text-2xl font-walter font-bold text-black mb-3">
                        {status === "success"
                            ? "Payment Successful"
                            : status === "failed"
                            ? "Payment Not Confirmed"
                            : "Verifying Payment"}
                    </h1>
                    <p className="font-simon text-gray-600 mb-6">{message}</p>

                    {status === "failed" && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/checkout"
                                className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-walter font-bold hover:bg-gray-800 transition-colors"
                            >
                                Try Again
                            </Link>
                            <Link
                                href="/orders"
                                className="flex-1 border border-black text-black py-3 px-4 rounded-lg font-walter font-bold hover:bg-gray-100 transition-colors"
                            >
                                View Orders
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-b-2 border-black animate-spin" />
                </div>
            }
        >
            <PaymentCallback />
        </Suspense>
    );
}
