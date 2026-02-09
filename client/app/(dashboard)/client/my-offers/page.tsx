'use client'

import { useUser } from "@/app/context/UserContext";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Tag, 
  ArrowRight, 
  Loader2, 
  PackageX,
  Gavel
} from "lucide-react";

// --- Types ---
interface Offer { 
  offer_id: number; 
  offer_quantity: number; 
  maalem_net_offer: string; 
  client_offer_total: string; 
  platform_margin: string; 
  status: 'pending' | 'accepted' | 'rejected'; 
  date: string; 
  item: number; 
}

interface Item { 
  item_id: number; 
  title: string; 
  photoUrl: string; 
}

interface MyOffer { 
  item_id: number; // Added to allow linking back to item
  title: string; 
  photoUrl: string; 
  offer_quantity: number; 
  price: string; 
  status: 'pending' | 'accepted' | 'rejected'; 
  date: string; 
}

// --- Utils ---
const formatCurrency = (amount: string | number) => {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function ClientOffersPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const [myOffers, setMyOffers] = useState<MyOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not client (or handle via middleware in real app)
    if (user && user.type !== 'client') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      if (!user) return; // Wait for user context

      try {
        setLoading(true);

        // 1. Fetch Offers
        const offerRes = await axios.get<Offer[]>(`http://192.168.1.110:8000/sales/offers/client/${user.id}/`);
        const offersData = offerRes.data;

        // 2. Fetch Items (Parallel Requests)
        const itemsData = await Promise.all(
          offersData.map(async (o) => {
            try {
              const res = await axios.get<Item>(`http://192.168.1.110:8000/inventory/item/${o.item}/`);
              return res.data;
            } catch (err) {
              return null; // Handle deleted items gracefully
            }
          })
        );

        // 3. Combine Data
        const combined: MyOffer[] = offersData.map((offer, idx) => {
          const item = itemsData[idx];
          return {
            item_id: offer.item,
            title: item?.title || 'Item Unavailable',
            photoUrl: item?.photoUrl || '',
            offer_quantity: offer.offer_quantity,
            price: offer.client_offer_total,
            status: offer.status,
            date: offer.date,
          };
        });

        // Sort by date (newest first)
        setMyOffers(combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (err) {
        console.error("Failed to load offers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  // --- Helper for Status Styling ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          icon: CheckCircle2,
          className: "bg-emerald-500 text-white",
          label: "Offer Accepted"
        };
      case 'rejected':
        return {
          icon: XCircle,
          className: "bg-red-500 text-white",
          label: "Offer Declined"
        };
      default:
        return {
          icon: Clock,
          className: "bg-amber-500 text-black",
          label: "Pending Review"
        };
    }
  };

  return (
    <div className="min-h-screen mt-26 bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-medium tracking-wider text-xs uppercase">
              <Gavel className="w-4 h-4" />
              <span>Negotiations</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-white tracking-tight">
              My Offers
            </h1>
            <p className="text-neutral-400 text-sm max-w-lg">
              Track the status of your offers on Maalem masterpieces.
            </p>
          </div>
          <Link href="/products" className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all">
            <span>Browse More</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          // Skeleton Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral-900/40 rounded-3xl h-[380px] animate-pulse border border-neutral-800" />
            ))}
          </div>
        ) : myOffers.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-neutral-800 rounded-3xl bg-neutral-900/20">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-6 text-neutral-600">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No offers made yet</h3>
            <p className="text-neutral-500 max-w-sm mb-6">
              Found a piece you love? Make an offer to the Maalem directly.
            </p>
            <Link href="/products" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center gap-2">
              Start Exploring <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          // Offers Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myOffers.map((offer, index) => {
              const Badge = getStatusBadge(offer.status);
              return (
                <div 
                  key={index} 
                  className="group flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden hover:border-neutral-700 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image Header */}
                  <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden">
                    {offer.photoUrl ? (
                      <img 
                        src={offer.photoUrl} 
                        alt={offer.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700 bg-neutral-950">
                        <PackageX className="w-10 h-10 opacity-20" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg backdrop-blur-md ${Badge.className}`}>
                      <Badge.icon className="w-3.5 h-3.5" />
                      <span>{Badge.label}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <Link href={`/products/${offer.item_id}`} className="hover:text-indigo-400 transition-colors">
                         <h3 className="text-lg font-serif font-medium text-white leading-tight line-clamp-2">
                          {offer.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-neutral-500 mb-6 border-b border-neutral-800 pb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(offer.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Qty: {offer.offer_quantity}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">Your Offer</span>
                         <span className="text-xl font-medium text-white">
                           {formatCurrency(offer.price)}
                         </span>
                      </div>
                      
                      {offer.status === 'accepted' && (
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                          Proceed to Pay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}