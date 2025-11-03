"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    order_items: {
        id: string;
        quantity: number;
        products: {
            name: string;
            image_url: string;
            images: string[] | null;
        };
    }[];
}

export default function Orders() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function loadUser() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                    router.push('/auth/signin');
                    return;
                }
                
                setUserEmail(session.user.email || "");
                await loadOrders(session.user.id);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading user:', error);
                router.push('/auth/signin');
            }
        }
        
        loadUser();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/auth/signin');
            } else {
                setUserEmail(session.user.email || "");
                loadOrders(session.user.id);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router, supabase]);

    const loadOrders = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        id,
                        quantity,
                        products (
                            name,
                            image_url,
                            images
                        )
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'text-green-600 bg-green-50';
            case 'shipped':
                return 'text-blue-600 bg-blue-50';
            case 'processing':
                return 'text-yellow-600 bg-yellow-50';
            case 'cancelled':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth/signin');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-[#51515137] backdrop-blur-sm bg-opacity-40 z-50 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Menu */}
            <div className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Close Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-4 left-4 p-2 hover:opacity-70 transition-opacity"
                    aria-label="Close menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Logo */}
                <div className="flex justify-center pt-6 pb-8 border-b border-gray-200">
                    <Link href="/" className="flex items-center space-x-1 cursor-pointer select-none">
                        <div className="font-dancing m-0 p-0 text-3xl font-bold flex flex-col leading-none text-black">
                            <h1>White Heart</h1>
                        </div>
                    </Link>
                </div>

                {/* User Email */}
                <div className="px-6 py-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                    <svg width="24" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="grey" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        <span className="text-md text-gray-800">{userEmail}</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="py-6 border-b border-gray-200">
                    <Link
                        href="/"
                        className="block px-6 py-4 text-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Shop
                    </Link>
                    <Link
                        href="/orders"
                        className="block px-6 py-4 text-lg font-bold   border-black hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Orders
                    </Link>
                </nav>

                {/* Bottom Links */}
                <div className="absolute bottom-0 left-0 right-0 pb-6 border-t border-gray-200">
                    <Link
                        href="/profile"
                        className="block px-6 py-4 text-base hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Profile
                    </Link>
                    {/* <Link
                        href="/settings"
                        className="block px-6 py-4 text-base hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Settings
                    </Link> */}
                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleSignOut();
                        }}
                        className="block w-full text-left px-6 py-4 text-base hover:bg-gray-50 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 hover:opacity-70 transition-opacity"
                        aria-label="Open menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {/* Logo and Navigation */}
                    <div className="flex text-center items-center space-x-8">
                        <Link href="/" className="flex items-center space-x-1 cursor-pointer select-none">
                            <div className="font-dancing mr-5 p-0 text-2xl font-bold flex flex-col leading-none text-black">
                                <h1>White Heart</h1>
                               
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href="/" className="text-sm font-bold hover:opacity-70 transition-opacity">
                                Shop
                            </Link>
                            <Link href="/orders" className="text-sm font-bold border-b-2 border-black">
                                Orders
                            </Link>
                        </nav>
                    </div>

                    {/* User Account Dropdown - Desktop Only */}
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2 hover:opacity-70 transition-opacity"
                            aria-label="User menu"
                        >

                            <svg width="24" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="grey" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>

                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                            >
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-200 flex items-center space-x-3">
                                    <svg width="24" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="grey" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                                    <span className="text-sm text-gray-700">{userEmail}</span>
                                </div>
                                <Link
                                    href="/profile"
                                    className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Profile
                                </Link>
                                {/* <Link
                                    href="/settings"
                                    className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Settings
                                </Link> */}
                                <button
                                    onClick={handleSignOut}
                                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-2xl font-extrabold font-simon mb-12">Orders</h1>

                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : orders.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-lg   py-24 text-center">
                        <h2 className="text-lg font-extrabold font-simon mb-2">No orders yet</h2>
                        <p className="text-gray-600 text-md mb-6">
                            Go to store to place an order.
                        </p>
                        {/* <Link
                            href="/"
                            className="inline-block px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                            Go to Store
                        </Link> */}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                                            <div>
                                                <p className="text-sm text-gray-500">Order Number</p>
                                                <p className="font-semibold text-gray-900">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Placed On</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="space-y-3">
                                            {order.order_items.slice(0, 3).map((item) => {
                                                const imageUrl = item.products.images?.[0] || item.products.image_url;
                                                return (
                                                    <div key={item.id} className="flex items-center space-x-4">
                                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                                                            {imageUrl && (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={item.products.name}
                                                                    className="w-full h-full object-cover object-center"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {item.products.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Quantity: {item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {order.order_items.length > 3 && (
                                                <p className="text-sm text-gray-500 pl-20">
                                                    + {order.order_items.length - 3} more item{order.order_items.length - 3 !== 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Footer */}
                                    <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₦{order.total_amount.toLocaleString()}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                        >
                                            View Details
                                            <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white mt-auto fixed bottom-0 w-full  ">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center space-x-6 text-sm">
                    <button className="flex items-center space-x-2 hover:opacity-70 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 14 14" className="a8x1wuy a8x1wux _1fragem32 _1fragemq1 _1fragemly _1fragemlo _1fragemp6" focusable="false" aria-hidden="true"><g clip-path="url(#globe_svg__a)"><path stroke-linejoin="round" d="M9.1 1.807a5.6 5.6 0 0 0-7.218 2.916M9.1 1.807a5.6 5.6 0 0 1 3.345 6.509M9.1 1.807 9 2.3c-.102.25-.528.388-.9.5-.28.09-.91.1-.91.89-.019.237-.138.61-.284.81-.118.162-.448.334-.557.45-.116.08-.337.314-.297.62.05.38.308.83.854.88.437.04 1.71.017 2.292 0 .318-.05 1.292-.013 1.354 1.3.021.45-.045.566.4.566h1.493m0 0a5.6 5.6 0 0 1-5.68 4.28m0 0a5.6 5.6 0 0 1-4.883-7.873m4.884 7.873V10.6c-.03-.317-.319-.99-1.235-1.15-1.147-.2-1.135-1-1.135-1.608 0-.487-.363-.964-.544-1.142L2.2 5.06l-.318-.337"></path></g></svg>
                        <span>Nigeria</span>

                    </button>
                    <Link href="/refund-policy" className="hover:underline">
                        Refund policy
                    </Link>
                    <Link href="/shipping" className="hover:underline">
                        Shipping
                    </Link>
                    <Link href="/privacy" className="hover:underline">
                        Privacy policy
                    </Link>
                    <Link href="/terms" className="hover:underline">
                        Terms of service
                    </Link>
                </div>
            </footer>
        </div>
    );
}
