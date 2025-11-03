"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminNavbar from "../../../../components/AdminNavbar";
import Footer from "../../../../components/Footer";
import Link from "next/link";

interface ColorInput {
    id: string;
    color_name: string;
    hex_code: string;
    is_new?: boolean;
}

interface SizeInput {
    id: string;
    size_name: string;
    stock_quantity: number;
    is_new?: boolean;
}

interface FeatureInput {
    id: string;
    feature_label: string;
    is_new?: boolean;
}

interface ProductImage {
    id: string;
    image_url: string;
    display_order: number;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        stock_quantity: ""
    });
    const [colors, setColors] = useState<ColorInput[]>([]);
    const [sizes, setSizes] = useState<SizeInput[]>([]);
    const [features, setFeatures] = useState<FeatureInput[]>([]);
    const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        loadProduct();
    }, [params.id]);

    const loadProduct = async () => {
        try {
            // Load product
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .single();

            if (productError) throw productError;

            setFormData({
                name: product.name,
                description: product.description || "",
                price: product.price.toString(),
                category: product.category || "",
                stock_quantity: product.stock_quantity.toString()
            });

            // Parse images from JSONB array or use single image_url
            if (product.images && Array.isArray(product.images)) {
                setExistingImages(product.images.map((url: string, index: number) => ({
                    id: `existing-${index}`,
                    image_url: url,
                    display_order: index
                })));
            } else if (product.image_url) {
                setExistingImages([{
                    id: 'existing-0',
                    image_url: product.image_url,
                    display_order: 0
                }]);
            }

            // Parse colors from JSONB
            if (product.colors && Array.isArray(product.colors)) {
                setColors(product.colors.map((c: any, index: number) => ({
                    id: `color-${index}`,
                    color_name: c.name,
                    hex_code: c.hex,
                    is_new: false
                })));
            }

            // Parse sizes from JSONB
            if (product.sizes && Array.isArray(product.sizes)) {
                setSizes(product.sizes.map((s: any, index: number) => ({
                    id: `size-${index}`,
                    size_name: s.name,
                    stock_quantity: s.stock,
                    is_new: false
                })));
            }

        } catch (error) {
            console.error('Error loading product:', error);
            alert('Error loading product');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImageFiles([...newImageFiles, ...files]);
            
            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setNewImagePreviewUrls([...newImagePreviewUrls, ...newPreviewUrls]);
        }
    };

    const removeExistingImage = (imageId: string) => {
        if (confirm('Are you sure you want to delete this image?')) {
            // Just remove from state - will be saved on form submit
            setExistingImages(existingImages.filter(img => img.id !== imageId));
        }
    };

    const removeNewImage = (index: number) => {
        const newFiles = newImageFiles.filter((_, i) => i !== index);
        const newPreviews = newImagePreviewUrls.filter((_, i) => i !== index);
        setNewImageFiles(newFiles);
        setNewImagePreviewUrls(newPreviews);
    };

    const addColor = () => {
        setColors([...colors, { 
            id: 'new_' + Date.now().toString(), 
            color_name: "", 
            hex_code: "#000000",
            is_new: true 
        }]);
    };

    const removeColor = (id: string, is_new?: boolean) => {
        setColors(colors.filter(c => c.id !== id));
    };

    const updateColor = (id: string, field: keyof ColorInput, value: string) => {
        setColors(colors.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const addSize = () => {
        setSizes([...sizes, { 
            id: 'new_' + Date.now().toString(), 
            size_name: "", 
            stock_quantity: 0,
            is_new: true 
        }]);
    };

    const removeSize = (id: string, is_new?: boolean) => {
        setSizes(sizes.filter(s => s.id !== id));
    };

    const updateSize = (id: string, field: keyof SizeInput, value: string | number) => {
        setSizes(sizes.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const addFeature = () => {
        setFeatures([...features, { 
            id: 'new_' + Date.now().toString(), 
            feature_label: "",
            is_new: true 
        }]);
    };

    const removeFeature = async (id: string, is_new?: boolean) => {
        if (!is_new) {
            if (confirm('Are you sure you want to delete this feature?')) {
                try {
                    const { error } = await supabase
                        .from('product_features')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    setFeatures(features.filter(f => f.id !== id));
                } catch (error) {
                    console.error('Error deleting feature:', error);
                    alert('Error deleting feature');
                }
            }
        } else {
            setFeatures(features.filter(f => f.id !== id));
        }
    };

    const updateFeature = (id: string, value: string) => {
        setFeatures(features.map(f => f.id === id ? { ...f, feature_label: value } : f));
    };

    const uploadNewImages = async () => {
        const uploadedUrls: string[] = [];

        for (let i = 0; i < newImageFiles.length; i++) {
            const file = newImageFiles[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${i}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, file);

            if (error) {
                console.error('Error uploading image:', error);
                throw error;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);

            uploadedUrls.push(publicUrl);
        }

        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Upload new images and combine with existing
            let allImageUrls = existingImages.map(img => img.image_url);
            
            if (newImageFiles.length > 0) {
                const newUrls = await uploadNewImages();
                allImageUrls = [...allImageUrls, ...newUrls];
            }

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

            // Update product with all data
            const { error: productError } = await supabase
                .from('products')
                .update({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    stock_quantity: parseInt(formData.stock_quantity),
                    image_url: allImageUrls.length > 0 ? allImageUrls[0] : null,
                    images: allImageUrls.length > 0 ? allImageUrls : null,
                    colors: colorsArray.length > 0 ? colorsArray : null,
                    sizes: sizesArray.length > 0 ? sizesArray : null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', params.id);

            if (productError) throw productError;

            alert('Product updated successfully!');
            router.push('/admin/products');
        } catch (error: any) {
            console.error('Error updating product:', error);
            alert('Error updating product: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <AdminNavbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                        <p className="mt-4 font-simon">Loading product...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <AdminNavbar />
            <div className="min-h-screen bg-gray-50 py-12 px-8 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Link href="/admin/products" className="text-blue-600 hover:underline font-simon mb-2 inline-block">
                            ← Back to Products
                        </Link>
                        <h1 className="text-4xl font-bold ">Edit Product</h1>
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
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold font-simon mb-2">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Images */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">Product Images</h2>
                            
                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold mb-2">Current Images</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {existingImages.map((image) => (
                                            <div key={image.id} className="relative">
                                                <img
                                                    src={image.image_url}
                                                    alt="Product"
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(image.id)}
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

                            {/* Add New Images */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold font-simon mb-2">Add New Images</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleNewImageChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {newImagePreviewUrls.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {newImagePreviewUrls.map((url, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={url}
                                                    alt={`New ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
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
                                            placeholder="Color name"
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
                                            onClick={() => removeColor(color.id, color.is_new)}
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
                                            placeholder="Size"
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
                                            onClick={() => removeSize(size.id, size.is_new)}
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

                        {/* Features */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">Product Features</h2>
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="text-blue-600 hover:underline font-simon text-sm"
                                >
                                    + Add Feature
                                </button>
                            </div>

                            <div className="space-y-3">
                                {features.map((feature) => (
                                    <div key={feature.id} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={feature.feature_label}
                                            onChange={(e) => updateFeature(feature.id, e.target.value)}
                                            placeholder="Feature"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-simon focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(feature.id, feature.is_new)}
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
                                disabled={saving}
                                className="px-6 py-3 bg-black text-white rounded-lg font-simon hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}
