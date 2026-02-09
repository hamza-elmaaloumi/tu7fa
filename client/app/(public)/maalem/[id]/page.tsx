'use client';

import axios from "axios";
import React, { useState, useEffect, use, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Phone, 
  Package, 
  ShieldCheck, 
  Tag, 
  Grid, 
  AlertCircle,
  LayoutTemplate
} from "lucide-react";

// --- Types ---
interface MaalemProfileForm {
    id_maalem: number;
    firstname: string;
    lastname: string;
    is_managed_by_admin: boolean;
    phoneNumber: string;
}

interface ItemForm {
    item_id: number;
    maalem: number;
    title: string;
    description: string;
    category: string;
    photoUrl: string;
    maalemAskPrice: string;
    minSellPrice: string; // Hidden from view in UI for professionalism
    platformFeePercentage: string; // Hidden from view
    stockQuantity: number;
}

interface PageProps {
    params: Promise<{ id: string }>
}

// --- Utils ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Generate consistent avatar color based on name
const getAvatarGradient = (name: string) => {
    const gradients = [
        "from-indigo-500 to-purple-500",
        "from-emerald-500 to-teal-500",
        "from-rose-500 to-pink-500",
        "from-amber-500 to-orange-500",
    ];
    return gradients[name.length % gradients.length];
};

export default function MaalemProfile({ params }: PageProps) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();

    // --- State ---
    const [loading, setLoading] = useState(true);
    const [maalem, setMaalem] = useState<MaalemProfileForm | null>(null);
    const [products, setProducts] = useState<ItemForm[]>([]);

    // --- Data Fetching ---
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch in parallel for speed
                const [profileRes, productsRes] = await Promise.all([
                    axios.get(`http://192.168.1.110:8000/users/maalem/${id}/`),
                    axios.get(`http://192.168.1.110:8000/inventory/maalem/items/${id}/`)
                ]);
                setMaalem(profileRes.data);
                setProducts(productsRes.data);
            } catch (error: any) {
                console.log('Error fetching data:', error.response.data);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // --- Render Logic ---
    const calculatePublicPrice = (product: ItemForm) => {
        const ask = parseFloat(product.maalemAskPrice);
        const fee = parseFloat(product.platformFeePercentage);
        return ask * (1 + fee / 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 p-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-20 h-20 bg-neutral-900 rounded-full" />
                    <div className="h-4 w-48 bg-neutral-900 rounded" />
                </div>
            </div>
        );
    }

    if (!maalem) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-400 gap-4">
                <AlertCircle className="w-12 h-12" />
                <p>Artisan profile not found.</p>
                <button onClick={() => router.back()} className="text-white hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen mt-18 bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
            
            {/* Top Navigation */}
            <div className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Directory</span>
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10">
                
                {/* Profile Header Card */}
                <div className="relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-3xl p-8 mb-16 shadow-2xl">
                    {/* Decorative Background Blob */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px]" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                        {/* Avatar */}
                        <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${getAvatarGradient(maalem.firstname)} flex items-center justify-center shadow-lg`}>
                            <span className="text-3xl md:text-4xl font-serif font-bold text-white">
                                {maalem.firstname[0]}{maalem.lastname[0]}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-serif font-medium text-white mb-2">
                                        {maalem.firstname} {maalem.lastname}
                                    </h1>
                                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Verified Maalem</span>
                                    </div>
                                </div>
                                {maalem.is_managed_by_admin && (
                                    <span className="bg-neutral-800 text-neutral-400 text-xs px-3 py-1 rounded-full border border-neutral-700">
                                        Managed Partner
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-6 pt-2">
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm">{maalem.phoneNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <Package className="w-4 h-4" />
                                    <span className="text-sm">{products.length} Pieces in Collection</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portfolio Section */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                        <Grid className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-2xl font-serif font-medium text-white">Portfolio</h2>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <div 
                                    key={product.item_id} 
                                    onClick={() => router.push(`/products/${product.item_id}`)}
                                    className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden cursor-pointer hover:border-neutral-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Image */}
                                    <div className="aspect-[4/3] overflow-hidden relative bg-neutral-950">
                                        {product.photoUrl ? (
                                            <img 
                                                src={product.photoUrl} 
                                                alt={product.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-700">
                                                <LayoutTemplate className="w-10 h-10 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full border border-white/10">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-medium text-white line-clamp-1 mb-2 group-hover:text-indigo-400 transition-colors">
                                            {product.title}
                                        </h3>
                                        <p className="text-neutral-500 text-sm line-clamp-2 mb-4 h-10">
                                            {product.description}
                                        </p>
                                        
                                        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-neutral-500 uppercase">Price</span>
                                                <span className="text-neutral-200 font-semibold">
                                                    {formatCurrency(calculatePublicPrice(product))}
                                                </span>
                                            </div>
                                            {product.stockQuantity > 0 ? (
                                                <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                                    In Stock
                                                </span>
                                            ) : (
                                                <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full border border-red-400/20">
                                                    Sold Out
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-500 border border-dashed border-neutral-800 rounded-3xl">
                            <Package className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No masterpieces available yet.</p>
                            <p className="text-sm">Check back soon for new updates.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}