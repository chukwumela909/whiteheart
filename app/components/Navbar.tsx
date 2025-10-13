 "use client";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
    transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
    return (
        <>
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
                                <h1 className="">White</h1>
                                <h1 className="">Heart</h1>
                            </div>
                        </Link>

                        <div className={`hidden ml-7 md:flex space-x-6 ${transparent ? 'text-white' : 'text-black'}`}>
                            <a href="#" className="font-simon text-sm tracking-wide hover:opacity-70 transition-all" aria-label="Shop link" tabIndex={0}>SHOP</a>
                            <a href="#" className="font-simon text-sm tracking-wide hover:opacity-70 transition-all" aria-label="Magazine link" tabIndex={0}>MAGAZINE</a>
                            <a href="#" className="font-simon text-sm tracking-wide hover:opacity-70 transition-all" aria-label="Customer service link" tabIndex={0}>CUSTOMER SERVICE</a>
                        </div>
                    </div>
                    <div className={`ml-auto flex items-center space-x-6 ${transparent ? 'text-white' : 'text-black'}`}>
                        <span className="font-dancing text-sm tracking-wide">EN</span>
                        <button aria-label="Search" tabIndex={0} className="hover:opacity-70 transition-opacity">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M5 10.6667C5 7.53705 7.53705 5 10.6667 5C13.7963 5 16.3333 7.53705 16.3333 10.6667C16.3333 12.1891 15.7329 13.5713 14.756 14.5895C14.7255 14.6136 14.6961 14.6397 14.6679 14.6679C14.6397 14.6961 14.6136 14.7255 14.5895 14.756C13.5713 15.7329 12.1891 16.3333 10.6667 16.3333C7.53705 16.3333 5 13.7963 5 10.6667ZM15.3347 16.7489C14.0419 17.7426 12.4233 18.3333 10.6667 18.3333C6.43248 18.3333 3 14.9009 3 10.6667C3 6.43248 6.43248 3 10.6667 3C14.9009 3 18.3333 6.43248 18.3333 10.6667C18.3333 12.4233 17.7426 14.0419 16.7489 15.3347L19.7071 18.2929C20.0976 18.6834 20.0976 19.3166 19.7071 19.7071C19.3166 20.0976 18.6834 20.0976 18.2929 19.7071L15.3347 16.7489Z" fill="currentColor"></path></svg>
                        </button>
                        <button aria-label="Account" tabIndex={0} className="hover:opacity-70 transition-opacity">
                            <svg width="20" height="20" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.8036 4.44737C12.8036 2.40537 11.1482 0.75 9.10621 0.75C7.06421 0.75 5.40884 2.40537 5.40884 4.44737C5.40884 6.48937 7.06421 8.14474 9.10621 8.14474C11.1482 8.14474 12.8036 6.48937 12.8036 4.44737ZM0.760742 14.9233C0.760742 12.2311 2.90073 9.96712 5.63986 9.96712H12.5724C15.3116 9.96712 17.4515 12.2311 17.4515 14.9233V16.4638C17.4515 17.4994 16.6121 18.3388 15.5765 18.3388H2.63574C1.60021 18.3388 0.760742 17.4994 0.760742 16.4638V14.9233Z" fill="currentColor"></path></svg>
                        </button>
                        <button aria-label="Cart" tabIndex={0} className="relative focus:outline-none hover:opacity-70 transition-opacity">
                            <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 20.6744H5.5L6.5 7.6446H9V6.6423C9 4.83818 10.37 3.36481 12.12 3.17438C12.07 3.50513 12.04 3.84591 12.02 4.18669C10.87 4.4072 10 5.41951 10 6.6423V7.6446H12.46C13.44 10.7617 15.89 13.2274 19 14.1996L19.5 20.6744Z" fill="currentColor"></path></svg>
                            <span className={`absolute -top-1 -right-1 rounded-full h-3 w-3 flex items-center justify-center text-[8px] font-bold ${transparent ? 'bg-white text-black' : 'bg-black text-white'}`}>0</span>
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}
