'use client'

import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  PlusCircle,
  Package,
  Edit,
  Eye,
  AlertCircle,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Loader2,
  Grid,
  List,
  MoreVertical
} from "lucide-react";

interface Product {
  item_id: number;
  title: string;
  description: string;
  category: string;
  photoUrl: string;
  maalemAskPrice: number;
  minSellPrice: number;
  platformFeePercentage: number;
  stockQuantity: number;
}

export default function MaalemProductsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (user?.type !== 'maalem') {
      router.push('/products');
      return;
    }
    
    fetchProducts();
  }, [user, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://192.168.1.110:8000/inventory/maalem/items/${user.id}/`);
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate public price (maalem ask price + platform fee)
  const calculatePublicPrice = (product: Product) => {
    return product.maalemAskPrice * (1 + product.platformFeePercentage / 100);
  };

  // Statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + calculatePublicPrice(p), 0);
    const lowStock = products.filter(p => p.stockQuantity < 5).length;
    const categories = [...new Set(products.map(p => p.category))];
    
    return { totalProducts, totalValue, lowStock, categories: categories.length };
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-neutral-500 font-medium">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-26 bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-serif font-medium text-white">
                Your Atelier
              </h1>
              <p className="text-neutral-400">
                Manage your collection of masterpieces
              </p>
            </div>
            
            <button
              onClick={() => router.push('/maalem/products/new')}
              className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-100 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>New Masterpiece</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Package className="w-5 h-5 text-indigo-400" />
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-medium text-white mb-1">{stats.totalProducts}</div>
              <div className="text-sm text-neutral-400">Total Pieces</div>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span className="text-xs text-emerald-400">+12%</span>
              </div>
              <div className="text-2xl font-medium text-white mb-1">
                {stats.totalValue.toLocaleString('en-MA', { style: 'currency', currency: 'MAD' })}
              </div>
              <div className="text-sm text-neutral-400">Total Value</div>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span className="text-xs text-amber-400">Attention</span>
              </div>
              <div className="text-2xl font-medium text-white mb-1">{stats.lowStock}</div>
              <div className="text-sm text-neutral-400">Low Stock</div>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Filter className="w-5 h-5 text-indigo-400" />
                <span className="text-xs text-indigo-400">Categories</span>
              </div>
              <div className="text-2xl font-medium text-white mb-1">{stats.categories}</div>
              <div className="text-sm text-neutral-400">Categories</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="sticky top-4 z-10 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-2xl p-4 mb-8 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search your pieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                  selectedCategory === 'All' 
                  ? "bg-white text-black border-white" 
                  : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600"
                }`}
              >
                All
              </button>
              {stats.categories > 0 && [...new Set(products.map(p => p.category))].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                    selectedCategory === cat 
                    ? "bg-white text-black border-white" 
                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 border-l border-neutral-800 pl-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500 border border-dashed border-neutral-800 rounded-3xl">
            <Package className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No pieces in your collection</p>
            <p className="text-sm mb-6">Start by adding your first masterpiece</p>
            <button
              onClick={() => router.push('/maalem/products/new')}
              className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-neutral-100"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Piece
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.item_id}
                className="group bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-600 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden bg-neutral-950 relative">
                  {product.photoUrl ? (
                    <img 
                      src={product.photoUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950">
                      <Package className="w-12 h-12 text-neutral-800" />
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button 
                      onClick={() => router.push(`/products/${product.item_id}`)}
                      className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline-block mr-2" />
                      View
                    </button>
                    <button 
                      onClick={() => router.push(`/maalem/products/edit/${product.item_id}`)}
                      className="bg-neutral-800 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-700 transition-colors"
                    >
                      <Edit className="w-4 h-4 inline-block mr-2" />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                      {product.title}
                    </h3>
                    <div className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-400">
                      {product.category}
                    </div>
                  </div>
                  
                  <p className="text-neutral-500 text-sm line-clamp-2 mb-4 h-10">
                    {product.description}
                  </p>

                  <div className="pt-4 border-t border-neutral-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-500 uppercase">Your Price</span>
                        <span className="text-neutral-200 font-semibold">
                          {product.maalemAskPrice.toLocaleString('en-MA', { style: 'currency', currency: 'MAD' })}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-neutral-500 uppercase">Client Price</span>
                        <span className="text-indigo-400 font-semibold">
                          {calculatePublicPrice(product).toLocaleString('en-MA', { style: 'currency', currency: 'MAD' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.stockQuantity > 10 ? 'bg-emerald-500' : product.stockQuantity > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-neutral-400">
                          {product.stockQuantity} in stock
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        {product.platformFeePercentage}% fee
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.item_id}
                className="group bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-neutral-600 transition-all duration-300"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-950 flex-shrink-0">
                    {product.photoUrl ? (
                      <img 
                        src={product.photoUrl} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-neutral-800" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-lg font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
                        {product.title}
                      </h3>
                      <div className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-400 ml-2">
                        {product.category}
                      </div>
                    </div>
                    
                    <p className="text-neutral-500 text-sm line-clamp-1 mb-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">Stock:</span>
                        <span className={`font-medium ${product.stockQuantity > 10 ? 'text-emerald-400' : product.stockQuantity > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                          {product.stockQuantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">Your Price:</span>
                        <span className="text-neutral-200 font-medium">
                          {product.maalemAskPrice.toLocaleString('en-MA', { style: 'currency', currency: 'MAD' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">Client Price:</span>
                        <span className="text-indigo-400 font-medium">
                          {calculatePublicPrice(product).toLocaleString('en-MA', { style: 'currency', currency: 'MAD' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => router.push(`/products/${product.item_id}`)}
                      className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/maalem/products/edit/${product.item_id}`)}
                      className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        {filteredProducts.length > 0 && (
          <div className="mt-10 pt-8 border-t border-neutral-800 flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              Showing {filteredProducts.length} of {products.length} pieces
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/maalem/products/new')}
                className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-medium hover:bg-neutral-100 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Another Piece
              </button>
              <button
                onClick={fetchProducts}
                className="flex items-center gap-2 bg-neutral-800 text-white px-6 py-2.5 rounded-full font-medium hover:bg-neutral-700 transition-colors"
              >
                <Loader2 className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}