"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminNavbar from "../../../components/AdminNavbar";
import Footer from "../../../components/Footer";
import SuccessModal from "../../../components/SuccessModal";
import ErrorModal from "../../../components/ErrorModal";
import Link from "next/link";

interface ColorInput {
    id: string;
    color_name: string;
    hex_code: string;
}

interface SizeInput {
    id: string;
    size_name: string;
    stock_quantity: number;
}

interface FeatureInput {
    id: string;
    feature_label: string;
}

export default function NewProductPage() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock_quantity: ""
    });
    const [colors, setColors] = useState<ColorInput[]>([{ id: "1", color_name: "", hex_code: "#000000" }]);
    const [sizes, setSizes] = useState<SizeInput[]>([{ id: "1", size_name: "", stock_quantity: 0 }]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageFiles([...imageFiles, ...files]);
            
            // Create preview URLs
            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
        }
    };

    const removeImage = (index: number) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviewUrls.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setImagePreviewUrls(newPreviews);
    };

    const addColor = () => {
        setColors([...colors, { id: Date.now().toString(), color_name: "", hex_code: "#000000" }]);
    };

    const removeColor = (id: string) => {
        setColors(colors.filter(c => c.id !== id));
    };

    const updateColor = (id: string, field: keyof ColorInput, value: string) => {
        setColors(colors.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const addSize = () => {
        setSizes([...sizes, { id: Date.now().toString(), size_name: "", stock_quantity: 0 }]);
    };

    const removeSize = (id: string) => {
        setSizes(sizes.filter(s => s.id !== id));
    };

    const updateSize = (id: string, field: keyof SizeInput, value: string | number) => {
        setSizes(sizes.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload all images to Supabase Storage
            const imageUrls: string[] = [];
            
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${i}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, file);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrl);
            }

            // Use first image as primary image_url, store all as images array
            const primaryImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

            // Prepare colors array (JSONB)
            const colorsArray = colors
                .filter(c => c.color_name && c.hex_code)
                .map(c => ({
                    name: c.color_name,
                    hex: c.hex_code
                }));

            // Prepare sizes array (JSONB)
            const sizesArray = sizes
                .filter(s => s.size_name)
                .map(s => ({
                    name: s.size_name,
                    stock: s.stock_quantity
                }));

            // Insert product with all data
            const { data: product, error: productError } = await supabase
                .from('products')
                .insert([{
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    stock_quantity: parseInt(formData.stock_quantity),
                    image_url: primaryImageUrl,
                    images: imageUrls.length > 0 ? imageUrls : null, // Store all images
                    colors: colorsArray.length > 0 ? colorsArray : null,
                    sizes: sizesArray.length > 0 ? sizesArray : null
                }])
                .select()
                .single();

            if (productError) throw productError;

            setShowSuccessModal(true);
        } catch (error: any) {
            console.error('Error creating product:', error);
            setErrorMessage(error.message || 'Failed to create product');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        router.push('/admin/products');
    };

    const handleErrorClose = () => {
        setShowErrorModal(false);
    };

    return (
        <>
            <AdminNavbar />
            <div className="min-h-screen bg-gray-50 py-12 px-8 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Link href="/admin/products" className="text-blue-600 hover:underline font-simon mb-2 inline-block">
                            ← Back to Products
                        </Link>
                        <h1 className="text-4xl font-bold">Add New Product</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold font-simon mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Classic White Cap"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold font-simon mb-2">Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Detailed product description..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold font-simon mb-2">Price (₦) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                        <p className="text-sm text-gray-600 font-simon mt-1">All prices are in Nigerian Naira (₦)</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold font-simon mb-2">Stock Quantity *</label>
                                        <input
                                            type="number"
                                            name="stock_quantity"
                                            value={formData.stock_quantity}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold font-simon mb-2">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Caps, Accessories"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Images */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">Product Images</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold font-simon mb-2">Upload Product Images</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-sm text-gray-600 font-simon mt-1">
                                        Upload multiple images. The first image will be the main product image.
                                    </p>
                                </div>

                                {imagePreviewUrls.length > 0 && (
                                    <div>
                                        <p className="text-sm font-semibold font-simon mb-2">
                                            {imagePreviewUrls.length} image(s) selected
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {imagePreviewUrls.map((url, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                                    />
                                                    {index === 0 && (
                                                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-simon">
                                                            Main
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">Available Colors</h2>
                                <button
                                    type="button"
                                    onClick={addColor}
                                    className="text-blue-600 hover:underline font-simon text-sm"
                                >
                                    + Add Color
                                </button>
                            </div>

                            <div className="space-y-3">
                                {colors.map((color) => (
                                    <div key={color.id} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={color.color_name}
                                            onChange={(e) => updateColor(color.id, 'color_name', e.target.value)}
                                            placeholder="Color name (e.g., Black)"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="color"
                                            value={color.hex_code}
                                            onChange={(e) => updateColor(color.id, 'hex_code', e.target.value)}
                                            className="w-20 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={color.hex_code}
                                            onChange={(e) => updateColor(color.id, 'hex_code', e.target.value)}
                                            placeholder="#000000"
                                            className="w-28 px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeColor(color.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sizes */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">Available Sizes</h2>
                                <button
                                    type="button"
                                    onClick={addSize}
                                    className="text-blue-600 hover:underline font-simon text-sm"
                                >
                                    + Add Size
                                </button>
                            </div>

                            <div className="space-y-3">
                                {sizes.map((size) => (
                                    <div key={size.id} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={size.size_name}
                                            onChange={(e) => updateSize(size.id, 'size_name', e.target.value)}
                                            placeholder="Size (e.g., M, L, XL)"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            value={size.stock_quantity}
                                            onChange={(e) => updateSize(size.id, 'stock_quantity', parseInt(e.target.value) || 0)}
                                            placeholder="Stock"
                                            min="0"
                                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSize(size.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end gap-4">
                            <Link
                                href="/admin/products"
                                className="px-6 py-3 border border-gray-300 rounded-lg font-simon hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-black text-white rounded-lg font-simon hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Product...' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
            
            {/* Modals */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessClose}
                message="Product has been created successfully and added to your catalog!"
            />
            
            <ErrorModal
                isOpen={showErrorModal}
                onClose={handleErrorClose}
                message={errorMessage}
            />
        </>
    );
}
