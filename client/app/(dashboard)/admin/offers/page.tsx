'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { 
  Phone, 
  MapPin, 
  Package, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Truck, 
  ChevronDown, 
  ChevronUp,
  Copy,
  LayoutDashboard,
  RefreshCw,
  AlertTriangle,
  DollarSign
} from "lucide-react";

// --- Interfaces (Kept as is) ---
interface Offer { offer_id: number; offer_quantity: number; maalem_net_offer: number; client_offer_total: number; platform_margin: number; status: 'pending' | 'accepted' | 'rejected'; date: string; client: number; item: number; }
interface Item { item_id: number; maalem: number; title: string; description: string; category: string; photoUrl: string; maalemAskPrice: number; minSellPrice: number; platformFeePercentage: number; stockQuantity: number; }
interface Maalem { id_maalem: number; firstname: string; lastname: string; address: string; rating: number; is_managed_by_admin: boolean; phoneNumber: string; }
interface Order { order_quantity: number; platform_margin: number; maalem_net: number; delivery_fee: number; final_price: number; final_paid: number; order_date: string; pickup_address: string; delivery_address: string; pickup_time: string | null; delivery_time: string | null; status: 'pickedUp' | 'delivered' | 'cash_collected' | 'maalem_paid' | 'returned'; offer: number; }

interface OfferDetail { 
    offer_id: number; 
    offer_quantity: number; 
    maalem_net_offer: number; 
    platform_margin: number; 
    client_offer_total: number; 
    date: string; 
    status: 'pending' | 'accepted' | 'rejected'; 
    item: { item_id: number; title: string; category: string; photoUrl: string; stockQuantity: number; }; 
    maalem: { id_maalem: number; firstname: string; lastname: string; phoneNumber: string; rating: number; address: string}; 
    client: { id_client: number; firstname: string; lastname: string; phoneNumber: string; address: string}; 
}

interface OrderFormData {
    delivery_fee: number;
    delivery_address: string;
}

// --- Utility: Copy to Clipboard ---
const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} type="button" className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors text-neutral-500 hover:text-white" title="Copy to clipboard">
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
    );
};

// --- Sub-Component: The Offer Card ---
// We move the forms INSIDE here so each card operates independently
const OfferManagementCard = ({ offer, refreshData }: { offer: OfferDetail, refreshData: () => void }) => {
    // Separate forms for distinct actions to prevent collision
    const { register: registerOrder, handleSubmit: handleOrderSubmit, formState: { isSubmitting: isOrdering } } = useForm<OrderFormData>();
    const { register: registerClient, handleSubmit: handleClientSubmit, formState: { isSubmitting: isNotifyingClient } } = useForm<{ message: string }>();
    const { register: registerMaalem, handleSubmit: handleMaalemSubmit, formState: { isSubmitting: isNotifyingMaalem } } = useForm<{ message: string }>();

    const [activeTab, setActiveTab] = useState<'none' | 'process' | 'notify_client' | 'notify_maalem'>('none');

    // --- Logic Wrappers ---
    const onCreateOrder = async (data: OrderFormData) => {
        try {
            const finalData = {
                order_quantity: offer.offer_quantity,
                platform_margin: offer.platform_margin,
                maalem_net: offer.maalem_net_offer,
                delivery_fee: data.delivery_fee,
                final_price: offer.client_offer_total,
                final_paid: Number(offer.client_offer_total) + Number(data.delivery_fee),
                order_date: new Date().toISOString(),
                pickup_address: offer.maalem.address,
                delivery_address: data.delivery_address || offer.client.address,
                pickup_time: null,
                delivery_time: null,
                status: 'pickedUp' as const,
                offer: offer.offer_id
            };
            
            await axios.post('http://192.168.1.110:8000/sales/orders/create/', finalData);
            await axios.patch(`http://192.168.1.110:8000/sales/offers/${offer.offer_id}/`, { status: 'accepted' });
            refreshData();
        } catch (err: any) {
            console.log("creating order error: ", err.response?.data);
        }
    };

    const notifyUser = async (data: { message: string }, type: 'client' | 'maalem') => {
        try {
            const payload = {
                message: data.message,
                is_read: false,
                recipient_type: type, 
                recipient_id: type === 'client' ? offer.client.id_client : offer.maalem.id_maalem   
            };
            console.log("Notification payload: ", payload);
            await axios.post('http://192.168.1.110:8000/notify/notifications/create/', payload);
            alert(`${type === 'client' ? 'Client' : 'Maalem'} notified successfully.`);
            setActiveTab('none');
        } catch (err: any) {
            alert("Error sending notification");
            console.log("notification error: ", err.response?.data);
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to REJECT this offer?")) return;
        try {
            await axios.patch(`http://192.168.1.110:8000/sales/offers/${offer.offer_id}/`, { status: 'rejected' });
            refreshData();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="bg-neutral-900  border border-neutral-800 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-neutral-700 flex flex-col h-full">
            {/* --- Card Header: Item Info --- */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex gap-4">
                <div className="h-20 w-20 rounded-lg bg-neutral-800 overflow-hidden shrink-0 border border-neutral-700">
                    {offer.item.photoUrl ? (
                        <img src={offer.item.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-neutral-600"><Package /></div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="text-white font-medium truncate">{offer.item.title}</h3>
                        <span className="text-xs font-mono text-neutral-500">#{offer.offer_id}</span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-1">{offer.item.category}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${offer.item.stockQuantity > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            Stock: {offer.item.stockQuantity}
                        </span>
                        <span className="text-xs text-neutral-500">{new Date(offer.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* --- The "Control Room" Grid: Maalem vs Client --- */}
            <div className="grid grid-cols-2 divide-x divide-neutral-800 flex-1">
                {/* Maalem Column */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <User className="w-3 h-3" /> ARTISAN (Maalem)
                    </div>
                    <div>
                        <p className="text-white font-serif text-lg leading-tight">{offer.maalem.firstname} {offer.maalem.lastname}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-amber-500 text-xs">★ {offer.maalem.rating}</span>
                        </div>
                    </div>
                    <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 flex items-center justify-between group">
                        <a href={`tel:${offer.maalem.phoneNumber}`} className="text-lg font-mono text-white hover:text-indigo-400 transition-colors flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {offer.maalem.phoneNumber}
                        </a>
                        <CopyButton text={offer.maalem.phoneNumber} />
                    </div>
                    <div className="text-xs text-neutral-500 flex items-start gap-1">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{offer.maalem.address}</span>
                    </div>
                    
                    <button 
                        onClick={() => setActiveTab(activeTab === 'notify_maalem' ? 'none' : 'notify_maalem')}
                        className={`w-full py-2 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${activeTab === 'notify_maalem' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                    >
                        <Send className="w-3 h-3" /> Msg Artisan
                    </button>
                </div>

                {/* Client Column */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <User className="w-3 h-3" /> CLIENT (Buyer)
                    </div>
                    <div>
                        <p className="text-white font-serif text-lg leading-tight">{offer.client.firstname} {offer.client.lastname}</p>
                        <p className="text-xs text-neutral-500 mt-1">Offers: {offer.client_offer_total} MAD</p>
                    </div>
                    <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 flex items-center justify-between">
                        <a href={`tel:${offer.client.phoneNumber}`} className="text-lg font-mono text-white hover:text-emerald-400 transition-colors flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {offer.client.phoneNumber}
                        </a>
                        <CopyButton text={offer.client.phoneNumber} />
                    </div>
                    <div className="text-xs text-neutral-500 flex items-start gap-1">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{offer.client.address}</span>
                    </div>

                    <button 
                         onClick={() => setActiveTab(activeTab === 'notify_client' ? 'none' : 'notify_client')}
                         className={`w-full py-2 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${activeTab === 'notify_client' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                    >
                        <Send className="w-3 h-3" /> Msg Client
                    </button>
                </div>
            </div>

            {/* --- Action Drawers (Conditional Rendering) --- */}
            {activeTab === 'notify_maalem' && (
                <form onSubmit={handleMaalemSubmit((d) => notifyUser(d, 'maalem'))} className="bg-indigo-950/20 p-4 border-t border-indigo-500/20 animate-in slide-in-from-top-2">
                    <label className="text-xs text-indigo-300 block mb-2">Instructions for Artisan:</label>
                    <div className="flex gap-2">
                        <input 
                            {...registerMaalem("message", { required: true })} 
                            defaultValue={`Please prepare "${offer.item.title}" (ID: ${offer.item.item_id}). The courier is coming.`}
                            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button disabled={isNotifyingMaalem} type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            {isNotifyingMaalem ? '...' : 'Send'}
                        </button>
                    </div>
                </form>
            )}

            {activeTab === 'notify_client' && (
                <form onSubmit={handleClientSubmit((d) => notifyUser(d, 'client'))} className="bg-emerald-950/20 p-4 border-t border-emerald-500/20 animate-in slide-in-from-top-2">
                    <label className="text-xs text-emerald-300 block mb-2">Update for Client:</label>
                    <div className="flex gap-2">
                        <input 
                            {...registerClient("message", { required: true })} 
                            defaultValue={`Good news! Your offer for "${offer.item.title}" was accepted. Our courier will contact you shortly.`}
                            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button disabled={isNotifyingClient} type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            {isNotifyingClient ? '...' : 'Send'}
                        </button>
                    </div>
                </form>
            )}

            {activeTab === 'process' && (
                <form onSubmit={handleOrderSubmit(onCreateOrder)} className="bg-neutral-800 p-5 border-t border-neutral-700 animate-in slide-in-from-top-2">
                    <h4 className="text-white font-medium text-sm mb-4 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Finalize Delivery Details
                    </h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-xs text-neutral-400">Delivery Fee (MAD)</label>
                                <input 
                                    type="number" 
                                    {...registerOrder("delivery_fee", { required: true, valueAsNumber: true })} 
                                    className="w-full bg-neutral-950 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:border-white focus:outline-none"
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-xs text-neutral-400">Total to Collect</label>
                                <div className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-500 cursor-not-allowed">
                                    {offer.client_offer_total} + Fee
                                </div>
                             </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-neutral-400">Confirm Address</label>
                            <input 
                                type="text" 
                                {...registerOrder("delivery_address")} 
                                defaultValue={offer.client.address}
                                className="w-full bg-neutral-950 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:border-white focus:outline-none"
                            />
                        </div>
                        <button disabled={isOrdering} type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors">
                            {isOrdering ? 'Processing Order...' : 'Confirm & Create Order'}
                        </button>
                    </div>
                </form>
            )}

            {/* --- Bottom Bar: Financials & Primary Actions --- */}
            <div className="mt-auto bg-neutral-950 p-4 border-t border-neutral-800 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Platform Margin</span>
                    <span className="text-emerald-400 font-mono font-medium flex items-center">
                         +{offer.platform_margin} MAD
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleReject} 
                        className="p-3 rounded-lg border border-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-900 transition-all"
                        title="Reject Offer"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                    
                    {activeTab !== 'process' ? (
                        <button 
                            onClick={() => setActiveTab('process')} 
                            className="bg-white text-black px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Accept & Process
                        </button>
                    ) : (
                        <button 
                            onClick={() => setActiveTab('none')} 
                            className="bg-neutral-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function AdminPage() {
    const [offerDetails, setOfferDetails] = useState<OfferDetail[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        setLoading(true);
        try {
            const offerRes: any = await axios.get('http://192.168.1.110:8000/sales/offers');
            const offers: Offer[] = offerRes.data.filter((offer: Offer) => offer.status === 'pending');
            
            // Note: In a real production app, try to fetch these in parallel or use a backend "include" query 
            // to avoid the N+1 problem. Keeping logic as is for now.
            const details: OfferDetail[] = [];
            for (let offer of offers) {
                const itemRes: any = await axios.get(`http://192.168.1.110:8000/inventory/item/${offer.item}/`);
                const item: Item = itemRes.data;
                const maalemRes: any = await axios.get(`http://192.168.1.110:8000/users/maalem/${item.maalem}/`);
                const maalem: Maalem = maalemRes.data;
                const clientRes: any = await axios.get(`http://192.168.1.110:8000/users/client/${offer.client}/`);
                const client = clientRes.data;
                
                details.push({ 
                    offer_id: offer.offer_id, 
                    offer_quantity: offer.offer_quantity, 
                    maalem_net_offer: offer.maalem_net_offer, 
                    platform_margin: offer.platform_margin, 
                    client_offer_total: offer.client_offer_total, 
                    date: offer.date, 
                    status: offer.status, 
                    item: { item_id: item.item_id, title: item.title, category: item.category, photoUrl: item.photoUrl, stockQuantity: item.stockQuantity }, 
                    maalem: { id_maalem: maalem.id_maalem, firstname: maalem.firstname, lastname: maalem.lastname, phoneNumber: maalem.phoneNumber, rating: maalem.rating, address: maalem.address }, 
                    client: { id_client: client.client_id, firstname: client.firstname, lastname: client.lastname, phoneNumber: client.phoneNumber, address: client.address } 
                });
            }
            setOfferDetails(details);
        } catch (err: any) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen mt-24 bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
            {/* --- Header --- */}
            <div className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
                <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-serif font-medium tracking-tight">Admin Operations</h1>
                        <span className="bg-neutral-800 text-neutral-400 text-xs px-2 py-1 rounded-full border border-neutral-700">
                            {offerDetails.length} Pending
                        </span>
                    </div>
                    <button 
                        onClick={fetchData} 
                        disabled={loading}
                        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Sync Data
                    </button>
                </div>
            </div>

            {/* --- Content Grid --- */}
            <main className="max-w-[1600px] mx-auto px-6 py-8">
                {loading && offerDetails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-neutral-500">
                        <RefreshCw className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                        <p>Syncing pending offers...</p>
                    </div>
                ) : offerDetails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-neutral-500 border border-dashed border-neutral-800 rounded-3xl bg-neutral-900/50">
                        <CheckCircle2 className="w-12 h-12 mb-4 opacity-20" />
                        <h2 className="text-xl font-medium text-white">All Clear</h2>
                        <p>No pending offers to review.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {offerDetails.map((offer) => (
                            <OfferManagementCard 
                                key={offer.offer_id} 
                                offer={offer} 
                                refreshData={fetchData} 
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}