"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import Link from "next/link";

export default function AdminDashboard() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
    });
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkAdminAccess();
        loadStats();
    }, []);

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/auth/signin');
            return;
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('is_admin')
            .eq('user_id', user.id)
            .single();

        if (!profile?.is_admin) {
            alert('Access Denied: Admin privileges required');
            router.push('/');
            return;
        }

        setIsAdmin(true);
        setLoading(false);
    };

    const loadStats = async () => {
        // Load products count
        const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        // Load orders count
        const { count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        // Load pending orders count
        const { count: pendingCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Load total revenue
        const { data: orders } = await supabase
            .from('orders')
            .select('total_amount');

        const revenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        setStats({
            totalProducts: productsCount || 0,
            totalOrders: ordersCount || 0,
            pendingOrders: pendingCount || 0,
            totalRevenue: revenue
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="font-simon">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <>
            <AdminNavbar />
            <div className="min-h-screen bg-gray-50 py-12 px-8 md:px-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600 font-simon">Manage your store products and orders</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-simon text-gray-600 mb-1">Total Products</p>
                                    <p className="text-3xl font-bold">{stats.totalProducts}</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-simon text-gray-600 mb-1">Total Orders</p>
                                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-simon text-gray-600 mb-1">Pending Orders</p>
                                    <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-simon text-gray-600 mb-1">Total Revenue</p>
                                    <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                                </div>
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/admin/products" className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Product Management</h3>
                                    <p className="text-gray-600 font-simon mb-4">
                                        Add, edit, or remove products from your catalog. Manage inventory, pricing, and product details.
                                    </p>
                                    <span className="inline-flex items-center text-blue-600 font-simon font-semibold">
                                        Manage Products
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </Link>

                        <Link href="/admin/orders" className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Order Management</h3>
                                    <p className="text-gray-600 font-simon mb-4">
                                        View and manage customer orders. Update order status, view customer details, and track fulfillment.
                                    </p>
                                    <span className="inline-flex items-center text-green-600 font-simon font-semibold">
                                        Manage Orders
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
