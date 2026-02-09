'use client'

import axios from "axios";
import React, { useState, useEffect, use, useMemo, useRef } from "react";
import { useRouter } from "next/navigation"; // Added for redirection
import { useUser } from "@/app/context/UserContext";
import {
  Heart,
  Share2,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Tag,
  Info,
  Send,
  User as UserIcon,
  ArrowRight // Added for the card interaction
} from "lucide-react";

// --- Types ---
interface ProductDetail {
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

interface LikeData {
  item_id: number;
  like_count: number;
}

interface CommentData {
  id?: number;
  client_id: number;
  text: string;
  created_at: string;
  client_name?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function PostPage({ params }: PageProps) {
  const { user } = useUser();
  const router = useRouter(); // Initialize router
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetail | null>(null);

  // Interaction State
  const [likes, setLikes] = useState<LikeData | null>(null);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Comment State
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [maalem, setMaalem] = useState<any>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Offer State
  const [offer, setOffer] = useState<number>(0);
  const [offerStatus, setOfferStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [activeTab, setActiveTab] = useState<"details" | "comments">("details");

  // Error/Feedback State
  const [interactionError, setInteractionError] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [prodRes, likeRes, commRes] = await Promise.all([
          axios.get(`http://192.168.1.110:8000/inventory/item/${id}`),
          axios.get(`http://192.168.1.110:8000/inventory/item/likes/${id}`),
          axios.get(`http://192.168.1.110:8000/inventory/item/comments/${id}`)
        ]);

        setProduct(prodRes.data);
        setLikes(likeRes.data);
        setComments(commRes.data.comments || commRes.data);

        if (user?.id) {
          try {
            const statusRes = await axios.get(`http://192.168.1.110:8000/inventory/item/like-status/${user.id}/${id}`);
            setUserHasLiked(statusRes.data.has_liked);
          } catch (err) {
            console.error("Like status check failed:", err);
          }
        }

        // Fetch Maalem Data
        if (prodRes.data.maalem) {
            const maalemRes = await axios.get(`http://192.168.1.110:8000/users/maalem/${prodRes.data.maalem}/`);
            setMaalem(maalemRes.data);
        }

      } catch (error) {
        console.error("Failed to load product data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user?.id]);

  // --- Like/Dislike Logic ---
  const handleLikeToggle = async () => {
    if (!user?.id) {
      setInteractionError("Please login to like this masterpiece.");
      setTimeout(() => setInteractionError(null), 3000);
      return;
    }

    setLikeLoading(true);
    const previousLikedState = userHasLiked;
    const previousLikeCount = likes?.like_count || 0;

    setUserHasLiked(!previousLikedState);
    setLikes(prev => prev ? ({ ...prev, like_count: previousLikedState ? prev.like_count - 1 : prev.like_count + 1 }) : null);

    try {
      if (previousLikedState) {
        await axios.post(`http://192.168.1.110:8000/inventory/item/dislike/${user.id}/`, { item_id: product?.item_id });
      } else {
        await axios.post(`http://192.168.1.110:8000/inventory/item/like/${user.id}/`, { item_id: product?.item_id });
      }
    } catch (error) {
      console.error("Like toggle failed", error);
      setUserHasLiked(previousLikedState);
      setLikes(prev => prev ? ({ ...prev, like_count: previousLikeCount }) : null);
      setInteractionError("Connection failed. Action reverted.");
      setTimeout(() => setInteractionError(null), 3000);
    } finally {
      setLikeLoading(false);
    }
  };

  // --- Comment Logic ---
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newComment.trim()) return;

    setCommentLoading(true);

    const optimisticComment: CommentData = {
      client_id: user.id,
      text: newComment,
      created_at: new Date().toISOString(),
      client_name: "You"
    };

    const prevComments = [...comments];
    setComments([...prevComments, optimisticComment]);
    setNewComment("");

    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      await axios.post(`http://192.168.1.110:8000/inventory/item/comment/${user.id}/`, {
        item_id: product?.item_id,
        text: optimisticComment.text
      });

      const res = await axios.get(`http://192.168.1.110:8000/inventory/item/comments/${id}`);
      setComments(res.data.comments || res.data);
    } catch (error) {
      console.error("Comment failed", error);
      setComments(prevComments);
      setInteractionError("Failed to post comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  // --- Price & Offer Logic ---
  const priceData = useMemo(() => {
    if (!product) return null;
    const ask = parseFloat(product.maalemAskPrice);
    const minSell = parseFloat(product.minSellPrice);
    const fee = parseFloat(product.platformFeePercentage);

    return {
      displayPrice: ask * (1 + fee / 100),
      minOffer: minSell * (1 + fee / 100),
      maxOffer: ask * (1 + fee / 100),
      fee
    };
  }, [product]);

  useEffect(() => {
    if (priceData && offer === 0) setOffer(Math.floor(priceData.minOffer));
  }, [priceData, offer]);

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOffer(Number(e.target.value));
    setOfferStatus("idle");
  };

  const submitOffer = async () => {
    if (!product || !priceData || !user?.id) return;
    setOfferStatus("pending");

    const maalemNetOffer = offer / (1 + priceData.fee / 100);
    const platformMargin = offer - maalemNetOffer;

    const payload = {
      offer_quantity: 1,
      maalem_net_offer: maalemNetOffer.toFixed(2),
      client_offer_total: offer.toFixed(2),
      platform_margin: platformMargin.toFixed(2),
      client: user.id,
      item: product.item_id,
    };

    try {
      await axios.post('http://192.168.1.110:8000/sales/offers/make-offer/', payload);
      setOfferStatus("success");
    } catch (err) {
      setOfferStatus("error");
    }
  };

  // --- Render ---
  if (loading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-neutral-500 font-medium">Loading masterpiece...</p>
      </div>
    </div>
  );

  if (!product || !priceData) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Product Not Found</div>;

  return (
    <div className="min-h-screen mt-12 bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">

        {/* Top Nav */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <span className="hover:text-indigo-400 cursor-pointer transition">Inventory</span>
          <span>/</span>
          <span className="text-neutral-200 truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">

          {/* LEFT: Image & Interactions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group aspect-[4/3] w-full overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl">
              {product.photoUrl ? (
                <img src={product.photoUrl} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-700">No Image</div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs px-3 py-1.5 rounded-full uppercase tracking-wider font-semibold">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Social Action Bar */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-6">
                {/* LIKE BUTTON */}
                <button
                  onClick={handleLikeToggle}
                  disabled={likeLoading}
                  className="group flex items-center gap-2 transition-all active:scale-95"
                >
                  <div className={`p-2.5 rounded-full transition-all duration-300 ${userHasLiked
                      ? "bg-red-500/10 text-red-500"
                      : "bg-neutral-900 text-neutral-400 group-hover:bg-red-500/10 group-hover:text-red-400"
                    }`}>
                    {userHasLiked ? (
                      <Heart className="w-6 h-6 fill-current animate-[heartbeat_0.3s_ease-in-out]" />
                    ) : (
                      <Heart className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`font-medium text-lg ${userHasLiked ? 'text-red-500' : 'text-neutral-400'}`}>
                    {likes?.like_count || 0}
                  </span>
                </button>

                {/* COMMENT BUTTON */}
                <button
                  onClick={() => setActiveTab("comments")}
                  className="group flex items-center gap-2 transition-all active:scale-95"
                >
                  <div className="p-2.5 rounded-full bg-neutral-900 text-neutral-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-lg text-neutral-400 group-hover:text-indigo-400">
                    {comments.length}
                  </span>
                </button>
              </div>

              <button className="p-2.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {interactionError && (
              <div className="animate-in slide-in-from-top-2 fade-in bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {interactionError}
              </div>
            )}
          </div>

          {/* RIGHT: Details & Tabs */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="sticky top-8 space-y-8">

              {/* Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wide uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Maalem Piece</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-white leading-tight">
                  {product.title}
                </h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-white">
                    {formatCurrency(priceData.displayPrice)}
                  </span>
                  <span className="text-neutral-500 text-sm">Asking Price</span>
                </div>
              </div>

              {/* --- MAALEM CARD --- */}
              {maalem && (
                <div 
                  onClick={() => router.push(`/maalem/${maalem.id_maalem}`)}
                  className="flex items-center gap-4 p-4 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl cursor-pointer hover:bg-neutral-900 hover:border-neutral-700 transition-all duration-300 group shadow-lg"
                >
                  {/* Initials Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                    {maalem.firstname?.[0]}{maalem.lastname?.[0]}
                  </div>
                  
                  {/* Text Info */}
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mb-0.5">
                      Handcrafted By
                    </p>
                    <h3 className="text-white font-medium group-hover:text-amber-500 transition-colors">
                      Maalem {maalem.firstname} {maalem.lastname}
                    </h3>
                  </div>
                  
                  {/* Arrow Icon */}
                  <div className="p-2 rounded-full text-neutral-500 group-hover:text-white group-hover:bg-neutral-800 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}
              {/* --- END MAALEM CARD --- */}

              {/* Offer System */}
              <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-3xl p-6 space-y-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-medium">Make an Offer</span>
                  <span className="text-neutral-500">{formatCurrency(priceData.minOffer)} - {formatCurrency(priceData.maxOffer)}</span>
                </div>
                <input
                  type="range"
                  min={priceData.minOffer}
                  max={priceData.maxOffer}
                  value={offer}
                  onChange={handleOfferChange}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex gap-4">
                  <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center text-lg font-mono">
                    {formatCurrency(offer)}
                  </div>
                  <button
                    onClick={submitOffer}
                    disabled={offerStatus === "pending" || !user?.id}
                    className="flex-1 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition disabled:opacity-50"
                  >
                    {offerStatus === "pending" ? "Sending..." : "Submit"}
                  </button>
                </div>
                {offerStatus === "success" && <p className="text-emerald-400 text-sm text-center">Offer submitted successfully!</p>}
              </div>

              {/* TABS */}
              <div className="pt-4">
                <div className="flex border-b border-neutral-800 mb-6">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`pb-3 pr-6 text-sm font-medium transition-colors relative ${activeTab === "details" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
                  >
                    Details
                    {activeTab === "details" && <span className="absolute bottom-0 left-0 w-full h-[1px] bg-indigo-500"></span>}
                  </button>
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`pb-3 px-6 text-sm font-medium transition-colors relative ${activeTab === "comments" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
                  >
                    Discussion
                    {activeTab === "comments" && <span className="absolute bottom-0 left-0 w-full h-[1px] bg-indigo-500"></span>}
                  </button>
                </div>

                {activeTab === "details" ? (
                  <p className="text-neutral-300 leading-relaxed text-lg font-light animate-in fade-in slide-in-from-bottom-2">
                    {product.description}
                  </p>
                ) : (
                  <div className="flex flex-col h-[400px] animate-in fade-in slide-in-from-bottom-2">
                    {/* Chat Feed */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 mb-4">
                      {comments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                          <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                          <p>No comments yet.</p>
                        </div>
                      ) : (
                        comments.map((comment, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div className="bg-neutral-900 rounded-2xl rounded-tl-none p-3 border border-neutral-800">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-white">
                                  {comment.client_name || `Client ${comment.client_id}`}
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-300 leading-relaxed">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={commentsEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handlePostComment} className="relative mt-auto">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user?.id ? "Add a comment..." : "Login to discuss"}
                        disabled={!user?.id}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-5 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-neutral-600"
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim() || commentLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-0 transition-all"
                      >
                        {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}