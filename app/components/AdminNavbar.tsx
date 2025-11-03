"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminNavbar() {
    const [user, setUser] = useState<any>(null);
    const [userName, setUserName] = useState<string>("");
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            // Get user profile
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('first_name, last_name')
                .eq('user_id', user.id)
                .single();
            
            if (profile) {
                setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Admin');
            }
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-8 md:px-12">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/admin" className="text-3xl font-dancing hover:opacity-80 transition-opacity">
                        Whiteheart
                    </Link>

                    {/* Admin Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link 
                            href="/admin" 
                            className="font-simon text-sm hover:opacity-70 transition-opacity"
                        >
                            Dashboard
                        </Link>
                        <Link 
                            href="/admin/products" 
                            className="font-simon text-sm hover:opacity-70 transition-opacity"
                        >
                            Products
                        </Link>
                        <Link 
                            href="/admin/orders" 
                            className="font-simon text-sm hover:opacity-70 transition-opacity"
                        >
                            Orders
                        </Link>
                    </div>

                    {/* User Info & Sign Out */}
                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <span className="text-sm font-simon text-gray-600 hidden md:block">
                                    {userName}
                                </span>
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 text-sm font-simon border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
