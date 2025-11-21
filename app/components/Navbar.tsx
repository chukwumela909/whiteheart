"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/app/contexts/CartContext";

interface NavbarProps {
    transparent?: boolean;
}

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    images: string[] | null;
    category: string;
}

export default function Navbar({ transparent = false }: NavbarProps) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
        };
        
        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        // Hide Google Translate bar
        const style = document.createElement('style');
        style.innerHTML = `
            .goog-te-banner-frame { display: none !important; }
            body { top: 0 !important; }
            .skiptranslate iframe { display: none !important; }
            #goog-gt-tt { display: none !important; }
            .goog-te-balloon-frame { display: none !important; }
        `;
        document.head.appendChild(style);

        return () => {
            subscription.unsubscribe();
            if (style.parentNode) {
                document.head.removeChild(style);
            }
        };
    }, [supabase]);

    // Search products
    useEffect(() => {
        const searchProducts = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, name, price, image_url, images, category')
                    .eq('is_active', true)
                    .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
                    .limit(5);

                if (error) throw error;
                setSearchResults(data || []);
            } catch (error) {
                console.error('Error searching products:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(() => {
            searchProducts();
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery, supabase]);

    const handleSearchClose = () => {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleProductClick = () => {
        handleSearchClose();
    };

    const handleAccountClick = () => {
        if (isAuthenticated) {
            router.push('/orders');
        } else {
            router.push('/auth/signin');
        }
    };

    return (
        <>
            {/* Cart Sidebar Overlay */}
            {isCartOpen && (
                <div 
                    className="fixed inset-0 bg-[#51515137] backdrop-blur-sm bg-opacity-40 z-50"
                    onClick={() => setIsCartOpen(false)}
                />
            )}

            {/* Cart Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Cart Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-extrabold font-simon">Bag</h2>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-2 hover:opacity-70 transition-opacity"
                            aria-label="Close cart"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Content */}
                    {cart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8">
                            <p className="text-center text-base font-simon mb-8">
                                Your bag is currently empty
                            </p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="px-8 py-3 border-1 border-black rounded text-black font-extrabold font-simon text-sm hover:bg-black hover:text-white transition-colors"
                            >
                                Continue shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-walter font-semibold text-black truncate">{item.name}</h3>
                                            {item.color && (
                                                <p className="text-sm font-simon text-gray-600">Color: {item.color}</p>
                                            )}
                                            {item.size && (
                                                <p className="text-sm font-simon text-gray-600">Size: {item.size}</p>
                                            )}
                                            <p className="text-sm font-dancing font-bold text-black mt-1">
                                                ₦{item.price.toLocaleString()}
                                            </p>
                                            
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-simon">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-black transition-colors"
                                            aria-label="Remove item"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Cart Footer */}
                            <div className="border-t border-gray-200 p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-walter font-semibold text-lg">Subtotal</span>
                                    <span className="font-dancing font-bold text-xl">₦{getCartTotal().toLocaleString()}</span>
                                </div>
                                <p className="text-xs font-simon text-gray-600">
                                    Taxes and shipping calculated at checkout
                                </p>
                                <button
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        router.push('/checkout');
                                    }}
                                    className="w-full bg-black text-white py-3 rounded font-walter font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                                >
                                    Checkout
                                </button>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="w-full border border-black text-black py-3 rounded font-walter font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {!transparent && (
                <div className="bg-black text-white text-center py-1 text-xs font-medium tracking-wider w-full">
                    FREE SHIPPING. FREE RETURNS.
                </div>
            )}

            <nav className={`${transparent ? 'bg-transparent border-none' : 'bg-white border-b border-gray-200'}`}>
                <div className="flex items-center py-4 px-8 md:px-12">
                    <div className="flex items-center space-x-12">
                        <Link href="/" className="flex items-center space-x-1 cursor-pointer select-none">
                            {/* <Image
                                src="/whiteheart-logo-v1.png"
                                alt="Whiteheart Logo"
                                width={200}
                                height={75}
                                priority
                                className="md:h-16 h-9 w-auto brightness-110 contrast-125 drop-shadow-md"
                            /> */}
                            <div className={`font-dancing m-0 p-0 md:text-3xl text-xl font-bold flex flex-col leading-none ${transparent ? 'text-white' : 'text-black'}`}>
                                <h1 className="">White Heart</h1>
                           
                            </div>
                        </Link>

                        <div className={`hidden ml-7 md:flex space-x-6 ${transparent ? 'text-white' : 'text-black'}`}>
                            <Link href="/shop" className="font-simon text-sm tracking-wide hover:opacity-70 transition-all" aria-label="Shop link" tabIndex={0}>SHOP</Link>
                            {/* <a href="#" className="font-simon text-sm tracking-wide hover:opacity-70 transition-all" aria-label="Magazine link" tabIndex={0}>MAGAZINE</a> */}
                            <a href="https://wa.me/+2349035910744" target="_blank" rel="noopener noreferrer" className="font-simon text-sm tracking-wide hover:opacity-70 transition-all" aria-label="Customer service link" tabIndex={0}>CUSTOMER SERVICE</a>
                        </div>
                    </div>
                    <div className={`ml-auto flex items-center space-x-6 ${transparent ? 'text-white' : 'text-black'}`}>
                        <button 
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            aria-label="Search" 
                            tabIndex={0} 
                            className="hover:opacity-70 transition-opacity"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M5 10.6667C5 7.53705 7.53705 5 10.6667 5C13.7963 5 16.3333 7.53705 16.3333 10.6667C16.3333 12.1891 15.7329 13.5713 14.756 14.5895C14.7255 14.6136 14.6961 14.6397 14.6679 14.6679C14.6397 14.6961 14.6136 14.7255 14.5895 14.756C13.5713 15.7329 12.1891 16.3333 10.6667 16.3333C7.53705 16.3333 5 13.7963 5 10.6667ZM15.3347 16.7489C14.0419 17.7426 12.4233 18.3333 10.6667 18.3333C6.43248 18.3333 3 14.9009 3 10.6667C3 6.43248 6.43248 3 10.6667 3C14.9009 3 18.3333 6.43248 18.3333 10.6667C18.3333 12.4233 17.7426 14.0419 16.7489 15.3347L19.7071 18.2929C20.0976 18.6834 20.0976 19.3166 19.7071 19.7071C19.3166 20.0976 18.6834 20.0976 18.2929 19.7071L15.3347 16.7489Z" fill="currentColor"></path></svg>
                        </button>
                        <button 
                            onClick={handleAccountClick}
                            aria-label="Account" 
                            tabIndex={0} 
                            className="hover:opacity-70 transition-opacity"
                        >
                            <svg width="20" height="20" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.8036 4.44737C12.8036 2.40537 11.1482 0.75 9.10621 0.75C7.06421 0.75 5.40884 2.40537 5.40884 4.44737C5.40884 6.48937 7.06421 8.14474 9.10621 8.14474C11.1482 8.14474 12.8036 6.48937 12.8036 4.44737ZM0.760742 14.9233C0.760742 12.2311 2.90073 9.96712 5.63986 9.96712H12.5724C15.3116 9.96712 17.4515 12.2311 17.4515 14.9233V16.4638C17.4515 17.4994 16.6121 18.3388 15.5765 18.3388H2.63574C1.60021 18.3388 0.760742 17.4994 0.760742 16.4638V14.9233Z" fill="currentColor"></path></svg>
                        </button>
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            aria-label="Cart" 
                            tabIndex={0} 
                            className="relative focus:outline-none hover:opacity-70 transition-opacity"
                        >
                            <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 20.6744H5.5L6.5 7.6446H9V6.6423C9 4.83818 10.37 3.36481 12.12 3.17438C12.07 3.50513 12.04 3.84591 12.02 4.18669C10.87 4.4072 10 5.41951 10 6.6423V7.6446H12.46C13.44 10.7617 15.89 13.2274 19 14.1996L19.5 20.6744Z" fill="currentColor"></path></svg>
                            {getCartCount() > 0 && (
                                <span className={`absolute -top-1 -right-1 rounded-full h-3 w-3 flex items-center justify-center text-[8px] font-bold ${transparent ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                    {getCartCount()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Search Bar */}
            {isSearchOpen && (
                <div className="bg-white border-b border-gray-200 relative">
                    <div className="flex items-center py-4 px-8 md:px-12">
                        {/* Search Input */}
                        <div className="flex items-center flex-1">
                            <svg 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-3 text-gray-400"
                            >
                                <path fillRule="evenodd" clipRule="evenodd" d="M5 10.6667C5 7.53705 7.53705 5 10.6667 5C13.7963 5 16.3333 7.53705 16.3333 10.6667C16.3333 12.1891 15.7329 13.5713 14.756 14.5895C14.7255 14.6136 14.6961 14.6397 14.6679 14.6679C14.6397 14.6961 14.6136 14.7255 14.5895 14.756C13.5713 15.7329 12.1891 16.3333 10.6667 16.3333C7.53705 16.3333 5 13.7963 5 10.6667ZM15.3347 16.7489C14.0419 17.7426 12.4233 18.3333 10.6667 18.3333C6.43248 18.3333 3 14.9009 3 10.6667C3 6.43248 6.43248 3 10.6667 3C14.9009 3 18.3333 6.43248 18.3333 10.6667C18.3333 12.4233 17.7426 14.0419 16.7489 15.3347L19.7071 18.2929C20.0976 18.6834 20.0976 19.3166 19.7071 19.7071C19.3166 20.0976 18.6834 20.0976 18.2929 19.7071L15.3347 16.7489Z" fill="currentColor" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                className="flex-1 text-base outline-none border-none font-simon placeholder-gray-400"
                            />
                            {isSearching && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                            )}
                            <button
                                onClick={handleSearchClose}
                                className="p-2 hover:opacity-70 transition-opacity"
                                aria-label="Close search"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchQuery.length >= 2 && (
                        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg max-h-[400px] overflow-y-auto z-50">
                            {isSearching ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="py-2">
                                    {searchResults.map((product) => {
                                        const imageUrl = product.images?.[0] || product.image_url;
                                        return (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.id}`}
                                                onClick={handleProductClick}
                                                className="flex items-center gap-4 px-8 md:px-12 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                                    {imageUrl ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img
                                                            src={imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-walter font-semibold text-black truncate">{product.name}</h3>
                                                    <p className="text-sm font-simon text-gray-600 capitalize">{product.category}</p>
                                                    <p className="text-sm font-dancing font-bold text-black">₦{product.price.toLocaleString()}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 px-8 md:px-12 text-center">
                                    <p className="font-simon text-gray-600">No products found for "{searchQuery}"</p>
                                    <Link
                                        href="/shop"
                                        onClick={handleProductClick}
                                        className="inline-block mt-4 text-sm font-simon text-black hover:underline"
                                    >
                                        Browse all products
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
