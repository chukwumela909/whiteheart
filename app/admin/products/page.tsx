"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import SuccessModal from "../../components/SuccessModal";
import ErrorModal from "../../components/ErrorModal";
import ConfirmModal from "../../components/ConfirmModal";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    stock_quantity: number;
    image_url: string;
    created_at: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    
    // Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
    
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkAdminAccess();
        loadProducts();
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
            setErrorMessage('Access Denied: Admin privileges required');
            setShowErrorModal(true);
            setTimeout(() => router.push('/'), 2000);
            return;
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading products:', error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    const handleDeleteClick = (productId: string, productName: string) => {
        setProductToDelete({ id: productId, name: productName });
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productToDelete.id);

        if (error) {
            setErrorMessage('Error deleting product: ' + error.message);
            setShowErrorModal(true);
        } else {
            setSuccessMessage('Product deleted successfully');
            setShowSuccessModal(true);
            loadProducts();
        }
        setProductToDelete(null);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

    return (
        <>
            <AdminNavbar />
            <div className="min-h-screen bg-gray-50 py-12 px-8 md:px-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link href="/admin" className="text-blue-600 hover:underline font-simon mb-2 inline-block">
                                ← Back to Dashboard
                            </Link>
                            <h1 className="text-4xl font-bold">Product Management</h1>
                            <p className="text-gray-600 font-simon mt-2">{products.length} total products</p>
                        </div>
                        <Link 
                            href="/admin/products/new"
                            className="bg-black text-white px-6 py-3 rounded-lg font-simon hover:bg-gray-800 transition-colors"
                        >
                            + Add New Product
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-simon font-semibold mb-2">Search Products</label>
                                <input
                                    type="text"
                                    placeholder="Search by name or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-simon font-semibold mb-2">Filter by Category</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat === 'all' ? 'All Categories' : cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                            <p className="font-simon">Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <h3 className="text-xl font-bold mb-2">No products found</h3>
                            <p className="text-gray-600 font-simon mb-6">
                                {searchQuery || filterCategory !== 'all' 
                                    ? 'Try adjusting your filters' 
                                    : 'Get started by adding your first product'}
                            </p>
                            {!searchQuery && filterCategory === 'all' && (
                                <Link 
                                    href="/admin/products/new"
                                    className="inline-block bg-black text-white px-6 py-3 rounded-lg font-simon hover:bg-gray-800 transition-colors"
                                >
                                    + Add Your First Product
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold font-simon text-gray-700">Image</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold font-simon text-gray-700">Product</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold font-simon text-gray-700">Category</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold font-simon text-gray-700">Price</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold font-simon text-gray-700">Stock</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold font-simon text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {product.image_url ? (
                                                        <img 
                                                            src={product.image_url} 
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-semibold font-simon">{product.name}</div>
                                                    <div className="text-sm text-gray-600 font-simon line-clamp-1">
                                                        {product.description}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-simon">
                                                    {product.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-simon">
                                                ₦{product.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-simon ${product.stock_quantity < 10 ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                                                    {product.stock_quantity} units
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="text-blue-600 hover:underline font-simon text-sm"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteClick(product.id, product.name)}
                                                        className="text-red-600 hover:underline font-simon text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            
            {/* Modals */}
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
            
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setProductToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDanger={true}
            />
        </>
    );
}
