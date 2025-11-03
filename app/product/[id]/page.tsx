"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/app/contexts/CartContext";
import { useNotification } from "@/app/contexts/NotificationContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    images: string[] | null; // Multiple images
    stock_quantity: number;
    colors: { name: string; hex: string }[];
    sizes: { name: string; stock: number }[];
    is_active: boolean;
}

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [productImages, setProductImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addedToCart, setAddedToCart] = useState(false);
    
    const router = useRouter();
    const supabase = createClient();
    const { addToCart } = useCart();
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        loadProduct();
    }, [params.id]);

    const loadProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .eq('is_active', true)
                .single();

            if (error) throw error;
            
            if (!data) {
                setError('Product not found');
                return;
            }

            setProduct(data);
            
            // Set product images from images array or fallback to single image_url
            if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                setProductImages(data.images);
            } else if (data.image_url) {
                setProductImages([data.image_url]);
            }
            
            // Set first size as default if available
            if (data.sizes && data.sizes.length > 0) {
                setSelectedSize(data.sizes[0].name);
            }
        } catch (err) {
            console.error('Error loading product:', err);
            setError('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0); // Reset touch end
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNextImage();
        } else if (isRightSwipe) {
            handlePrevImage();
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {loading ? (
                <div className="max-w-7xl mx-auto px-5 py-20">
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                            <p className="font-simon text-gray-600">Loading product...</p>
                        </div>
                    </div>
                </div>
            ) : error || !product ? (
                <div className="max-w-7xl mx-auto px-5 py-20">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-walter font-bold mb-2">{error || 'Product not found'}</h2>
                        <p className="font-simon text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-black text-white px-6 py-3 rounded font-walter font-bold hover:bg-gray-800 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Size Guide Modal */}
                    {showSizeGuide && (
                <div className="fixed inset-0 bg-[#51515137] backdrop-blur-sm bg-opacity-40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg  w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-extrabold font-simon">Cap Size Guide</h2>
                            <button
                                onClick={() => setShowSizeGuide(false)}
                                className="p-1 hover:opacity-70 transition-opacity"
                                aria-label="Close modal"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Cap Image */}
                        <div className="mb-8 flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870789/product-image-removebg-preview_s0awsc.png"
                                alt="Cap size guide"
                                className="max-h-64 object-contain"
                            />
                        </div>

                        {/* Size Guide Table */}
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-black">
                                        <th className="text-left py-3 px-4 font-extrabold font-simon">Size</th>
                                        <th className="text-left py-3 px-4 font-extrabold font-simon">Head Circumference (cm)</th>
                                        <th className="text-left py-3 px-4 font-extrabold font-simon">Head Circumference (inches)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-4 font-simon font-bold">XS</td>
                                        <td className="py-3 px-4 font-simon">52-54 cm</td>
                                        <td className="py-3 px-4 font-simon">20.5-21.3 inches</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-4 font-simon font-bold">S</td>
                                        <td className="py-3 px-4 font-simon">54-56 cm</td>
                                        <td className="py-3 px-4 font-simon">21.3-22 inches</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-4 font-simon font-bold">M</td>
                                        <td className="py-3 px-4 font-simon">56-58 cm</td>
                                        <td className="py-3 px-4 font-simon">22-22.8 inches</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-4 font-simon font-bold">L</td>
                                        <td className="py-3 px-4 font-simon">58-60 cm</td>
                                        <td className="py-3 px-4 font-simon">22.8-23.6 inches</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-simon font-bold">XL</td>
                                        <td className="py-3 px-4 font-simon">60-62 cm</td>
                                        <td className="py-3 px-4 font-simon">23.6-24.4 inches</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Measurement Instructions */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-extrabold font-simon mb-3">How to Measure</h3>
                            <ol className="space-y-2 font-simon text-sm text-gray-700">
                                <li className="flex gap-2">
                                    <span className="font-bold">1.</span>
                                    <span>Use a flexible measuring tape or a string that you can measure later.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">2.</span>
                                    <span>Wrap the tape around your head, positioning it about 1 inch above your eyebrows and ears.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">3.</span>
                                    <span>Make sure the tape is level and snug, but not too tight.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold">4.</span>
                                    <span>Note the measurement and compare it to our size chart above.</span>
                                </li>
                            </ol>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowSizeGuide(false)}
                                className="px-6 py-2.5 bg-black text-white text-sm font-bold font-simon rounded-md hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-5 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left Side - Product Images */}
                    <div className="relative ">
                        <div 
                            className="relative aspect-[4/3] flex items-center justify-center overflow-hidden touch-pan-y select-none"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {productImages.length > 0 ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={productImages[currentImageIndex]}
                                        alt={`${product.name} - Image ${currentImageIndex + 1}`}
                                        className="w-full h-72 mb-10 object-contain pointer-events-none"
                                    />
                                    
                                    {/* Navigation Arrows - show only if multiple images */}
                                    {productImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePrevImage}
                                                className="hidden absolute left-1 top-1/2 -translate-y-1/2 w-12 h-20 md:flex items-center justify-center hover:opacity-70 transition-opacity"
                                                aria-label="Previous image"
                                            >
                                                <svg width="50" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={handleNextImage}
                                                className="hidden absolute right-1 top-1/2 -translate-y-1/2 w-12 h-12 md:flex items-center justify-center hover:opacity-70 transition-opacity"
                                                aria-label="Next image"
                                            >
                                                <svg width="50" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-72 mb-10 flex items-center justify-center bg-gray-100 rounded-lg">
                                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        
                        {/* Thumbnail indicator dots - show only if multiple images */}
                        {productImages.length > 1 && (
                            <div className="flex justify-center gap-2">
                                {productImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-7 h-1 transition-all ${index === currentImageIndex ? "bg-black w-8" : "bg-gray-300"}`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Side - Product Details */}
                    <div className="flex flex-col ">
                        <h1 className="text-2xl text-black font-walter font-bold mb-2 tracking-tight">{product.name}</h1>

                        <div className="mb-6">
                            <p className="text-medium font-dancing text-black font-extrabold mb-1">₦{product.price.toLocaleString()}</p>
                            <p className="text-xs font-simon text-gray-600">Taxes and duties included</p>
                        </div>

                        {/* Product Description */}
                        {product.description && (
                            <div className="mb-6">
                                <p className="text-sm font-simon text-gray-700">{product.description}</p>
                            </div>
                        )}

                        {/* Category & Stock Info */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {product.category && (
                                <span className="px-4 py-2 border text-black border-black rounded-full text-xs font-simon tracking-wide">
                                    {product.category}
                                </span>
                            )}
                            <span className="px-4 py-2 border text-black border-black rounded-full text-xs font-simon tracking-wide">
                                {product.stock_quantity} in stock
                            </span>
                        </div>

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-walter text-black font-bold">Color</h3>
                                    <span className="text-sm font-simon">{product.colors[selectedColor].name}</span>
                                </div>
                                <div className="flex gap-3">
                                    {product.colors.map((color, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedColor(index)}
                                            className={`w-12 h-12 rounded-full border-2 transition-all ${selectedColor === index ? "border-black" : "border-gray-300"
                                                }`}
                                            style={{ backgroundColor: color.hex }}
                                            aria-label={`Select ${color.name} color`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-walter font-bold">Size</h3>
                                    <button 
                                        onClick={() => setShowSizeGuide(true)}
                                        className="text-sm font-simon underline hover:no-underline"
                                    >
                                        Size Guide
                                    </button>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size.name}
                                            onClick={() => setSelectedSize(size.name)}
                                            disabled={size.stock === 0}
                                            className={`py-3 border transition-all font-simon text-sm ${
                                                size.stock === 0
                                                    ? "border-gray-200 text-gray-400 cursor-not-allowed line-through"
                                                    : selectedSize === size.name
                                                        ? "border-black bg-black text-white"
                                                        : "border-gray-300 hover:border-black"
                                            }`}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add to Bag Button */}
                        <button 
                            onClick={() => {
                                if (!product) return;
                                
                                // Check if size is required and selected
                                if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                                    showError("Size Required", "Please select a size before adding to cart");
                                    return;
                                }

                                const imageUrl = productImages[0] || product.image_url;
                                const selectedColorName = product.colors && product.colors.length > 0 
                                    ? product.colors[selectedColor].name 
                                    : undefined;

                                addToCart({
                                    product_id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image_url: imageUrl,
                                    color: selectedColorName,
                                    size: selectedSize || undefined,
                                });

                                showSuccess("Added to Cart", `${product.name} has been added to your cart`);
                                setAddedToCart(true);
                                setTimeout(() => setAddedToCart(false), 2000);
                            }}
                            disabled={!product || (product.sizes && product.sizes.length > 0 && !selectedSize)}
                            className={`w-full rounded-md text-white py-4 font-walter font-bold text-lg tracking-wide transition-colors ${
                                addedToCart 
                                    ? "bg-green-600 hover:bg-green-700" 
                                    : "bg-[#A08B7A] hover:bg-[#8B7A6A]"
                            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                        >
                            {addedToCart ? "Added to Bag ✓" : "Add to Bag"}
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
                </>
            )}
        </div>
    );
}
