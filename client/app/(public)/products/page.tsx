'use client';

import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import MoroccoTilesBg from "@/app/assests/MoroccoTilesBg.jpg";
import {
    Search,
    Filter,
    RefreshCw,
    ArrowRight,
    Package,
    AlertCircle,
    LayoutGrid,
} from "lucide-react";

// --- Types ---
interface ProductForm {
    item_id: number;
    maalem: number;
    title: string;
    description: string;
    category: string;
    photoUrl: string;
    maalemAskPrice: string;
    minSellPrice: string;
    platformFeePercentage: string;
    stockQuantity: number;
}

const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat('en-MA', { minimumFractionDigits: 0, maximumFractionDigits: 0, }).format(amount)} DH`;
};

export default function ProductsPage() {
    const router = useRouter();

    const [products, setProducts] = useState<ProductForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const fetchProducts = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await axios.get('http://192.168.1.110:8000/inventory/item');
            setProducts(res.data);
        } catch (error: any) {
            console.log('Error fetching products:', error.response);
            console.log('details: ', error.response?.data);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ["All", ...Array.from(cats)];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.item_id.toString().includes(searchQuery);
            const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    const calculateDisplayPrice = (product: ProductForm) => {
        const ask = parseFloat(product.maalemAskPrice);
        const fee = parseFloat(product.platformFeePercentage);
        return ask * (1 + fee / 100);
    };

    return (
        <div className="min-h-screen bg-black text-neutral-100 font-sans relative">

            {/* HERO SECTION - Tiles Background (Fixed Attachment) */}
            <div className="relative mt-24">
                <div
                    aria-hidden
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: `url(${MoroccoTilesBg?.src ?? MoroccoTilesBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed',
                        filter: 'contrast(250%)',
                        opacity: 0.3,
                    }}
                />
                
                <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-12 pb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-serif font-medium text-white tracking-tight">
                                Atelier Inventory
                            </h1>
                            <p className="text-neutral-400">
                                Manage and view verified Maalem masterpieces.
                            </p>
                        </div>

                        <button
                            onClick={() => fetchProducts(true)}
                            disabled={refreshing || loading}
                            className="group flex items-center gap-2 bg-black border border-neutral-800 hover:border-indigo-500/50 text-neutral-300 px-5 py-2.5 rounded-full transition-all duration-300"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-500" : "group-hover:text-white"}`} />
                            <span className="text-sm font-medium">{refreshing ? "Syncing..." : "Sync Inventory"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT - Solid Black Background */}
            <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-20">

                {/* SEARCH BAR (100% Solid Black) */}
                <div className="sticky top-4 z-50 bg-black border border-neutral-800 p-4 rounded-2xl mb-10 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                        <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedCategory === cat
                                    ? "bg-white text-black border-white"
                                    : "bg-black text-neutral-400 border-neutral-800 hover:border-neutral-600"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PRODUCT CARDS (100% Solid Black) */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[400px] bg-neutral-900 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.item_id}
                                onClick={() => router.push(`/products/${product.item_id}`)}
                                className="group relative bg-black border border-neutral-800 rounded-3xl overflow-hidden hover:border-neutral-500 transition-all duration-300 cursor-pointer flex flex-col shadow-lg"
                            >
                                {/* Image Area */}
                                <div className="aspect-[4/3] overflow-hidden bg-neutral-900 relative">
                                    {product.photoUrl ? (
                                        <img
                                            src={product.photoUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <LayoutGrid className="w-10 h-10 text-neutral-800" />
                                        </div>
                                    )}
                                </div>

                                {/* Body Area (Solid bg-black ensures no tiles show here) */}
                                <div className="p-5 flex flex-col flex-grow bg-black">
                                    <h3 className="text-white font-medium text-lg mb-2 line-clamp-1">
                                        {product.title}
                                    </h3>
                                    <p className="text-neutral-500 text-sm line-clamp-2 mb-6 h-10">
                                        {product.description}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-neutral-800 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-neutral-500 uppercase font-bold">Price</span>
                                            <span className="text-white font-semibold">
                                                {formatCurrency(calculateDisplayPrice(product))}
                                            </span>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-neutral-700 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}