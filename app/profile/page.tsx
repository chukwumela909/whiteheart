"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Profile() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isDeletingAddress, setIsDeletingAddress] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const router = useRouter();
    const supabase = createClient();
    
    // Address form fields
    const [isDefaultAddress, setIsDefaultAddress] = useState(false);
    const [country, setCountry] = useState("France");
    const [addressFirstName, setAddressFirstName] = useState("");
    const [addressLastName, setAddressLastName] = useState("");
    const [address, setAddress] = useState("");
    const [apartment, setApartment] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        async function loadUserData() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                    router.push('/auth/signin');
                    return;
                }
                
                setUserEmail(session.user.email || "");
                setUserId(session.user.id);

                // Fetch user profile
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                if (profile) {
                    setFirstName(profile.first_name || "");
                    setLastName(profile.last_name || "");
                }

                // Fetch user addresses
                const { data: userAddresses } = await supabase
                    .from('user_addresses')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('is_default', { ascending: false })
                    .order('created_at', { ascending: false });

                if (userAddresses) {
                    setAddresses(userAddresses);
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading user data:', error);
                router.push('/auth/signin');
            }
        }
        
        loadUserData();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/auth/signin');
            } else {
                setUserEmail(session.user.email || "");
                setUserId(session.user.id);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router, supabase]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: userId,
                    first_name: firstName,
                    last_name: lastName,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;
            
            setIsEditingName(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAddress = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('user_addresses')
                .insert({
                    user_id: userId,
                    country: country,
                    first_name: addressFirstName,
                    last_name: addressLastName,
                    address_line1: address,
                    address_line2: apartment,
                    postal_code: postalCode,
                    city: city,
                    phone: phone,
                    is_default: isDefaultAddress
                });

            if (error) throw error;
            
            // Reload addresses
            const { data: userAddresses } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (userAddresses) {
                setAddresses(userAddresses);
            }
            
            // Reset form
            setAddressFirstName("");
            setAddressLastName("");
            setAddress("");
            setApartment("");
            setPostalCode("");
            setCity("");
            setPhone("");
            setIsDefaultAddress(false);
            setIsAddingAddress(false);
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth/signin');
    };

    const handleDeleteAddress = async (addressId: string) => {
        setAddressToDelete(addressId);
        setIsDeletingAddress(true);
    };

    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;

        try {
            const { error } = await supabase
                .from('user_addresses')
                .delete()
                .eq('id', addressToDelete);

            if (error) throw error;

            // Reload addresses
            const { data: userAddresses } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (userAddresses) {
                setAddresses(userAddresses);
            }

            setIsDeletingAddress(false);
            setAddressToDelete(null);
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Failed to delete address. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Delete Address Confirmation Modal */}
            {isDeletingAddress && (
                <div className="fixed inset-0 bg-[#51515137] backdrop-blur-sm bg-opacity-40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-8">
                        {/* Modal Header */}
                        <div className="mb-6">
                            <h2 className="text-xl font-extrabold font-simon mb-2">Delete address</h2>
                            <p className="text-sm font-simon text-gray-600">
                                Are you sure you want to delete this address? This action cannot be undone.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setIsDeletingAddress(false);
                                    setAddressToDelete(null);
                                }}
                                className="px-6 py-2.5 text-sm font-bold font-simon hover:bg-gray-100 transition-colors rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteAddress}
                                className="px-6 py-2.5 bg-red-600 text-white text-sm font-bold font-simon rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Address Modal */}
            {isAddingAddress && (
                <div className="fixed inset-0 bg-[#51515137] backdrop-blur-sm bg-opacity-40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg  max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-extrabold font-simon">Add address</h2>
                            <button
                                onClick={() => setIsAddingAddress(false)}
                                className="p-1 hover:opacity-70 transition-opacity"
                                aria-label="Close modal"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4 mb-6">
                            {/* Default Address Checkbox */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="defaultAddress"
                                    checked={isDefaultAddress}
                                    onChange={(e) => setIsDefaultAddress(e.target.checked)}
                                    className="w-4 h-4 border-2 border-gray-300 rounded focus:ring-2 focus:ring-black"
                                />
                                <label htmlFor="defaultAddress" className="text-sm font-simon cursor-pointer">
                                    This is my default address
                                </label>
                            </div>

                            {/* Country/Region Dropdown */}
                            <div>
                                <label className="text-xs font-simon text-gray-600 block mb-2">Country/region</label>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm appearance-none bg-white"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M2 4L6 8L10 4\' stroke=\'%23000\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '12px' }}
                                >
                                    <option value="France">France</option>
                                    <option value="Nigeria">Nigeria</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                </select>
                            </div>

                            {/* Name Fields Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="First name"
                                        value={addressFirstName}
                                        onChange={(e) => setAddressFirstName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Last name"
                                        value={addressLastName}
                                        onChange={(e) => setAddressLastName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm"
                                    />
                                </div>
                            </div>

                            {/* Address Field */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm"
                                />
                            </div>

                            {/* Apartment Field */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Apartment, suite, etc (optional)"
                                    value={apartment}
                                    onChange={(e) => setApartment(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm"
                                />
                            </div>

                            {/* Postal Code and City Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Postal code"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm"
                                    />
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="text-xs font-simon text-gray-600 block mb-2">Phone</label>
                                <div className="flex gap-2">
                                    <div className="relative w-32">
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm appearance-none bg-white pr-8"
                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M2 4L6 8L10 4\' stroke=\'%23000\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '12px' }}
                                        >
                                            <option value="+33">🇫🇷 +33</option>
                                            <option value="+234">🇳🇬 +234</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                        </select>
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsAddingAddress(false)}
                                className="px-6 py-2.5 text-sm font-bold font-simon hover:bg-gray-100 transition-colors rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAddress}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-black text-white text-sm font-bold font-simon rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Profile Modal */}
            {isEditingName && (
                <div className="fixed inset-0 bg-[#51515137] backdrop-blur-sm bg-opacity-40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg  w-full max-w-2xl p-8">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-extrabold font-simon">Edit profile</h2>
                            <button
                                onClick={() => setIsEditingName(false)}
                                className="p-1 hover:opacity-70 transition-opacity"
                                aria-label="Close modal"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4 mb-6">
                            {/* Name Fields Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="First name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Last name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-simon text-sm"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="text-sm font-medium font-simon text-gray-600 block mb-2">Email</label>
                                <p className="text-black font-bold font-simon text-sm mb-1">{userEmail}</p>
                                <p className="text-xs font-simon text-gray-500">This email is used for sign-in and order updates.</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsEditingName(false)}
                                className="px-6 py-2.5 text-sm font-bold font-simon hover:bg-gray-100 transition-colors rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving || (!firstName && !lastName)}
                                className="px-6 py-2.5 bg-black text-white text-sm font-bold font-simon rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-[#51515137] backdrop-blur-sm bg-opacity-40 z-50 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Menu */}
            <div className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Close Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-4 left-4 p-2 hover:opacity-70 transition-opacity"
                    aria-label="Close menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Logo */}
                <div className="flex justify-center pt-6 pb-8 border-b border-gray-200">
                    <Link href="/" className="flex items-center space-x-1 cursor-pointer select-none">
                        <div className="font-dancing m-0 p-0 text-3xl font-bold flex flex-col leading-none text-black">
                            <h1>White Heart</h1>
                        </div>
                    </Link>
                </div>

                {/* User Email */}
                <div className="px-6 py-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <svg width="24" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="grey" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-sm text-gray-700">{userEmail}</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="py-6 border-b border-gray-200">
                    <Link
                        href="/"
                        className="block px-6 py-4 text-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Shop
                    </Link>
                    <Link
                        href="/orders"
                        className="block px-6 py-4 text-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Orders
                    </Link>
                </nav>

                {/* Bottom Links */}
                <div className="absolute bottom-0 left-0 right-0 pb-6 border-t border-gray-200">
                    <Link
                        href="/profile"
                        className="block px-6 py-4 text-base font-bold border-b-2 border-black hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Profile
                    </Link>
                    {/* <Link
                        href="/settings"
                        className="block px-6 py-4 text-base hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Settings
                    </Link> */}
                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleSignOut();
                        }}
                        className="block w-full text-left px-6 py-4 text-base hover:bg-gray-50 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 hover:opacity-70 transition-opacity"
                        aria-label="Open menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {/* Logo and Navigation */}
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="flex items-center space-x-1 cursor-pointer select-none">
                            <div className="font-dancing mr-5 p-0 text-2xl font-bold flex flex-col leading-none text-black">
                                <h1>White Heart</h1>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href="/" className="text-sm font-bold hover:opacity-70 transition-opacity">
                                Shop
                            </Link>
                            <Link href="/orders" className="text-sm font-bold hover:opacity-70 transition-opacity">
                                Orders
                            </Link>
                        </nav>
                    </div>

                    {/* User Account Dropdown - Desktop Only */}
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2 hover:opacity-70 transition-opacity"
                            aria-label="User menu"
                        >
                            <svg width="24" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="grey" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                            >
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-200 flex items-center space-x-3">
                                    <svg width="24" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="grey" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="text-sm text-gray-700">{userEmail}</span>
                                </div>
                                <Link
                                    href="/profile"
                                    className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Profile
                                </Link>
                                {/* <Link
                                    href="/settings"
                                    className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Settings
                                </Link> */}
                                <button
                                    onClick={handleSignOut}
                                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-2xl font-extrabold font-simon mb-12">Profile</h1>

                {/* Profile Card */}
                <div className="bg-white rounded-lg p-8 mb-6">
                    {/* Name Section */}
                    <div className=" border-gray-200">
                        <div className="flex mb-5 items-center ">
                            <label className="text-sm font-bold font-simon text-gray-500">Name</label>
                            <button
                                onClick={() => setIsEditingName(true)}
                                className=" hover:opacity-70 transition-opacity"
                                aria-label="Edit name"
                            >
                                <svg width="16" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.3333 2.00004C11.5084 1.82494 11.7163 1.68605 11.9451 1.59129C12.1738 1.49653 12.419 1.44775 12.6667 1.44775C12.9143 1.44775 13.1595 1.49653 13.3883 1.59129C13.617 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.383 14.4088 2.61178C14.5035 2.84055 14.5523 3.08575 14.5523 3.33337C14.5523 3.58099 14.5035 3.82619 14.4088 4.05497C14.314 4.28374 14.1751 4.49161 14 4.66671L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-400 font-simon text-sm">
                            {firstName || lastName ? `${firstName} ${lastName}`.trim() : ""}
                        </p>
                    </div>

                    {/* Email Section */}
                    <div>
                        <label className="text-sm font-bold font-simon text-gray-500 block mb-1">Email</label>
                        <p className="text-gray-800 font-bold font-simon text-sm">{userEmail}</p>
                    </div>
                </div>

                {/* Addresses Section */}
                <div className="bg-white rounded-lg p-8">
                    <div className="flex items-center ">
                        <h2 className="text-medium font-extrabold font-simon">Addresses</h2>
                        <button 
                            onClick={() => setIsAddingAddress(true)}
                            className="flex items-center ml-5  text-sm font-bold font-simon hover:opacity-70 transition-opacity"
                        >
                            <span className="text-xl">+</span>
                            <span className="text-medium font-extrabold font-simon">Add</span>
                        </button>
                    </div>

                    {/* Display Addresses or Empty State */}
                    {addresses.length === 0 ? (
                        <div className="bg-gray-50 border mt-5 border-gray-300 rounded-md p-6 flex items-center space-x-3">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="text-lg font-medium font-simon  text-gray-800">No addresses added</span>
                        </div>
                    ) : (
                        <div className="mt-5 space-y-4">
                            {addresses.map((addr) => (
                                <div key={addr.id} className="border border-gray-300 rounded-md p-6 relative">
                                    {addr.is_default && (
                                        <span className="absolute top-4 right-4 bg-black text-white text-xs px-2 py-1 rounded font-simon font-bold">
                                            DEFAULT
                                        </span>
                                    )}
                                    <div className="space-y-2">
                                        <p className="font-bold font-simon text-sm">
                                            {addr.first_name} {addr.last_name}
                                        </p>
                                        <p className="text-sm font-simon text-gray-700">
                                            {addr.address_line1}
                                            {addr.address_line2 && `, ${addr.address_line2}`}
                                        </p>
                                        <p className="text-sm font-simon text-gray-700">
                                            {addr.city}, {addr.postal_code}
                                        </p>
                                        <p className="text-sm font-simon text-gray-700">
                                            {addr.country}
                                        </p>
                                        {addr.phone && (
                                            <p className="text-sm font-simon text-gray-700">
                                                {addr.phone}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAddress(addr.id)}
                                        className="mt-4 text-sm text-red-600 hover:text-red-800 font-simon font-bold"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white mt-auto fixed bottom-0 w-full">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center space-x-6 text-sm">
                    <button className="flex items-center space-x-2 hover:opacity-70 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 14 14" className="a8x1wuy a8x1wux _1fragem32 _1fragemq1 _1fragemly _1fragemlo _1fragemp6" focusable="false" aria-hidden="true"><g clipPath="url(#globe_svg__a)"><path strokeLinejoin="round" d="M9.1 1.807a5.6 5.6 0 0 0-7.218 2.916M9.1 1.807a5.6 5.6 0 0 1 3.345 6.509M9.1 1.807 9 2.3c-.102.25-.528.388-.9.5-.28.09-.91.1-.91.89-.019.237-.138.61-.284.81-.118.162-.448.334-.557.45-.116.08-.337.314-.297.62.05.38.308.83.854.88.437.04 1.71.017 2.292 0 .318-.05 1.292-.013 1.354 1.3.021.45-.045.566.4.566h1.493m0 0a5.6 5.6 0 0 1-5.68 4.28m0 0a5.6 5.6 0 0 1-4.883-7.873m4.884 7.873V10.6c-.03-.317-.319-.99-1.235-1.15-1.147-.2-1.135-1-1.135-1.608 0-.487-.363-.964-.544-1.142L2.2 5.06l-.318-.337"></path></g></svg>
                        <span>Nigeria</span>
                    </button>
                    <Link href="/refund-policy" className="hover:underline">
                        Refund policy
                    </Link>
                    <Link href="/shipping" className="hover:underline">
                        Shipping
                    </Link>
                    <Link href="/privacy" className="hover:underline">
                        Privacy policy
                    </Link>
                    <Link href="/terms" className="hover:underline">
                        Terms of service
                    </Link>
                </div>
            </footer>
        </div>
    );
}
