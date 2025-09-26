import React from 'react';
import Image from "next/image";

const Footer = () => {
    return (
        <footer className="bg-gray-100 w-full py-16">
            <div className=" mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-6  mb-16">
                    {/* Company Info */}
                    <div className="md:col-span-3">
                        <div className="flex items-center space-x-1 cursor-pointer select-none mb-2">
                            <Image
                                src="/whiteheart-logo-v1.png"
                                alt="Whiteheart Logo"
                                width={120}
                                height={60}
                                priority
                                className="h-12 w-auto brightness-110 contrast-125 drop-shadow-md"
                            />
                            <div className="font-dancing m-0 p-0 text-gray-700 text-xl font-bold flex flex-col leading-none">
                                <h1 className="">White</h1>
                                <h1 className="">Heart</h1>
                            </div>

                        </div>
                        <p className="text-xs font-medium font-simon text-black w-89">
                            Since launching in 2015, WhiteHeart® develops technical equipment that reduce distractions to help runners unlock the High.
                        </p>
                    </div>

                    {/* Shop */}
                    <div className='md:col-span-1'>
                        <h4 className="text-lg font-walter font-bold mb-2 text-black">Shop</h4>
                        <ul className="">
                            <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Shorts</a></li>
                            <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Tops</a></li>
                            <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Pants</a></li>
                            <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Headwear</a></li>
                            <li><a href="#" className="text-xs font-medium font-simon text-black hover:text-black transition-colors">Accessories</a></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div className='md:col-span-1'>
                        <h4 className="text-lg font-walter font-bold mb-2 text-black">Help</h4>
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
                    <div className='md:col-span-1'>
                        <h4 className="text-lg font-walter font-bold mb-2 text-black">Shipping To</h4>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="1" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="black" strokeWidth="1" />
                                <path d="M2 12h20" stroke="black" strokeWidth="1" />
                            </svg>
                            <span className="text-sm font-simon text-black">FRANCE (EUR)</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
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
    );
};

export default Footer;
