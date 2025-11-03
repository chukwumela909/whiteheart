"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/contexts/CartContext";
import { useNotification } from "@/app/contexts/NotificationContext";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

declare global {
    interface Window {
        PaystackPop: any;
    }
}

interface ShippingInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

interface SavedAddress {
    id: string;
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    postal_code: string;
    phone: string | null;
    phone_country_code: string | null;
    country: string;
    is_default: boolean;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, getCartTotal, clearCart } = useCart();
    const { showSuccess, showError } = useNotification();
    const supabase = createClient();
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [paystackLoaded, setPaystackLoaded] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Nigeria",
    });

    useEffect(() => {
        checkAuth();
        loadPaystackScript();
    }, []);

    const loadPaystackScript = () => {
        // Check if script is already loaded
        if (window.PaystackPop) {
            setPaystackLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => {
            setPaystackLoaded(true);
        };
        script.onerror = () => {
            showError('Payment Error', 'Failed to load payment system. Please refresh the page.');
        };
        document.body.appendChild(script);
    };

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setIsAuthenticated(true);
            setUserId(session.user.id);
            // Pre-fill email if available
            if (session.user.email) {
                setShippingInfo(prev => ({ ...prev, email: session.user.email! }));
            }
            // Load saved addresses
            await loadSavedAddresses(session.user.id);
        }
    };

    const loadSavedAddresses = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                setSavedAddresses(data);
                // Auto-select default address if available
                const defaultAddress = data.find(addr => addr.is_default);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                }
            } else {
                // No saved addresses, use new address form
                setUseNewAddress(true);
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
            setUseNewAddress(true);
        }
    };

    const handleAddressSelection = (addressId: string) => {
        setSelectedAddressId(addressId);
        setUseNewAddress(false);
    };

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0) {
            router.push("/shop");
        }
    }, [cart, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        // If using saved address, just validate contact info
        if (!useNewAddress && selectedAddressId) {
            if (!shippingInfo.email || !shippingInfo.phone) {
                showError('Missing Information', 'Please fill in your contact information');
                return false;
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(shippingInfo.email)) {
                showError('Invalid Email', 'Please enter a valid email address');
                return false;
            }

            // Validate phone
            if (shippingInfo.phone.length < 10) {
                showError('Invalid Phone', 'Please enter a valid phone number (at least 10 digits)');
                return false;
            }

            return true;
        }

        // If using new address, validate all fields
        const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state'];
        for (const field of required) {
            if (!shippingInfo[field as keyof ShippingInfo]) {
                const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
                showError('Missing Information', `Please fill in ${fieldName}`);
                return false;
            }
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(shippingInfo.email)) {
            showError('Invalid Email', 'Please enter a valid email address');
            return false;
        }

        // Validate phone
        if (shippingInfo.phone.length < 10) {
            showError('Invalid Phone', 'Please enter a valid phone number (at least 10 digits)');
            return false;
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        if (!paystackLoaded) {
            showError('Payment Error', 'Payment system is still loading. Please wait a moment and try again.');
            return;
        }

        setLoading(true);

        try {
            console.log("Starting order placement...");
            console.log("User ID:", userId);
            console.log("Cart items:", cart);
            
            // Calculate totals
            const subtotal = getCartTotal();
            const shipping = 0; // Free shipping
            const total = subtotal + shipping;

            console.log("Order totals - Subtotal:", subtotal, "Shipping:", shipping, "Total:", total);

            // Generate order number
            const orderNumber = `WH${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            console.log("Generated order number:", orderNumber);

            let orderData: any = {
                user_id: userId,
                order_number: orderNumber,
                total_amount: total,
                status: 'pending',
                payment_status: 'pending',
                payment_method: 'paystack',
                contact_info: {
                    email: shippingInfo.email,
                    phone: shippingInfo.phone,
                },
            };

            // If using saved address, reference it
            if (!useNewAddress && selectedAddressId) {
                console.log("Using saved address:", selectedAddressId);
                const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
                if (selectedAddress) {
                    orderData.shipping_address_id = selectedAddressId;
                    orderData.shipping_address = {
                        firstName: selectedAddress.first_name,
                        lastName: selectedAddress.last_name,
                        address: selectedAddress.address_line1 + (selectedAddress.address_line2 ? ', ' + selectedAddress.address_line2 : ''),
                        city: selectedAddress.city,
                        postalCode: selectedAddress.postal_code,
                        country: selectedAddress.country,
                    };
                }
            } else {
                console.log("Using new address");
                // Using new address
                orderData.shipping_address = {
                    firstName: shippingInfo.firstName,
                    lastName: shippingInfo.lastName,
                    address: shippingInfo.address,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    postalCode: shippingInfo.postalCode,
                    country: shippingInfo.country,
                };
            }

            console.log("Final order data:", orderData);

            // Create order in database first
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert(orderData)
                .select()
                .single();

            if (orderError) {
                console.error("Order creation error:", orderError);
                console.error("Order data being sent:", orderData);
                
                // Show more specific error messages based on the error
                if (orderError.message.includes('violates foreign key constraint')) {
                    throw new Error('Invalid address or user information. Please try again.');
                } else if (orderError.message.includes('null value')) {
                    throw new Error('Missing required information. Please fill in all fields.');
                } else {
                    throw new Error(`Database error: ${orderError.message}`);
                }
            }

            // Create order items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                color: item.color,
                size: item.size,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error("Order items error:", itemsError);
                throw new Error('Failed to add items to order. Please contact support.');
            }

            // Payment success handler (must be outside Paystack config)
            const handlePaymentSuccess = async (response: any) => {
                console.log("Payment successful:", response);
                
                // Update order payment status
                const { error: updateError } = await supabase
                    .from('orders')
                    .update({
                        payment_status: 'paid',
                        status: 'processing'
                    })
                    .eq('id', order.id);

                if (updateError) {
                    console.error("Error updating payment status:", updateError);
                }

                // Success notification
                showSuccess('Payment Successful!', 'Your order has been placed successfully. Redirecting...');

                // Clear cart
                clearCart();

                // Redirect to order confirmation
                setTimeout(() => {
                    router.push(`/orders/${order.id}`);
                }, 1500);
            };

            // Initialize Paystack payment
            const handler = window.PaystackPop.setup({
                key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here',
                email: shippingInfo.email,
                amount: total * 100, // Paystack expects amount in kobo (multiply by 100)
                currency: 'NGN',
                ref: orderNumber,
                metadata: {
                    custom_fields: [
                        {
                            display_name: "Order ID",
                            variable_name: "order_id",
                            value: order.id
                        },
                        {
                            display_name: "Customer Name",
                            variable_name: "customer_name",
                            value: `${orderData.shipping_address.firstName} ${orderData.shipping_address.lastName}`
                        }
                    ]
                },
                callback: function(response: any) {
                    handlePaymentSuccess(response);
                },
                onClose: function() {
                    console.log("Payment window closed");
                    showError('Payment Cancelled', 'You closed the payment window. Your order is saved but not paid.');
                    setLoading(false);
                }
            });

            handler.openIframe();
            setLoading(false);

        } catch (error: any) {
            console.error("Error creating order:", error);
            
            // Show specific error message
            if (error.message) {
                showError('Order Failed', error.message);
            } else if (error.code === 'PGRST116') {
                showError('Authentication Required', 'Please sign in to place an order.');
            } else if (error.code === '23503') {
                showError('Invalid Data', 'One or more products in your cart are no longer available.');
            } else {
                showError('Order Failed', 'Unable to process your order. Please check your connection and try again.');
            }
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return null; // Will redirect
    }

    const subtotal = getCartTotal();
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Shipping Information */}
                    <div>
                        <h1 className="text-3xl font-walter font-bold text-black mb-8">Checkout</h1>

                        {!isAuthenticated && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm font-simon text-blue-800 mb-2">
                                    Already have an account?{" "}
                                    <Link href="/auth/signin" className="underline font-semibold">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        )}

                        {/* Contact Information */}
                        <div className="bg-white rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-walter font-bold text-black mb-4">Contact Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-simon text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={shippingInfo.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-simon text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={shippingInfo.phone}
                                        onChange={handleInputChange}
                                        placeholder="+234 XXX XXX XXXX"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-walter font-bold text-black">Shipping Address</h2>
                                {isAuthenticated && savedAddresses.length > 0 && !useNewAddress && (
                                    <button
                                        type="button"
                                        onClick={() => setUseNewAddress(true)}
                                        className="text-sm font-simon text-blue-600 hover:text-blue-800"
                                    >
                                        + Add New Address
                                    </button>
                                )}
                            </div>

                            {/* Saved Addresses Selection */}
                            {isAuthenticated && savedAddresses.length > 0 && !useNewAddress && (
                                <div className="space-y-3 mb-4">
                                    {savedAddresses.map((address) => (
                                        <label
                                            key={address.id}
                                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                selectedAddressId === address.id
                                                    ? 'border-black bg-gray-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="savedAddress"
                                                value={address.id}
                                                checked={selectedAddressId === address.id}
                                                onChange={() => handleAddressSelection(address.id)}
                                                className="sr-only"
                                            />
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <p className="font-semibold text-gray-900">
                                                            {address.first_name} {address.last_name}
                                                        </p>
                                                        {address.is_default && (
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {address.address_line1}
                                                        {address.address_line2 && `, ${address.address_line2}`}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {address.city}, {address.postal_code}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{address.country}</p>
                                                    {address.phone && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {address.phone_country_code} {address.phone}
                                                        </p>
                                                    )}
                                                </div>
                                                {selectedAddressId === address.id && (
                                                    <svg
                                                        className="w-5 h-5 text-black"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* New Address Form */}
                            {(useNewAddress || savedAddresses.length === 0) && (
                                <div>
                                    {useNewAddress && savedAddresses.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUseNewAddress(false);
                                                if (savedAddresses.length > 0) {
                                                    const defaultAddr = savedAddresses.find(a => a.is_default);
                                                    setSelectedAddressId(defaultAddr?.id || savedAddresses[0].id);
                                                }
                                            }}
                                            className="text-sm font-simon text-gray-600 hover:text-gray-800 mb-4 flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Back to saved addresses
                                        </button>
                                    )}
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                        <label htmlFor="firstName" className="block text-sm font-simon text-gray-700 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={shippingInfo.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-simon text-gray-700 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={shippingInfo.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-simon text-gray-700 mb-1">
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={shippingInfo.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-simon text-gray-700 mb-1">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={shippingInfo.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-sm font-simon text-gray-700 mb-1">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={shippingInfo.state}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="postalCode" className="block text-sm font-simon text-gray-700 mb-1">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            value={shippingInfo.postalCode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-simon text-gray-700 mb-1">
                                            Country *
                                        </label>
                                        <select
                                            id="country"
                                            name="country"
                                            value={shippingInfo.country}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-black"
                                            required
                                        >
                                            <option value="Nigeria">Nigeria</option>
                                            <option value="Ghana">Ghana</option>
                                            <option value="Kenya">Kenya</option>
                                            <option value="South Africa">South Africa</option>
                                        </select>
                                    </div>
                                </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div>
                        <div className="bg-white rounded-lg p-6 sticky top-4">
                            <h2 className="text-xl font-walter font-bold text-black mb-6">Order Summary</h2>

                            {/* Cart Items */}
                            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-walter font-semibold text-black text-sm truncate">
                                                {item.name}
                                            </h3>
                                            {item.color && (
                                                <p className="text-xs font-simon text-gray-600">Color: {item.color}</p>
                                            )}
                                            {item.size && (
                                                <p className="text-xs font-simon text-gray-600">Size: {item.size}</p>
                                            )}
                                            <p className="text-xs font-simon text-gray-600">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-dancing font-bold text-black">
                                                ₦{(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pricing Summary */}
                            <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
                                <div className="flex justify-between font-simon text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-black">₦{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-simon text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between font-walter font-bold text-lg pt-2 border-t border-gray-200">
                                    <span className="text-black">Total</span>
                                    <span className="text-black">₦{total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || !paystackLoaded}
                                className="w-full bg-black text-white py-4 rounded-lg font-walter font-bold text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? "Processing..." : !paystackLoaded ? "Loading Payment..." : "Proceed to Payment"}
                            </button>

                            <div className="flex items-center justify-center gap-2 mt-3">
                                <span className="text-xs font-simon text-gray-500">Secured by</span>
                                <span className="text-sm font-bold text-green-600">Paystack</span>
                            </div>

                            <p className="text-xs font-simon text-gray-500 text-center mt-4">
                                By placing your order, you agree to our{" "}
                                <Link href="/terms" className="underline">
                                    Terms & Conditions
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
