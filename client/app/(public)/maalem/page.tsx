'use client'

import axios from "axios"
import { useState, useEffect, useMemo } from "react"
import Link from 'next/link'
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Loader2, 
  AlertCircle 
} from "lucide-react"

// --- Types ---
interface Maalem {
  id_maalem: number;
  firstname: string;
  lastname: string;
  address: string;
  rating: number;
}

// --- Components ---
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      <Star className="w-4 h-4 fill-current" />
      <span className="text-white font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

const AvatarPlaceholder = ({ first, last }: { first: string, last: string }) => {
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  // Generate a consistent gradient based on name length to give variety
  const gradients = [
    "from-purple-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-blue-500 to-cyan-500"
  ];
  const index = (first.length + last.length) % gradients.length;
  
  return (
    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center text-white font-serif text-xl font-bold shadow-lg shadow-black/50`}>
      {initials}
    </div>
  );
};

export default function MaalemsPage() {
    const [maalems, setMaalems] = useState<Maalem[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("");

    const fetchMaalems = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await axios.get('http://192.168.1.110:8000/users/maalem')
            setMaalems(res.data)
        } catch (error: any) {
            setError('Unable to retrieve the artisan directory. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMaalems()
    }, [])

    // Client-side filtering
    const filteredMaalems = useMemo(() => {
        return maalems.filter(m => 
            `${m.firstname} ${m.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [maalems, searchQuery]);

    return (
        <div className="min-h-screen mt-12 bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400 font-medium tracking-wider text-sm uppercase">
                            <Users className="w-4 h-4" />
                            <span>The Guild</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium text-white tracking-tight">
                            Master Artisans
                        </h1>
                        <p className="text-neutral-400 max-w-lg leading-relaxed">
                            Discover the renowned Maalems behind our exclusive pieces. 
                            Verified for quality, tradition, and excellence.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                            <Search className="w-4 h-4" />
                        </div>
                        <input 
                            type="text"
                            placeholder="Find by name or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-neutral-800 rounded-xl leading-5 bg-neutral-900/50 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:bg-neutral-900 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 sm:text-sm transition-all shadow-lg"
                        />
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    // Skeleton Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-neutral-900/40 h-48 rounded-3xl animate-pulse border border-neutral-800" />
                        ))}
                    </div>
                ) : error ? (
                    // Error State
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-medium text-white">System Error</h3>
                        <p className="text-neutral-500">{error}</p>
                        <button 
                            onClick={() => fetchMaalems()}
                            className="px-6 py-2 bg-neutral-100 text-neutral-950 rounded-full font-medium hover:bg-white transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredMaalems.length === 0 ? (
                    // Empty Filter State
                    <div className="text-center py-20 text-neutral-500">
                        <p className="text-lg">No artisans found matching "{searchQuery}"</p>
                    </div>
                ) : (
                    // Data Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMaalems.map((maalem) => (
                            <div 
                                key={maalem.id_maalem} 
                                className="group relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-3xl p-6 transition-all duration-300 hover:bg-neutral-900 hover:border-neutral-700 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <AvatarPlaceholder first={maalem.firstname} last={maalem.lastname} />
                                        <div>
                                            <h2 className="text-xl font-serif font-medium text-white group-hover:text-indigo-200 transition-colors">
                                                {maalem.firstname} {maalem.lastname}
                                            </h2>
                                            <div className="flex items-center gap-1 text-xs font-medium text-indigo-400 mt-1 uppercase tracking-wider">
                                                <ShieldCheck className="w-3 h-3" />
                                                <span>Verified Maalem</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-full">
                                        <RatingStars rating={maalem.rating} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-neutral-400 text-sm bg-neutral-950/50 p-3 rounded-xl border border-neutral-800/50">
                                        <MapPin className="w-4 h-4 text-neutral-500" />
                                        <span className="truncate">{maalem.address}</span>
                                    </div>

                                    <Link href={`/maalem/${maalem.id_maalem}`} className="block">
                                        <button className="w-full py-3 rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2 opacity-90 hover:opacity-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                            <span>View Portfolio</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}