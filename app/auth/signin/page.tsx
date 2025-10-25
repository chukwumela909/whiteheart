"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function SignIn() {
    const router = useRouter();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Here you would normally handle authentication
        // For now, we'll just redirect to orders page
        router.push('/orders');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg  p-8 md:p-8 w-full max-w-md">
                {/* Whiteheart Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center space-x-1 cursor-pointer select-none">
                        <div className="font-dancing m-0 p-0 text-3xl font-bold flex flex-col leading-none text-black">
                            <h1>White Heart</h1>
                           
                        </div>
                    </Link>
                </div>

                {/* Sign in heading */}
                <h2 className="text-2xl font-extrabold mb-2 font-simon">Sign in</h2>
                <p className="text-gray-600 text-sm mb-6">
                    Enter your email and we'll send you a verification code
                </p>

                {/* Email input */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    {/* Continue button */}
                    <button
                        type="submit"
                        className="w-full bg-black font-simon text-white py-3 rounded-md font-bold hover:bg-gray-800 transition-colors"
                    >
                        Continue
                    </button>
                </form>

                {/* Footer links */}
                <div className="mt-6 flex items-center justify-start space-x-4 text-sm">
                    <Link href="/privacy" className="text-gray-600 hover:underline">
                        Privacy policy
                    </Link>
                    <Link href="/terms" className="text-gray-600 hover:underline">
                        Terms of service
                    </Link>
                </div>
            </div>
        </div>
    );
}
