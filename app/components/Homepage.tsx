"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import Footer from "./Footer";

interface SlideItem {
    image: string;
    title: string;
    subtitle: string;
}

interface ProductItem {
    id: number;
    name: string;
    price: string;
    colors: string[];
    front: string;
    back: string;
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

const newArrivals: ProductItem[] = [
    {
        id: 1,
        name: "TechSilk™ Evo 9\" Half Tights",
        price: "170 EUR",
        colors: ["#2D2D2D"],
        front: "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870789/product-image-removebg-preview_s0awsc.png",
        back: "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870992/product-image2_uu4zsl.png",
    },
    {
        id: 2,
        name: "PeaceShell™ River Shirt",
        price: "290 EUR",
        colors: ["#8B4513", "#2D2D2D"],
        front: "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870789/product-image-removebg-preview_s0awsc.png",
        back: "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870992/product-image2_uu4zsl.png",
    },
    {
        id: 3,
        name: "MothTech™ T-Shirt",
        price: "120 EUR",
        colors: ["#A08B7A", "#F5E6D3", "#2D2D2D"],
        front: "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870789/product-image-removebg-preview_s0awsc.png",
        back: "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870992/product-image2_uu4zsl.png",
    },
    {
        id: 4,
        name: "Justice™ Cordura® 5L Hydration Vest",
        price: "260 EUR",
        colors: ["#F5F5F5", "#2D2D2D"],
        front: "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870789/product-image-removebg-preview_s0awsc.png",
        back: "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870992/product-image2_uu4zsl.png",
    },
    {
        id: 5,
        name: "MothTech™ Long Sleeve",
        price: "140 EUR",
        colors: ["#2D2D2D", "#A08B7A"],
        front: "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870789/product-image-removebg-preview_s0awsc.png",
        back: "https://res.cloudinary.com/daf6mdwkh/image/upload/v1758870992/product-image2_uu4zsl.png",
    },
];

export const Homepage = () => {
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);

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
        <div className="relative w-full">
            <div className="bg-black text-white  text-center py-1 text-xs font-medium tracking-wider w-full">
                FREE SHIPPING. FREE RETURNS.
            </div>

            <nav className="absolute  left-0 right-0 z-10">
                <div className="flex items-center py-4 px-8 md:px-12">
                    <div className="flex items-center space-x-12">
                        <div className="flex items-center space-x-1 cursor-pointer select-none">
                            <Image
                                src="/whiteheart-logo-v1.png"
                                alt="Whiteheart Logo"
                                width={120}
                                height={60}
                                priority
                                className="h-12 w-auto brightness-110 contrast-125 drop-shadow-md"
                            />
                            <div className="font-dancing m-0 p-0 text-xl font-bold flex flex-col leading-none">
                                <h1 className="">White</h1>
                                <h1 className="">Heart</h1>
                            </div>

                        </div>

                        <div className="hidden ml-7 md:flex space-x-6 text-white">
                            <a href="#" className="font-simon text-sm tracking-wide hover:opacity-70 transition-all" aria-label="Shop link" tabIndex={0}>SHOP</a>
                            <a href="#" className="font-simon text-sm tracking-wide hover:opacity-70 transition-all" aria-label="Magazine link" tabIndex={0}>MAGAZINE</a>
                            <a href="#" className="font-simon text-sm tracking-wide hover:opacity-70 transition-all" aria-label="Customer service link" tabIndex={0}>CUSTOMER SERVICE</a>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center space-x-6 text-white">
                        <span className="font-simon text-sm tracking-wide">EN</span>
                        <button aria-label="Search" tabIndex={0} className="hover:opacity-70 transition-opacity">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M5 10.6667C5 7.53705 7.53705 5 10.6667 5C13.7963 5 16.3333 7.53705 16.3333 10.6667C16.3333 12.1891 15.7329 13.5713 14.756 14.5895C14.7255 14.6136 14.6961 14.6397 14.6679 14.6679C14.6397 14.6961 14.6136 14.7255 14.5895 14.756C13.5713 15.7329 12.1891 16.3333 10.6667 16.3333C7.53705 16.3333 5 13.7963 5 10.6667ZM15.3347 16.7489C14.0419 17.7426 12.4233 18.3333 10.6667 18.3333C6.43248 18.3333 3 14.9009 3 10.6667C3 6.43248 6.43248 3 10.6667 3C14.9009 3 18.3333 6.43248 18.3333 10.6667C18.3333 12.4233 17.7426 14.0419 16.7489 15.3347L19.7071 18.2929C20.0976 18.6834 20.0976 19.3166 19.7071 19.7071C19.3166 20.0976 18.6834 20.0976 18.2929 19.7071L15.3347 16.7489Z" fill="currentColor"></path></svg>
                        </button>
                        <button aria-label="Account" tabIndex={0} className="hover:opacity-70 transition-opacity">
                            <svg width="20" height="20" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.8036 4.44737C12.8036 2.40537 11.1482 0.75 9.10621 0.75C7.06421 0.75 5.40884 2.40537 5.40884 4.44737C5.40884 6.48937 7.06421 8.14474 9.10621 8.14474C11.1482 8.14474 12.8036 6.48937 12.8036 4.44737ZM0.760742 14.9233C0.760742 12.2311 2.90073 9.96712 5.63986 9.96712H12.5724C15.3116 9.96712 17.4515 12.2311 17.4515 14.9233V16.4638C17.4515 17.4994 16.6121 18.3388 15.5765 18.3388H2.63574C1.60021 18.3388 0.760742 17.4994 0.760742 16.4638V14.9233Z" fill="currentColor"></path></svg>
                        </button>
                        <button aria-label="Cart" tabIndex={0} className="relative focus:outline-none hover:opacity-70 transition-opacity">
                            <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 20.6744H5.5L6.5 7.6446H9V6.6423C9 4.83818 10.37 3.36481 12.12 3.17438C12.07 3.50513 12.04 3.84591 12.02 4.18669C10.87 4.4072 10 5.41951 10 6.6423V7.6446H12.46C13.44 10.7617 15.89 13.2274 19 14.1996L19.5 20.6744Z" fill="currentColor"></path></svg>
                            <span className="absolute -top-1 -right-1 bg-white text-black rounded-full h-3 w-3 flex items-center justify-center text-[8px] font-bold">0</span>
                        </button>
                    </div>
                </div>
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
                                <a href="#" className="bg-white text-black uppercase font-walter font-extrabold tracking-wider py-1 px-6 rounded-full hover:bg-gray-200 transition-colors text-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" tabIndex={0} aria-label={`Shop ${slide.title}`}>SHOP</a>
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

            <div className="relative bg-white w-full h-[75vh] flex justify-between content-between flex-col">
                <div className="flex-1 flex flex-col w-full pt-10 pb-4">
                    <div className="text-center mb-8 shrink-0">
                        <h2 className="text-3xl md:text-5xl font-walter font-extrabold text-black tracking-tight">New Arrivals</h2>
                    </div>
                    <div className="relative  min-h-0 ">
                        <div className="overflow-x-auto h-full" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                            <div className="flex items-start gap-8 h-full pb-2" style={{ minWidth: "max-content" }}>
                                {newArrivals.map((product) => (
                                    <div key={product.id} className="flex-shrink-0 w-64 group  cursor-pointer select-none">
                                        <div className="relative  aspect-[3/4]">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={product.front} alt={product.name} className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0" />
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={product.back} alt={`${product.name} back view`} className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        </div>
                                        <div className="text-center px-1">
                                            <h3 className="font-walter font-bold text-base md:text-sm text-black mb-1 tracking-tight leading-snug">{product.name}</h3>
                                            <p className="font-simon text-xs md:text-xs text-gray-700 mb-3 tracking-wide">{product.price}</p>
                                            <div className="flex justify-center gap-2">
                                                {product.colors.map((color, index) => (
                                                    <button key={index} className="w-3.5 h-3.5 rounded-full border border-gray-400 hover:border-black transition-colors duration-200" style={{ backgroundColor: color }} aria-label={`Color option ${index + 1} for ${product.name}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-9 shrink-0">
                        <button className="bg-black text-white rounded font-walter font-bold uppercase tracking-wider px-4 py-2 hover:bg-gray-800 transition-colors duration-200 text-xs md:text-xs" aria-label="View all new arrivals">View All</button>
                    </div>
                </div>
            </div>

            <div className="relative py-16 bg-white w-full">
                <div className="mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
                        {[
                            { title: "Tops", subtitle: "FOR THOSE WHO RUN TO FEEL FREE", img: "https://satisfyrunning.com/cdn/shop/files/PHOTO-DESKTOP_5_720x.progressive.jpg" },
                            { title: "Shorts", subtitle: "THE HEART OF YOUR KIT", img: "https://satisfyrunning.com/cdn/shop/files/PHOTO-DESKTOP_6_720x.progressive.jpg" },
                            { title: "Headwear", subtitle: "LIGHTWEIGHT ELEMENTAL PROTECTION", img: "https://satisfyrunning.com/cdn/shop/files/Bloc-Headwear-Desktop_720x.progressive.jpg" },
                        ].map((cat) => (
                            <div key={cat.title} className="relative group cursor-pointer overflow-hidden">
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={cat.img} alt={`${cat.title} collection`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-white text-center">
                                        <h3 className="text-4xl md:text-5xl font-walter font-extrabold mb-2 tracking-tight">{cat.title}</h3>
                                        <p className="text-sm font-simon uppercase mb-6 font-light tracking-wider">{cat.subtitle}</p>
                                        <button className="bg-white rounded-full text-black px-6 py-2 font-walter font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" aria-label={`Shop ${cat.title}`}>SHOP</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative  bg-white w-full">
                <div className="w-full">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-walter font-extrabold text-black tracking-tight">Shop the Silhouette</h2>
                    </div>
                    <div className="hidden md:block">
                        <div className="grid grid-cols-4 gap-12 mx-auto px-8">
                            {["https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png"].map((img, idx) => (
                                <div key={idx} className="group cursor-pointer">
                                    <div className="relative overflow-hidden bg-white">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} alt={`Silhouette product ${idx + 1}`} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:hidden">
                        <div className="overflow-x-auto px-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                            <div className="flex gap-6 pb-4" style={{ minWidth: "max-content" }}>
                                {["https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png", "https://res.cloudinary.com/daf6mdwkh/image/upload/c_fill,w_1200,h_1800/v1758879532/model-image2_quxfn9.png"].map((img, idx) => (
                                    <div key={idx} className="group cursor-pointer flex-shrink-0" style={{ width: "280px" }}>
                                        <div className="relative aspect-[3/4] overflow-hidden bg-white">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} alt={`Silhouette product ${idx + 1}`} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative py-16 bg-white w-full">
                <div className="mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
                        {[
                            { title: "Tops", subtitle: "FOR THOSE WHO RUN TO FEEL FREE", img: "https://satisfyrunning.com/cdn/shop/files/PHOTO-DESKTOP_5_720x.progressive.jpg" },
                            { title: "Shorts", subtitle: "THE HEART OF YOUR KIT", img: "https://satisfyrunning.com/cdn/shop/files/PHOTO-DESKTOP_6_720x.progressive.jpg" },
                            { title: "Headwear", subtitle: "LIGHTWEIGHT ELEMENTAL PROTECTION", img: "https://satisfyrunning.com/cdn/shop/files/Bloc-Headwear-Desktop_720x.progressive.jpg" },
                        ].map((cat) => (
                            <div key={cat.title} className="relative group cursor-pointer overflow-hidden">
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={cat.img} alt={`${cat.title} collection`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-white text-center">
                                        <h3 className="text-4xl md:text-5xl font-walter font-extrabold mb-2 tracking-tight">{cat.title}</h3>
                                        <p className="text-sm font-simon uppercase mb-6 font-light tracking-wider">{cat.subtitle}</p>
                                        <button className="bg-white rounded-full text-black px-6 py-2 font-walter font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" aria-label={`Shop ${cat.title}`}>SHOP</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="relative rounded w-full px-8 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[70vh]">
                    {/* Left Side - Image with Shop Button */}
                    <div className="relative group cursor-pointer overflow-hidden bg-orange-200 rounded-lg">
                        <div className="relative rounded-lg w-full h-full min-h-[400px] lg:min-h-[70vh]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://satisfyrunning.com/cdn/shop/files/Half-Banner-Possessed-Desktop_1.jpg?v=1755596734&width=1200"
                                alt="Possessed Collection"
                                className="w-full h-full rounded-lg object-cover transition-transform duration-500 "
                            />
                            <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center">

                                <button className="bg-white text-black px-4 py-1 font-walter font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" aria-label="Shop Possessed Collection">
                                    SHOP
                                </button>
                            </div>
                        </div>
                    </div>

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
                                        className="flex-1 bg-transparent placeholder:font-walter text-white placeholder-white  text-base focus:outline-none mr-4"
                                        aria-label="Email address"
                                    />
                                    <button
                                        type="submit"
                                        className="text-white font-walter font-bold uppercase tracking-wider hover:opacity-80 transition-opacity text-sm focus:outline-none"
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
            <div className="relative bg-gray-50 w-full py-16">
                <div className=" mx-auto px-8">
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
                                    <a href="#" className="text-xs font-medium border-b  font-simon text-black hover:no-underline transition-all">
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
                                    <a href="#" className="text-xs font-medium border-b  font-simon text-black hover:no-underline transition-all">
                                        Learn more
                                    </a>
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
                                    <a href="#" className="text-xs font-medium border-b  font-simon text-black hover:no-underline transition-all">
                                        Learn more
                                    </a>
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
