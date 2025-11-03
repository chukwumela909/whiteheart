"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isUserAdmin } from "@/lib/admin-helpers";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import SuccessModal from "../../components/SuccessModal";
import ErrorModal from "../../components/ErrorModal";
import Link from "next/link";

interface Order {
    id: string;
    order_number: string;
    user_id: string;
    total_amount: number;
    status: string;
    created_at: string;
    user_profiles?: {
        first_name: string;
        last_name: string;
    };
    user_addresses?: {
        address_line1: string;
        city: string;
        country: string;
    };
}

interface OrderItem {
    id: string;
    product_id: string;
    color_name: string;
    size_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    products?: {
        name: string;
    };
}

export default function OrderManagementPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    // Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        const admin = await isUserAdmin();
        if (!admin) {
            setErrorMessage('Access denied. Admin privileges required.');
            setShowErrorModal(true);
            setTimeout(() => router.push('/'), 2000);
            return;
        }
        loadOrders();
    };

    const loadOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    user_profiles(first_name, last_name),
                    user_addresses(address_line1, city, country)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            setErrorMessage('Error loading orders. Please try again.');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const loadOrderItems = async (orderId: string) => {
        try {
            const { data, error } = await supabase
                .from('order_items')
                .select(`
                    *,
                    products(name)
                `)
                .eq('order_id', orderId);

            if (error) throw error;
            setOrderItems(data || []);
        } catch (error) {
            console.error('Error loading order items:', error);
        }
    };

    const handleViewDetails = async (order: Order) => {
        setSelectedOrder(order);
        await loadOrderItems(order.id);
        setShowDetailsModal(true);
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingStatus(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (error) throw error;

            // Update local state
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }

            setSuccessMessage('Order status updated successfully');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error updating order status:', error);
            setErrorMessage('Error updating order status. Please try again.');
            setShowErrorModal(true);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user_profiles?.first_name + ' ' + order.user_profiles?.last_name).toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <>
                <AdminNavbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                        <p className="mt-4 font-simon">Loading orders...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <AdminNavbar />
            <div className="min-h-screen bg-gray-50 py-12 px-8 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <Link href="/admin" className="text-blue-600 hover:underline font-simon mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold mb-2">Order Management</h1>
                        <p className="text-gray-600 font-simon">View and manage all customer orders</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold font-simon mb-2">Search Orders</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by order number or customer name..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold font-simon mb-2">Filter by Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <p className="text-gray-600 font-simon text-lg">No orders found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-simon">
                                                Order Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-simon">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-simon">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-simon">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-simon">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider font-simon">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-simon font-semibold text-gray-900">
                                                        {order.order_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-simon text-gray-900">
                                                        {order.user_profiles?.first_name} {order.user_profiles?.last_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-simon text-gray-900">
                                                        ₦{order.total_amount.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-simon font-semibold ${getStatusColor(order.status)}`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-simon text-gray-600">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleViewDetails(order)}
                                                        className="text-blue-600 hover:underline font-simon text-sm"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}></div>
                    <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold font-dancing">Order Details</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold font-simon mb-3">Order Information</h3>
                                    <div className="space-y-2 font-simon">
                                        <p><span className="font-semibold">Order Number:</span> {selectedOrder.order_number}</p>
                                        <p><span className="font-semibold">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                        <p><span className="font-semibold">Total:</span> ₦{selectedOrder.total_amount.toFixed(2)}</p>
                                        <div>
                                            <span className="font-semibold">Status:</span>
                                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold font-simon mb-3">Customer Information</h3>
                                    <div className="space-y-2 font-simon">
                                        <p><span className="font-semibold">Name:</span> {selectedOrder.user_profiles?.first_name} {selectedOrder.user_profiles?.last_name}</p>
                                        {selectedOrder.user_addresses && (
                                            <>
                                                <p className="font-semibold mt-3">Shipping Address:</p>
                                                <p className="text-gray-700">
                                                    {selectedOrder.user_addresses.address_line1}<br />
                                                    {selectedOrder.user_addresses.city}<br />
                                                    {selectedOrder.user_addresses.country}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Update Status */}
                            <div>
                                <h3 className="text-lg font-semibold font-simon mb-3">Update Order Status</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                            disabled={updatingStatus || selectedOrder.status === status}
                                            className={`px-4 py-2 rounded-lg font-simon text-sm transition-colors ${
                                                selectedOrder.status === status
                                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
                                            }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-lg font-semibold font-simon mb-3">Order Items</h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase font-simon">Product</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase font-simon">Color</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase font-simon">Size</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase font-simon">Qty</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase font-simon">Price</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase font-simon">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {orderItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3 font-simon">{item.products?.name}</td>
                                                    <td className="px-4 py-3 font-simon">{item.color_name}</td>
                                                    <td className="px-4 py-3 font-simon">{item.size_name}</td>
                                                    <td className="px-4 py-3 font-simon">{item.quantity}</td>
                                                    <td className="px-4 py-3 font-simon">₦{item.unit_price.toFixed(2)}</td>
                                                    <td className="px-4 py-3 font-simon font-semibold">₦{item.subtotal.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
            
            {/* Success and Error Modals */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Success"
                message={successMessage}
            />
            
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title="Error"
                message={errorMessage}
            />
        </>
    );
}
