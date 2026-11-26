"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import LandingFooter from "./LandingFooter";
import HomeSections, { type HomeProduct } from "./HomeSections";
import Navbar from "./Navbar";
import HomeHero from "./HomeHero";

export const Homepage = () => {
    const [products, setProducts] = useState<HomeProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const supabase = createClient();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error loading products:', error instanceof Error ? error.message : error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative bg-white w-full">
            <div className="absolute left-0 right-0 top-0 z-20">
                <Navbar variant="hero" transparent />
            </div>

            <HomeHero />

            <div id="after-hero" className="scroll-mt-0" />

            <HomeSections products={products} loading={loading} />

            <LandingFooter />
        </div>
    );
};

export default Homepage;
