import React from 'react';
import Image from "next/image";

const Footer = () => {
    return (<>
        <footer className="hidden md:block bg-gray-100 w-full py-5">
            <div className=" mx-auto px-5">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 md:gap-0">
                    {/* Company Info */}
                    <div className="md:col-span-3">
                        <div className="flex items-center space-x-1 cursor-pointer select-none mt-10 mb-5">
                            {/* <Image
                                src="/whiteheart-logo-v1.png"
                                alt="Whiteheart Logo"
                                width={120}
                                height={60}
                                priority
                                className="h-12 w-auto brightness-110 contrast-125 drop-shadow-md"
                            /> */}
                            <div className="font-dancing m-0 p-0 text-gray-700 text-xl font-bold flex flex-col leading-none">
                                <h1 className="">White</h1>
                                <h1 className="">Heart</h1>
                            </div>

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
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Shorts</a></li>
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Tops</a></li>
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Pants</a></li>
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Headwear</a></li>
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Accessories</a></li>
                            </ul>
                        </div>

                        {/* Help */}
                        <div className='mr-16 mb-3 md:mb-0'>
                            <h4 className="text-lg font-walter font-bold text-black">Help</h4>
                            <ul className="">
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">FAQ</a></li>
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Delivery</a></li>
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Return Policy</a></li>
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Register A Return</a></li>
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Contact Us</a></li>
                                <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Payment Options</a></li>
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
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Footer */}
                <div className=" border-gray-300 ">
                    <div className="flex flex-col md:flex-row justify-end items-center">
                        <div className="flex space-x-6">
                            <a href="#" className="text-xs font-simon text-gray-600 hover:text-black transition-colors">©2025 WhiteHeart</a>
                            <a href="#" className="text-xs font-simon text-gray-600 hover:text-black transition-colors">Manage Cookies</a>
                            <a href="#" className="text-xs font-simon text-gray-600 hover:text-black transition-colors">Terms & Conditions</a>
                            <a href="#" className="text-xs font-simon text-gray-600 hover:text-black transition-colors">Privacy Policy</a>
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
                            {/* <Image
                                src="/whiteheart-logo-v1.png"
                                alt="Whiteheart Logo"
                                width={120}
                                height={60}
                                priority
                                className="h-12 w-auto brightness-110 contrast-125 drop-shadow-md"
                            /> */}
                            <div className="font-dancing m-0 p-0 text-gray-700 text-xl font-extrabold flex flex-col leading-none">
                                <h1 className="">White</h1>
                                <h1 className="">Heart</h1>
                            </div>

                        </div>
                    <p className="text-xs font-inter text-black leading-relaxed max-w-md">
                        Since launching in 2015, SATISFY® develops technical equipment that reduce distractions to help runners unlock the High.
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300 mb-6"></div>

                {/* Social Icons */}
                <div className="flex justify-center items-center gap-8 mb-8">
                    {/* Instagram */}
                    <a href="#" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="20" height="20" rx="5" stroke="black" strokeWidth="1.5"/>
                            <circle cx="12" cy="12" r="4" stroke="black" strokeWidth="1.5"/>
                            <circle cx="18" cy="6" r="1" fill="black"/>
                        </svg>
                    </a>

                    {/* Strava */}
                    <a href="#" aria-label="Strava" className="hover:opacity-70 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L8 12h8L12 2z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 12l-4 8 4-4 4 4-4-8" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </a>

                    {/* YouTube */}
                    <a href="#" aria-label="YouTube" className="hover:opacity-70 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="5" width="20" height="14" rx="2" stroke="black" strokeWidth="1.5"/>
                            <path d="M10 9l5 3-5 3V9z" fill="black"/>
                        </svg>
                    </a>
                </div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-sm font-extrabold font-dancing text-black">©2025 SATISFY®</p>
                </div>
            </div>
        </footer>
    </>

    );
};

export default Footer;
