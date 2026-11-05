"use client";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Link from "next/link";

interface ProductItem {
    id: string;
    name: string;
    price: number;
    image_url: string;
    colors: { name: string; hex: string }[];
    category: string;
    stock_quantity: number;
}

export const Homepage = () => {
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const videoRef = useRef<HTMLVideoElement>(null);
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
            console.error('Error loading products:', error instanceof Error ? error.message : error);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, []);

    return (
        <div className="bg-white w-full">
            <div className="bg-black text-white text-center py-1 text-xs font-medium tracking-wider w-full">
                FREE DELIVERY ON EVERY ORDER
            </div>

            <nav className="absolute left-0 right-0 z-10">
                <Navbar transparent={true} />
            </nav>

            <div className="relative h-[80vh] w-full overflow-hidden">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    src="/hero.mp4"
                    poster="/hero-poster.jpg"
                    preload="metadata"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-label="Whiteheart hero background video"
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
                    <h1 className="text-5xl md:text-7xl font-walter font-extrabold mb-2 tracking-tight">Summer Essentials</h1>
                    <p className="text-lg md:text-md font-simon uppercase mb-10 font-light tracking-wider">EQUIPMENT FOR ALL PURSUITS</p>
                    <Link href="/shop" className="bg-white text-black uppercase font-walter font-extrabold tracking-wider py-1 px-6 rounded-full hover:bg-gray-200 transition-colors text-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" tabIndex={0} aria-label="Shop Summer Essentials">SHOP</Link>
                </div>
                <button onClick={handleTogglePlayPause} aria-label={isPlaying ? "Pause background video" : "Play background video"} tabIndex={0} className="absolute bottom-10 right-10 text-white focus:outline-none hover:opacity-80 transition-opacity">
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
                        <h2 className="text-3xl md:text-5xl font-walter font-extrabold text-black tracking-tight mb-6">New Arrivals</h2>
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
                                <div className="flex items-start gap-8 h-full pb-2 px-5" style={{ minWidth: "max-content" }}>
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
                            { title: "Tees", subtitle: "EVERYDAY ESSENTIALS", img: "/categories/category-3.jpeg", href: "/shop?category=tees" },
                            { title: "Sets", subtitle: "THE HEART OF YOUR KIT", img: "/categories/category-1.jpeg", href: "/shop?category=sets" },
                            { title: "Accessories", subtitle: "THE FINISHING TOUCHES", img: "/categories/category-2.jpeg", href: "/shop?category=accessories" },
                        ].map((cat) => (
                            <Link key={cat.title} href={cat.href} className="relative group overflow-hidden block">
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


            <div className="relative py-16 bg-white w-full">
                <div className="mx-auto px-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
                        {[
                            // The shop lists newest first by default, so "New Drop" goes to the full shop.
                            { title: "New Drop", subtitle: "STRAIGHT OFF THE LINE", img: "/categories/category-4.jpeg", href: "/shop" },
                            { title: "Headwear", subtitle: "TOPPED OFF RIGHT", img: "/categories/category-6.jpeg", href: "/shop?category=headwear" },
                            { title: "Outerwear", subtitle: "LIGHTWEIGHT ELEMENTAL PROTECTION", img: "/categories/category-5.jpeg", href: "/shop?category=outerwear" },
                        ].map((cat) => (
                            <Link key={cat.title} href={cat.href} className="relative group overflow-hidden block">
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

            {/* Follow Section */}
            <div className="w-full px-5 py-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[70vh]">
                    {/* Left Side - Image with Shop Button */}
                    <Link href="/shop" className="relative group overflow-hidden rounded-lg block" aria-label="Shop all WhiteHeart products">
                        <div className="relative rounded-lg w-full h-full min-h-[400px] lg:min-h-[70vh]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/hero-poster.jpg"
                                alt="WhiteHeart tracksuit"
                                className="absolute inset-0 w-full h-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center">
                                <span className="bg-white text-black px-4 py-1 font-walter font-bold uppercase tracking-wider group-hover:bg-gray-100 transition-colors text-sm rounded-full">
                                    SHOP
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Right Side - Social links */}
                    <div className="bg-[#baafa4] rounded-lg flex flex-col justify-center items-center p-8 lg:p-16 min-h-[400px] lg:min-h-[70vh]">
                        <div className="w-full max-w-lg text-center">
                            <h2 className="text-4xl md:text-5xl font-walter font-extrabold mb-3 tracking-tight text-white">
                                Be first to the drop
                            </h2>
                            <p className="md:text-md font-simon mb-10 text-white">
                                New pieces land on our socials first. Follow WhiteHeart, or message us on WhatsApp with any questions about sizes and stock.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {[
                                    { label: "Instagram", href: "https://www.instagram.com/whiteheartconcepts" },
                                    { label: "TikTok", href: "https://www.tiktok.com/@whiteheart_outfits" },
                                    { label: "Pinterest", href: "https://pin.it/7ptAQ8aEP" },
                                    { label: "WhatsApp", href: "https://wa.me/+2349035910744" },
                                ].map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="border-2 border-white text-white rounded-full px-5 py-2 font-walter font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black transition-colors"
                                    >
                                        {social.label}
                                    </a>
                                ))}
                            </div>
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
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
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

                        {/* Free Delivery */}
                        <div className="text-left">
                            <div className="flex">
                                <div className="mb-6 mr-3">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                </div>
                                <div className="">
                                    <h3 className="text-lg mb-1.5 font-walter font-semibold text-black">Free Delivery</h3>
                                    <p className="text-xs mb-1.5 font-simon text-black ">
                                        Delivery is free on every order, straight to your door.
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
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                    </svg>
                                </div>
                                <div className="">
                                    <h3 className="text-lg mb-1.5 font-walter font-semibold text-black">Easy Returns</h3>
                                    <p className="text-xs mb-1.5 font-simon text-black ">
                                        Return unused items with their tags within 14 days of delivery.
                                    </p>
                                    <Link href="/terms" className="text-xs font-medium border-b  font-simon text-black hover:no-underline transition-all">
                                        Learn more
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Homepage;
