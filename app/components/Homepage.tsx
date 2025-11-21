"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Link from "next/link";

interface SlideItem {
    image: string;
    title: string;
    subtitle: string;
}

interface ProductItem {
    id: string;
    name: string;
    price: number;
    image_url: string;
    colors: { name: string; hex: string }[];
    category: string;
    stock_quantity: number;
}

const slides: SlideItem[] = [
    {
        image: "https://satisfyrunning.com/cdn/shop/files/Summer-Essentials-Homepage-Desktop_7_2000x.progressive.jpg",
        title: "Summer Essentials",
        subtitle: "EQUIPMENT FOR ALL PURSUITS",
    },
    {
        image: "https://satisfyrunning.com/cdn/shop/files/satisfy-homepage-the-rocker_2000x.progressive.jpg",
        title: "The Rocker",
        subtitle: "PERFORMANCE REDEFINED",
    },
];

export const Homepage = () => {
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const supabase = createClient();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handleTogglePlayPause = useCallback(() => {
        setIsPlaying((p) => !p);
    }, []);

    const handleGoToSlide = useCallback((index: number) => {
        setCurrentSlide(index);
    }, []);

    return (
        <div className="bg-white w-full">
            <div className="bg-black text-white text-center py-1 text-xs font-medium tracking-wider w-full">
                FREE SHIPPING. FREE RETURNS.
            </div>

            <nav className="absolute left-0 right-0 z-10">
                <Navbar transparent={true} />
            </nav>

            <div className="relative h-[80vh] w-full overflow-hidden">
                <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {slides.map((slide, index) => (
                        <div key={index} className="relative w-full h-full flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={slide.image} alt={`${slide.title} - ${slide.subtitle}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
                                <h1 className="text-5xl md:text-7xl font-walter font-extrabold mb-2 tracking-tight">{slide.title}</h1>
                                <p className="text-lg md:text-md font-simon uppercase mb-10 font-light tracking-wider">{slide.subtitle}</p>
                                <Link href="/shop" className="bg-white text-black uppercase font-walter font-extrabold tracking-wider py-1 px-6 rounded-full hover:bg-gray-200 transition-colors text-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" tabIndex={0} aria-label={`Shop ${slide.title}`}>SHOP</Link>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                    <div className="flex space-x-2">
                        {slides.map((_, index) => (
                            <button key={index} onClick={() => handleGoToSlide(index)} className={`w-8 h-[2px] rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white" : "bg-white/30"}`} aria-label={`Go to slide ${index + 1}`} />
                        ))}
                    </div>
                </div>
                <button onClick={handleTogglePlayPause} aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"} tabIndex={0} className="absolute bottom-10 right-10 text-white focus:outline-none hover:opacity-80 transition-opacity">
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                </button>
            </div>

            <div className="relative bg-white w-full flex justify-between content-between flex-col">
                <div className="flex-1 flex flex-col w-full pt-10 pb-4">
                    <div className="text-center shrink-0">
                        <h2 className="text-3xl md:text-5xl font-walter font-extrabold text-black tracking-tight">New Arrivals</h2>
                    </div>
                    <div className="relative  min-h-0 ">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="font-simon text-gray-600">No products available yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto h-full w-full" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                                <div className="flex items-start gap-8 h-full pb-2" style={{ minWidth: "max-content" }}>
                                    {products.map((product) => (
                                        <Link key={product.id} href={`/product/${product.id}`} className="flex-shrink-0 w-56 md:w-72 group cursor-pointer select-none">
                                            <div className="relative aspect-[4/4] md:aspect-[4/4]  rounded-lg overflow-hidden">
                                                {product.image_url ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img 
                                                            src={product.image_url} 
                                                            alt={product.name} 
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                                        />
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center px-1">
                                                <h3 className="font-walter font-bold text-base md:text-sm text-black mb-1 tracking-tight leading-snug">{product.name}</h3>
                                                <p className="font-simon text-xs md:text-xs text-gray-700 mb-3 tracking-wide">₦{product.price.toLocaleString()}</p>
                                                <div className="flex justify-center gap-2">
                                                    {product.colors && product.colors.length > 0 && product.colors.map((color, index) => (
                                                        <button 
                                                            key={index} 
                                                            className="w-3.5 h-3.5 rounded-full border border-gray-400 hover:border-black transition-colors duration-200" 
                                                            style={{ backgroundColor: color.hex }} 
                                                            aria-label={`${color.name} color for ${product.name}`} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-center mt-9 shrink-0">
                        <Link href="/shop" className="bg-black text-white rounded font-walter font-bold uppercase tracking-wider px-5 py-3 hover:bg-gray-800 transition-colors duration-200 text-xs md:text-xs" aria-label="View all new arrivals">View All</Link>
                    </div>
                </div>
            </div>

            <div className="relative py-10 bg-white w-full">
                <div className="mx-auto px-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
                        {[
                            { title: "Tops", subtitle: "FOR THOSE WHO RUN TO FEEL FREE", img: "https://satisfyrunning.com/cdn/shop/files/PHOTO-DESKTOP_5_720x.progressive.jpg" },
                            { title: "Shorts", subtitle: "THE HEART OF YOUR KIT", img: "https://satisfyrunning.com/cdn/shop/files/PHOTO-DESKTOP_6_720x.progressive.jpg" },
                            { title: "Headwear", subtitle: "LIGHTWEIGHT ELEMENTAL PROTECTION", img: "https://satisfyrunning.com/cdn/shop/files/Bloc-Headwear-Desktop_720x.progressive.jpg" },
                        ].map((cat) => (
                            <Link key={cat.title} href="/shop" className="relative group overflow-hidden block">
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={cat.img} alt={`${cat.title} collection`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-white text-center">
                                        <h3 className="text-4xl md:text-5xl font-walter font-extrabold mb-2 tracking-tight">{cat.title}</h3>
                                        <p className="text-sm font-simon uppercase mb-6 font-light tracking-wider">{cat.subtitle}</p>
                                        <span className="bg-white rounded-full text-black px-6 py-2 font-walter font-bold uppercase tracking-wider group-hover:bg-gray-200 transition-colors text-sm">SHOP</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative  bg-white w-full">

                <div className="text-center mb-5">
                    <h2 className="text-3xl md:text-5xl font-walter font-extrabold text-black tracking-tight">Shop the Silhouette</h2>
                </div>
                <div className="hidden md:block mx-20">
                   <div className="overflow-x-auto px-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                            <div className="flex justify-between gap-2 pb-4" style={{ minWidth: "max-content" }}>
                                {["https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png"].map((img, idx) => (
                                    <div key={idx} className="group cursor-pointer flex-shrink-0" style={{ width: "200px", height: "70vh" }}>
                                        <div className="relative h-full overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} alt={`Silhouette product ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                </div>
                <div className="md:hidden ">
                    <div className="overflow-x-auto px-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                        <div className="flex gap-2 pb-4" style={{ minWidth: "max-content" }}>
                            {["https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png"].map((img, idx) => (
                                <div key={idx} className="group cursor-pointer flex-shrink-0" style={{ width: "200px", height: "50vh" }}>
                                    <div className="relative h-full overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} alt={`Silhouette product ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
            <div className="relative py-16 bg-white w-full">
                <div className="mx-auto px-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
                        {[
                            { title: "Tops", subtitle: "FOR THOSE WHO RUN TO FEEL FREE", img: "https://satisfyrunning.com/cdn/shop/files/PHOTO-DESKTOP_5_720x.progressive.jpg" },
                            { title: "Shorts", subtitle: "THE HEART OF YOUR KIT", img: "https://satisfyrunning.com/cdn/shop/files/PHOTO-DESKTOP_6_720x.progressive.jpg" },
                            { title: "Headwear", subtitle: "LIGHTWEIGHT ELEMENTAL PROTECTION", img: "https://satisfyrunning.com/cdn/shop/files/Bloc-Headwear-Desktop_720x.progressive.jpg" },
                        ].map((cat) => (
                            <Link key={cat.title} href="/shop" className="relative group overflow-hidden block">
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={cat.img} alt={`${cat.title} collection`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-white text-center">
                                        <h3 className="text-4xl md:text-5xl font-walter font-extrabold mb-2 tracking-tight">{cat.title}</h3>
                                        <p className="text-sm font-simon uppercase mb-6 font-light tracking-wider">{cat.subtitle}</p>
                                        <span className="bg-white rounded-full text-black px-6 py-2 font-walter font-bold uppercase tracking-wider group-hover:bg-gray-200 transition-colors text-sm">SHOP</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="  w-full px-5 py-3 ">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[70vh]">
                    {/* Left Side - Image with Shop Button */}
                    <Link href="/shop" className="relative group overflow-hidden bg-orange-200 rounded-lg block">
                        <div className="relative rounded-lg w-full h-full min-h-[400px] lg:min-h-[70vh]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://satisfyrunning.com/cdn/shop/files/Half-Banner-Possessed-Desktop_1.jpg?v=1755596734&width=1200"
                                alt="Possessed Collection"
                                className="w-full h-full rounded-lg object-cover transition-transform duration-500 "
                            />
                            <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center">

                                <span className="bg-white text-black px-4 py-1 font-walter font-bold uppercase tracking-wider group-hover:bg-gray-100 transition-colors text-sm rounded-full">
                                    SHOP
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Right Side - Newsletter Form */}
                    <div className="bg-[#baafa4] rounded-lg flex flex-col justify-center items-center p-8 lg:p-16 min-h-[400px] lg:min-h-[70vh]">
                        <div className="w-full max-w-lg ">
                            <h2 className="text-4xl md:text-5xl text-center font-walter font-extrabold mb-3 tracking-tight text-white">
                                Get on the list
                            </h2>
                            <p className="text-center md:text-md font-simon mb-12 text-white ">
                                Sign up for early access to drops, exclusive launches, and running culture from Possessed Magazine.
                            </p>

                            <form className="mb-4">
                                <div className="flex items-end border-b-2 border-white pb-1">
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        className="flex-1 bg-transparent placeholder:font-walter text-white placeholder-white  text-xs focus:outline-none "
                                        aria-label="Email address"
                                    />
                                    <button
                                        type="submit"
                                        className="text-white font-walter font-bold uppercase tracking-wider hover:opacity-80 transition-opacity text-xs md:text-sm focus:outline-none"
                                        aria-label="Subscribe to newsletter"
                                    >
                                        SUBSCRIBE
                                    </button>
                                </div>
                            </form>

                            <p className="text-[10px] font-simon text-white ">
                                By registering, you accept the{" "}
                                <a href="#" className="underline hover:text-white transition-colors">Terms of Use</a>
                                {" "}and our{" "}
                                <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className=" bg-white w-full py-16">
                <div className=" mx-auto px-5">
                    {/* Top Row - Three Info Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 ">
                        {/* Get Help Buying */}
                        <div className="text-left">
                            <div className="flex">
                                <div className="mb-6 mr-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://satisfyrunning.com/cdn/shop/files/icon-help.svg?v=1754924323&width=100"
                                        alt="Help icon"
                                        className="w-6 h-6"
                                    />
                                </div>
                                <div className="">
                                    <h3 className="text-lg mb-1.5 font-walter font-semibold text-black">Get Help Buying</h3>
                                    <p className="text-xs mb-1.5 font-simon text-black ">
                                        If you have any questions about our gear, get in touch.
                                    </p>
                                    <a href="https://wa.me/+2349035910744" target="_blank" rel="noopener noreferrer" className="text-xs font-medium border-b  font-simon text-black hover:no-underline transition-all">
                                        Chat with us
                                    </a>
                                </div>
                            </div>


                        </div>

                        {/* Free Chronopost Delivery */}
                        <div className="text-left">
                            <div className="flex">
                                <div className="mb-6 mr-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://satisfyrunning.com/cdn/shop/files/icon-fedex.svg?v=1754924558&width=100"
                                        alt="Delivery icon"
                                        className="w-6 h-6"
                                    />
                                </div>
                                <div className="">
                                    <h3 className="text-lg mb-1.5 font-walter font-semibold text-black">Free Chronopost Delivery</h3>
                                    <p className="text-xs mb-1.5 font-simon text-black ">
                                        Fast, secure delivery with tracking for peace of mind.
                                    </p>
                                    <Link href="/terms" className="text-xs font-medium border-b  font-simon text-black hover:no-underline transition-all">
                                        Learn more
                                    </Link>
                                </div>
                            </div>

                        </div>

                        {/* Free & Easy Returns */}
                        <div className="text-left">
                            <div className="flex">
                                <div className="mb-6 mr-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://satisfyrunning.com/cdn/shop/files/icon-returns.svg?v=1754924614&width=100"
                                        alt="Returns icon"
                                        className="w-6 h-6"
                                    />
                                </div>
                                <div className="">
                                    <h3 className="text-lg mb-1.5 font-walter font-semibold text-black">Free & Easy Returns</h3>
                                    <p className="text-xs mb-1.5 font-simon text-black ">
                                        Free returns on all orders within 14 days from the delivery date.
                                    </p>
                                    <Link href="/terms" className="text-xs font-medium border-b  font-simon text-black hover:no-underline transition-all">
                                        Learn more
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>            {/* Bottom Row - Newsletter Section */}
            <div className="hidden bg-[#fefff2] rounded-none py-12">
                <div className="max-w-none">
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-40 justify-center ">
                        <div className="">
                            <h2 className="text-2xl md:text-5xl font-walter font-extrabold mb-4 text-black tracking-tight">
                                New drops
                            </h2>
                            <p className="text-xs font-simon text-gray-700 leading-relaxed">
                                Sign up for early access to exclusive launches.
                            </p>
                        </div>

                        <div className="">
                            <form className="flex gap-0 mb-4">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-[400px] placeholder:text-black placeholder:text-xs px-4 py-3 border rounded-md border-gray-400  font-simon text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                                    aria-label="Email address for newsletter"
                                />
                                <button
                                    type="submit"
                                    className="ml-5 bg-black text-white rounded-md px-6 py-3 font-walter font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors text-sm focus:outline-none border border-black"
                                    aria-label="Subscribe to newsletter"
                                >
                                    Subscribe
                                </button>
                            </form>

                            <p className="text-[9px] font-bold font-simon text-gray-700 leading-relaxed">
                                By registering, you accept the{" "}
                                <a href="#" className="text-[9px] font-bold underline hover:text-black transition-colors">Terms of Use</a>
                                {" "}and our{" "}
                                <a href="#" className="text-[9px] font-bold underline hover:text-black transition-colors">Privacy Policy</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Homepage;
