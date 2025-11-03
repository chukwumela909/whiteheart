"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    images: string[] | null;
    category: string;
    colors: { name: string; hex: string }[] | null;
    stock_quantity: number;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("default");

    const supabase = createClient();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (error) throw error;

            setProducts(data || []);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Get unique categories
    const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

    // Filter and sort products
    const getFilteredAndSortedProducts = () => {
        let filtered = products;

        // Filter by category
        if (selectedCategory !== "all") {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Sort products
        switch (sortBy) {
            case "price-low":
                filtered = [...filtered].sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                filtered = [...filtered].sort((a, b) => b.price - a.price);
                break;
            case "name":
                filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Keep default order (newest first)
                break;
        }

        return filtered;
    };

    const displayedProducts = getFilteredAndSortedProducts();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white">
                {/* Header */}
                <div className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-walter font-bold text-black mb-2">Shop All</h1>
                    <p className="text-gray-600 font-simon">
                        {displayedProducts.length} {displayedProducts.length === 1 ? 'product' : 'products'}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters and Sort */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-simon transition-colors ${
                                    selectedCategory === category
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="sort" className="text-sm font-simon text-gray-600">
                            Sort by:
                        </label>
                        <select
                            id="sort"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-simon focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="default">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {displayedProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                        <h3 className="text-lg font-walter font-semibold text-gray-900 mb-2">
                            No products found
                        </h3>
                        <p className="text-gray-600 font-simon">
                            {selectedCategory !== "all" 
                                ? "Try selecting a different category"
                                : "Check back soon for new products"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedProducts.map((product) => {
                            const imageUrl = product.images?.[0] || product.image_url;
                            const secondImageUrl = product.images?.[1];

                            return (
                                <Link
                                    href={`/product/${product.id}`}
                                    key={product.id}
                                    className="group cursor-pointer"
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-lg bg-gray-100">
                                        {imageUrl ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                                                />
                                                {secondImageUrl && (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img
                                                        src={secondImageUrl}
                                                        alt={`${product.name} - alternate view`}
                                                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg
                                                    className="w-16 h-16 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Out of stock badge */}
                                        {product.stock_quantity === 0 && (
                                            <div className="absolute top-2 right-2 bg-black text-white px-3 py-1 rounded-full text-xs font-simon">
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div>
                                        <h3 className="font-walter font-semibold text-black mb-1 group-hover:underline">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm font-simon text-gray-600 mb-2 capitalize">
                                            {product.category}
                                        </p>
                                        <p className="font-dancing font-bold text-black">
                                            ₦{product.price.toLocaleString()}
                                        </p>

                                        {/* Color swatches */}
                                        {product.colors && product.colors.length > 0 && (
                                            <div className="flex gap-1.5 mt-2">
                                                {product.colors.slice(0, 5).map((color, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-5 h-5 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: color.hex }}
                                                        title={color.name}
                                                    />
                                                ))}
                                                {product.colors.length > 5 && (
                                                    <div className="w-5 h-5 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-[10px] text-gray-600">
                                                        +{product.colors.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
        <Footer />
        </>
    );
}
