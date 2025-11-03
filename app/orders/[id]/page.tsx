"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    shipping_address: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    contact_info: {
        email: string;
        phone: string;
    };
}

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    color: string | null;
    size: string | null;
    products: {
        name: string;
        image_url: string;
        images: string[] | null;
    };
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        loadOrder();
    }, [params.id]);

    const loadOrder = async () => {
        try {
            // Load order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', params.id)
                .single();

            if (orderError) throw orderError;

            // Load order items with product details
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select(`
                    *,
                    products (
                        name,
                        image_url,
                        images
                    )
                `)
                .eq('order_id', params.id);

            if (itemsError) throw itemsError;

            setOrder(orderData);
            setOrderItems(itemsData || []);
        } catch (err) {
            console.error("Error loading order:", err);
            setError("Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-walter font-bold text-black mb-4">Order Not Found</h1>
                    <Link href="/shop" className="text-sm font-simon text-black underline">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const { shipping_address, contact_info } = order;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link href="/" className="font-dancing text-2xl font-bold text-black">
                        White Heart
                    </Link>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Success Message */}
                <div className="bg-white rounded-lg p-8 mb-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-walter font-bold text-black mb-2">Order Confirmed!</h1>
                    <p className="font-simon text-gray-600 mb-4">
                        Thank you for your purchase. Your order has been received.
                    </p>
                    <p className="text-sm font-simon text-gray-500">
                        Order Number: <span className="font-semibold text-black">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                    <p className="text-sm font-simon text-gray-500">
                        Order Date: {new Date(order.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-walter font-bold text-black mb-4">Order Details</h2>
                    
                    {/* Order Items */}
                    <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                        {orderItems.map((item) => {
                            const imageUrl = item.products.images?.[0] || item.products.image_url;
                            return (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imageUrl}
                                            alt={item.products.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-walter font-semibold text-black">{item.products.name}</h3>
                                        {item.color && (
                                            <p className="text-sm font-simon text-gray-600">Color: {item.color}</p>
                                        )}
                                        {item.size && (
                                            <p className="text-sm font-simon text-gray-600">Size: {item.size}</p>
                                        )}
                                        <p className="text-sm font-simon text-gray-600">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-dancing font-bold text-black">
                                            ₦{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between font-walter font-bold text-lg">
                        <span>Total</span>
                        <span>₦{order.total_amount.toLocaleString()}</span>
                    </div>
                </div>

                {/* Shipping & Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-lg font-walter font-bold text-black mb-4">Shipping Address</h2>
                        <div className="text-sm font-simon text-gray-700 space-y-1">
                            <p className="font-semibold text-black">
                                {shipping_address.firstName} {shipping_address.lastName}
                            </p>
                            <p>{shipping_address.address}</p>
                            <p>
                                {shipping_address.city}, {shipping_address.state} {shipping_address.postalCode}
                            </p>
                            <p>{shipping_address.country}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-lg font-walter font-bold text-black mb-4">Contact Information</h2>
                        <div className="text-sm font-simon text-gray-700 space-y-1">
                            <p>
                                <span className="font-semibold text-black">Email:</span> {contact_info.email}
                            </p>
                            <p>
                                <span className="font-semibold text-black">Phone:</span> {contact_info.phone}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-walter font-bold text-black mb-2">What's Next?</h2>
                    <p className="text-sm font-simon text-gray-700 mb-4">
                        We've received your order and will begin processing it shortly. You'll receive a confirmation email at{" "}
                        <span className="font-semibold">{contact_info.email}</span> with your order details and tracking information.
                    </p>
                    <p className="text-sm font-simon text-gray-700">
                        For any questions, feel free to{" "}
                        <a href="https://wa.me/+2348105258679" target="_blank" rel="noopener noreferrer" className="text-black underline font-semibold">
                            contact us on WhatsApp
                        </a>
                        .
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/orders"
                        className="flex-1 bg-black text-white py-3 rounded-lg font-walter font-bold text-center hover:bg-gray-800 transition-colors"
                    >
                        View All Orders
                    </Link>
                    <Link
                        href="/shop"
                        className="flex-1 border border-black text-black py-3 rounded-lg font-walter font-bold text-center hover:bg-gray-100 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
