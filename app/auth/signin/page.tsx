"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            setOtpSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            });

            if (error) throw error;

            if (data.session) {
                // Check if user profile exists
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', data.user?.id)
                    .single();

                // Redirect to orders page
                router.push('/orders');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    if (otpSent) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg p-8 md:p-8 w-full max-w-md">
                    {/* Whiteheart Logo */}
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="flex items-center space-x-1 cursor-pointer select-none">
                            <div className="font-dancing m-0 p-0 text-3xl font-bold flex flex-col leading-none text-black">
                                <h1>White Heart</h1>
                            </div>
                        </Link>
                    </div>

                    {/* OTP Verification */}
                    <h2 className="text-2xl font-extrabold mb-2 font-simon">Check your email</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        We sent a verification code to {email}
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleVerifyOtp}>
                        <div>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter verification code"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                required
                                maxLength={6}
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black font-simon text-white py-3 rounded-md font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setOtpSent(false);
                                setOtp('');
                                setError('');
                            }}
                            className="w-full text-gray-600 py-2 text-sm hover:text-black transition-colors"
                        >
                            Use a different email
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

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Email input */}
                <form className="space-y-4" onSubmit={handleSendOtp}>
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Continue button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black font-simon text-white py-3 rounded-md font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Continue'}
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
