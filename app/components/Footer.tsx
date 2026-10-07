import React from 'react';
import Link from "next/link";
import BrandLogo from "./BrandLogo";

const Footer = () => {
    return (<>
        <footer className="hidden md:block bg-gray-100 w-full py-5">
            <div className=" mx-auto px-5">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 md:gap-0">
                    {/* Company Info */}
                    <div className="md:col-span-3">
                        <div className="flex items-center space-x-1 cursor-pointer select-none mt-10 mb-5">
                            <BrandLogo
                                href="/"
                                className="w-[170px] h-[64px] md:w-[200px] md:h-[74px]"
                                imageClassName="object-contain"
                                alt="Whiteheart logo"
                            />

                        </div>
                        <p className="text-xs font-medium font-simon text-black w-89">
                            Since launching in 2015, WhiteHeart® develops technical equipment that reduce distractions to help runners unlock the High.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-between mt-8 my-5">
                        {/* Shop */}
                        <div className='mr-16 mb-3 md:mb-0'>
                            <h4 className="text-lg font-walter font-bold text-black">Shop</h4>
                            <ul className="">
                                <li><Link href="/shop" className="text-xs font-medium font-simon text-black hover:text-gray-600 transition-colors">All Products</Link></li>
                            </ul>
                        </div>

                        {/* Help */}
                        <div className='mr-16 mb-3 md:mb-0'>
                            <h4 className="text-lg font-walter font-bold text-black">Legal</h4>
                            <ul className="">
                                <li><Link href="/terms" className="text-xs font-medium font-simon text-black hover:text-gray-600 transition-colors">Terms & Conditions</Link></li>
                                <li><Link href="/privacy" className="text-xs font-medium font-simon text-black hover:text-gray-600 transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className='mr-16 mb-3 md:mb-0'>
                            <h4 className="text-lg font-walter font-bold text-black">Contact</h4>
                            <ul className="">
                                <li><a href="https://wa.me/+2349035910744" target="_blank" rel="noopener noreferrer" className="text-xs font-medium font-simon text-black hover:text-gray-600 transition-colors">Customer Service</a></li>
                            </ul>
                        </div>

                        {/* Shipping To */}
                        <div className='mr-16 mb-3 md:mb-0'>
                            <h4 className="text-lg font-walter font-bold text-black">Delivering To</h4>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="1" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="black" strokeWidth="1" />
                                    <path d="M2 12h20" stroke="black" strokeWidth="1" />
                                </svg>
                                <span className="text-sm font-simon text-black">Portharcourt (RIV)</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Footer */}
                <div className=" border-gray-300 ">
                    <div className="flex flex-col md:flex-row justify-between items-center md:pr-40 footer-legal-safe-zone">
                        <div className="flex space-x-6 mb-4 md:mb-0">
                            <Link href="https://x.com/thebrandwh?s=21" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:opacity-70 transition-opacity">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="black"/>
                                </svg>
                            </Link>
                            <Link href="https://www.instagram.com/white.heart_outfits?igsh=bnBlNjg5Nm9ieXh4" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="black" strokeWidth="1.5"/>
                                    <circle cx="12" cy="12" r="4" stroke="black" strokeWidth="1.5"/>
                                    <circle cx="18" cy="6" r="1" fill="black"/>
                                </svg>
                            </Link>
                            <Link href="https://www.tiktok.com/@whiteheart_outfits" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:opacity-70 transition-opacity">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="black"/>
                                </svg>
                            </Link>
                            <Link href="https://pin.it/7ptAQ8aEP" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="hover:opacity-70 transition-opacity">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" fill="black"/>
                                </svg>
                            </Link>
                            <Link href="https://wa.me/+2349035910744" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:opacity-70 transition-opacity">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="black"/>
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2c-.145.436.283.864.719.719l3.032-.892A9.958 9.958 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="black" strokeWidth="1.5"/>
                                </svg>
                            </Link>
                        </div>
                        <div className="flex space-x-6">
                            <span className="text-xs font-simon text-gray-600">©2025 WhiteHeart</span>
                            <Link href="/terms" className="text-xs font-simon text-gray-600 hover:text-black transition-colors">Terms & Conditions</Link>
                            <Link href="/privacy" className="text-xs font-simon text-gray-600 hover:text-black transition-colors">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        <footer className='md:hidden bg-gray-100 w-full py-5'>
            <div className="max-w-6xl mx-auto px-5">
                {/* Top Section - Brand and Description */}
                <div className="mb-6">
                   <div className="flex items-center space-x-1 cursor-pointer select-none mb-2">
                            <BrandLogo
                                href="/"
                                className="w-[170px] h-[64px]"
                                imageClassName="object-contain"
                                alt="Whiteheart logo"
                            />

                        </div>
                    <p className="text-xs font-inter text-black leading-relaxed max-w-md">
                        Since launching in 2015, SATISFY® develops technical equipment that reduce distractions to help runners unlock the High.
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300 mb-6"></div>

                {/* Social Icons */}
                <div className="flex justify-center items-center gap-8 mb-8">
                    {/* X (Twitter) */}
                    <Link href="https://x.com/thebrandwh?s=21" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:opacity-70 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="black"/>
                        </svg>
                    </Link>

                    {/* Instagram */}
                    <Link href="https://www.instagram.com/white.heart_outfits?igsh=bnBlNjg5Nm9ieXh4" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="20" height="20" rx="5" stroke="black" strokeWidth="1.5"/>
                            <circle cx="12" cy="12" r="4" stroke="black" strokeWidth="1.5"/>
                            <circle cx="18" cy="6" r="1" fill="black"/>
                        </svg>
                    </Link>

                    {/* TikTok */}
                    <Link href="https://www.tiktok.com/@whiteheart_outfits" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:opacity-70 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="black"/>
                        </svg>
                    </Link>

                    {/* Pinterest */}
                    <Link href="https://pin.it/7ptAQ8aEP" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="hover:opacity-70 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" fill="black"/>
                        </svg>
                    </Link>

                    {/* WhatsApp */}
                    <Link href="https://wa.me/+2349035910744" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:opacity-70 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="black"/>
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2c-.145.436.283.864.719.719l3.032-.892A9.958 9.958 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="black" strokeWidth="1.5"/>
                        </svg>
                    </Link>
                </div>

                {/* Copyright */}
                <div className="text-center pb-12">
                    <p className="text-sm font-extrabold font-dancing text-black">©2025 WhiteHeart®</p>
                </div>
            </div>
        </footer>
    </>

    );
};

export default Footer;
