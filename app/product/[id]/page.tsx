"use client";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState("M");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    // Sample product data - you can replace this with actual data fetching
    const product = {
        name: "Special edition WH cap",
        price: "220 EUR",
        taxInfo: "Taxes and duties included",
        features: [
            { label: "100g" },
            { label: "Special edition WH cap" },
            { label: "Butthub" },
            { label: "BONDED SEAMS" }
        ],
        colors: [
            { name: "Falcon", hex: "#A08B7A" },
            { name: "Core", hex: "#2D2D2D" }
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        images: [
            "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870789/product-image-removebg-preview_s0awsc.png",
            "https://satisfyrunning.com/cdn/shop/files/12019-FA_justice-2-5-distance-shorts_falcon_front.jpg?v=1757024684&width=1200",
              "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870789/product-image-removebg-preview_s0awsc.png",
        ]
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
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
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.images[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-72 mb-10 object-contain pointer-events-none"
                            />

                            {/* Navigation Arrows */}
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
                                    <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="1 " strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Thumbnail indicator dots */}
                        <div className="flex justify-center gap-2   ">
                            {product.images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-7 h-1 transition-all ${index === currentImageIndex ? "bg-black w-8" : "bg-gray-300"
                                        }`}
                                    aria-label={`Go to image ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Product Details */}
                    <div className="flex flex-col ">
                        <h1 className="text-2xl text-black font-walter font-bold mb-2 tracking-tight">{product.name}</h1>

                        <div className="mb-6">
                            <p className="text-medium font-dancing text-black font-extrabold mb-1">{product.price}</p>
                            <p className="text-xs font-simon text-gray-600">{product.taxInfo}</p>
                        </div>

                        {/* Feature Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {product.features.map((feature, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 border text-black border-black rounded-full text-xs font-simon tracking-wide"
                                >
                                    {feature.label}
                                </span>
                            ))}
                        </div>

                        {/* Color Selection */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-walter text-black font-bold">Core</h3>
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

                        {/* Size Selection */}
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
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`py-3 border transition-all font-simon text-sm ${selectedSize === size
                                                ? "border-black bg-black text-white"
                                                : "border-gray-300 hover:border-black"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add to Bag Button */}
                        <button className="w-full bg-[#A08B7A] rounded-md text-white py-4 font-walter font-bold text-lg tracking-wide hover:bg-[#8B7A6A] transition-colors">
                            Add to Bag
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
