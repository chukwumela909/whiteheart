import React from 'react';
import Image from "next/image";
import Link from "next/link";

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
                                <h1 className="">White Heart</h1>
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
                                <li><a href="https://wa.me/+2348105258679" target="_blank" rel="noopener noreferrer" className="text-xs font-medium font-simon text-black hover:text-gray-600 transition-colors">Customer Service</a></li>
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
                    <div className="flex flex-col md:flex-row justify-end items-center">
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
                    <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="20" height="20" rx="5" stroke="black" strokeWidth="1.5"/>
                            <circle cx="12" cy="12" r="4" stroke="black" strokeWidth="1.5"/>
                            <circle cx="18" cy="6" r="1" fill="black"/>
                        </svg>
                    </Link>

                    {/* YouTube */}
                    <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:opacity-70 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="5" width="20" height="14" rx="2" stroke="black" strokeWidth="1.5"/>
                            <path d="M10 9l5 3-5 3V9z" fill="black"/>
                        </svg>
                    </Link>
                </div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-sm font-extrabold font-dancing text-black">©2025 WhiteHeart®</p>
                </div>
            </div>
        </footer>
    </>

    );
};

export default Footer;
