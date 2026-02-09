'use client'

import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, 
  ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar
} from 'recharts';
import { 
  LayoutDashboard, Users, Package, TrendingUp, DollarSign, 
  RefreshCw, Filter, ArrowUpRight, ArrowDownRight, Briefcase, BarChart3,
  PieChart as PieChartIcon, Activity, Calendar, Clock,
  CreditCard, TrendingDown, ShoppingBag, Target, UserCheck, Loader2, AlertTriangle
} from "lucide-react";

// --- Types ---
interface Offer { offer_id: number; offer_quantity: number; maalem_net_offer: number; client_offer_total: number; platform_margin: number; status: 'pending' | 'accepted' | 'rejected'; date: string; client: number; item: number; }
interface Item { item_id: number; maalem: number; title: string; description: string; category: string; photoUrl: string; maalemAskPrice: number; minSellPrice: number; platformFeePercentage: number; stockQuantity: number; }
interface Maalem { id_maalem: number; firstname: string; lastname: string; address: string; rating: number; is_managed_by_admin: boolean; phoneNumber: string; }
interface Client { client_id: number; firstname: string; lastname: string; date_joined: string; address: string; phoneNumber: string; }

// UPDATED INTERFACE: Added order_id as a possible fallback key
interface Order { 
    id?: number; 
    order_id?: number; // fallback
    pk?: number; // fallback
    order_quantity: number; platform_margin: number; maalem_net: number; delivery_fee: number; final_price: number; final_paid: number; order_date: string; pickup_address: string; delivery_address: string; pickup_time: string | null; delivery_time: string | null; status: 'pickedUp' | 'delivered' | 'cash_collected' | 'maalem_paid' | 'returned'; offer: number; 
}

const STATUS_CHOICES = [
    { value: 'pickedUp', label: 'Picked Up', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'delivered', label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { value: 'cash_collected', label: 'Cash Collected', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { value: 'maalem_paid', label: 'Maalem Paid', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { value: 'returned', label: 'Returned', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16'];
const CHART_COLORS = {
  primary: '#6366f1', success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
  purple: '#8b5cf6', cyan: '#06b6d4', pink: '#ec4899', lime: '#84cc16'
};

// --- Components (Kept same for brevity) ---
const KPICard = ({ title, value, sub, icon: Icon, trend, trendLabel }: any) => (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 backdrop-blur-sm border border-neutral-800 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl group-hover:from-indigo-500/20 group-hover:to-indigo-600/20 group-hover:text-indigo-400 transition-all duration-300">
                <Icon className="w-6 h-6" />
            </div>
            {trend !== undefined && (
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider relative z-10">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1 relative z-10">{value}</p>
        <p className="text-neutral-500 text-xs mt-2 relative z-10">{sub}</p>
    </div>
);

const StatBadge = ({ value, label, icon: Icon, color }: any) => (
    <div className="flex items-center gap-3 p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors">
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
        <div><div className="text-lg font-bold text-white">{value}</div><div className="text-xs text-neutral-500">{label}</div></div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg shadow-xl backdrop-blur-sm z-50">
                <p className="text-sm font-semibold text-white mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function OrdersPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [maalems, setMaalems] = useState<Maalem[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('all');
    const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

    // --- Data Fetching ---
    const fetchData = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const [clientsRes, maalemsRes, itemsRes, offersRes, ordersRes] = await Promise.all([
                axios.get('http://192.168.1.110:8000/users/client/'),
                axios.get('http://192.168.1.110:8000/users/maalem/'),
                axios.get('http://192.168.1.110:8000/inventory/item/'),
                axios.get('http://192.168.1.110:8000/sales/offers/'),
                axios.get('http://192.168.1.110:8000/sales/orders/')
            ]);
            setClients(clientsRes.data);
            setMaalems(maalemsRes.data);
            setItems(itemsRes.data);
            setOffers(offersRes.data);
            
            if (!updatingOrder) {
                // DEBUG: Log the first order to see if it has 'id', 'pk', or 'order_id'
                if(ordersRes.data.length > 0) {
                    console.log("DEBUG: First order structure:", ordersRes.data[0]); 
                }
                setOrders(ordersRes.data);
            }
        } catch (err: any) {
            console.error('Error fetching data:', err);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 30000); 
        return () => clearInterval(interval);
    }, [updatingOrder]);

    // --- CRITICAL FIX: Order Logic with Verbose Debugging ---
    const handleStatusChange = async (orderId: number, newStatus: string) => {
        console.log("-----------------------------------------");
        console.log("1. Event Triggered.");
        console.log("   ID Received:", orderId);
        console.log("   Status To Set:", newStatus);

        if (!orderId) {
            console.error("❌ CRITICAL ERROR: The Order ID is undefined or 0.");
            alert("System Error: Order ID is missing. Check the console for the 'First order structure' log to see what the correct ID field name is.");
            return;
        }
        
        setUpdatingOrder(orderId);
        const originalOrders = [...orders];

        // 2. Optimistic Update
        console.log("2. Applying Optimistic Update...");
        setOrders(prev => prev.map(o => {
            // Check against id, pk, or order_id
            const currentId = o.id || o.order_id || o.pk;
            return currentId === orderId ? { ...o, status: newStatus as any } : o;
        }));

        try {
            console.log(`3. Sending Patch Request to: http://192.168.1.110:8000/sales/orders/${orderId}/`);
            
            const res = await axios.patch(`http://192.168.1.110:8000/sales/orders/${orderId}/`, { 
                status: newStatus 
            });

            console.log("✅ 4. Success! Server Response:", res.data);
            
            // Sync with server response
            setOrders(prev => prev.map(o => {
                const currentId = o.id || o.order_id || o.pk;
                return currentId === orderId ? res.data : o;
            }));
            
        } catch (err: any) {
            console.error('❌ 5. API Error:', err);
            if (err.response) {
                console.error("   Status:", err.response.status);
                console.error("   Data:", err.response.data);
                alert(`Update Failed: ${JSON.stringify(err.response.data)}`);
            } else {
                alert(`Update Failed: ${err.message}`);
            }
            
            // Rollback
            console.log("6. Rolling back UI...");
            setOrders(originalOrders);
        } finally {
            setUpdatingOrder(null);
            console.log("-----------------------------------------");
        }
    };

    // --- Analytics Computation ---
    const analytics = useMemo(() => {
        if (loading || orders.length === 0) return null;

        const now = new Date();
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.order_date);
            switch (timeRange) {
                case 'today': return orderDate.toDateString() === now.toDateString();
                case 'week': 
                    const weekAgo = new Date(now); 
                    weekAgo.setDate(now.getDate() - 7); 
                    return orderDate >= weekAgo;
                case 'month': 
                    const monthAgo = new Date(now); 
                    monthAgo.setMonth(now.getMonth() - 1); 
                    return orderDate >= monthAgo;
                default: return true;
            }
        });

        const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.final_price), 0);
        const platformProfit = filteredOrders.reduce((sum, o) => sum + Number(o.platform_margin), 0);
        const totalDeliveryFees = filteredOrders.reduce((sum, o) => sum + Number(o.delivery_fee || 0), 0);
        const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

        const statusCount: Record<string, number> = {};
        filteredOrders.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1 });
        const statusData = Object.keys(statusCount).map(key => ({ 
            name: key.replace('_', ' '), 
            value: statusCount[key],
            color: STATUS_CHOICES.find(s => s.value === key)?.color.split(' ')[2] || CHART_COLORS.primary
        }));

        const offersStatusCount = { pending: 0, accepted: 0, rejected: 0 };
        offers.forEach(offer => { if (offer.status in offersStatusCount) offersStatusCount[offer.status] += 1; });
        const offersData = [
            { name: 'Accepted', value: offersStatusCount.accepted, fill: CHART_COLORS.success },
            { name: 'Pending', value: offersStatusCount.pending, fill: CHART_COLORS.warning },
            { name: 'Rejected', value: offersStatusCount.rejected, fill: CHART_COLORS.danger }
        ];

        const categoryCount: Record<string, number> = {};
        const categoryRevenue: Record<string, number> = {};
        offers.filter(o => o.status === 'accepted').forEach(offer => {
            const item = items.find(i => i.item_id === offer.item);
            if (item) {
                categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
                categoryRevenue[item.category] = (categoryRevenue[item.category] || 0) + Number(offer.client_offer_total);
            }
        });
        const categoryData = Object.keys(categoryCount).map(key => ({ 
            name: key, value: categoryCount[key], revenue: categoryRevenue[key]
        }));

        const maalemStats = maalems.map(m => {
            const maalemItems = items.filter(i => i.maalem === m.id_maalem).map(i => i.item_id);
            const maalemOffers = offers.filter(o => maalemItems.includes(o.item) && o.status === 'accepted');
            const totalSales = maalemOffers.reduce((sum, o) => sum + Number(o.client_offer_total), 0);
            const completedOrders = filteredOrders.filter(o => {
                const offer = offers.find(of => of.offer_id === o.offer);
                return offer && maalemItems.includes(offer.item);
            }).length;
            return {
                name: `${m.firstname} ${m.lastname}`, rating: m.rating, sales: totalSales, orders: completedOrders,
                efficiency: maalemItems.length > 0 ? (completedOrders / maalemItems.length) * 100 : 0
            };
        }).filter(m => m.sales > 0);

        const dailyRevenue: Record<string, number> = {};
        filteredOrders.forEach(order => {
            const date = new Date(order.order_date).toLocaleDateString();
            dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(order.final_price);
        });
        const revenueTrendData = Object.keys(dailyRevenue).map(date => ({
            date, revenue: dailyRevenue[date],
            orders: filteredOrders.filter(o => new Date(o.order_date).toLocaleDateString() === date).length
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-15);

        const clientOrders: Record<number, number> = {};
        filteredOrders.forEach(order => {
            const offer = offers.find(o => o.offer_id === order.offer);
            if (offer) clientOrders[offer.client] = (clientOrders[offer.client] || 0) + 1;
        });
        const topClients = Object.entries(clientOrders).map(([clientId, count]) => {
            const client = clients.find(c => c.client_id === Number(clientId));
            return { name: client ? `${client.firstname} ${client.lastname}` : `Client ${clientId}`, orders: count };
        }).sort((a, b) => b.orders - a.orders).slice(0, 8);

        const conversionRate = offers.length > 0 ? (offersStatusCount.accepted / offers.length) * 100 : 0;
        const avgPlatformMargin = filteredOrders.length > 0 ? platformProfit / filteredOrders.length : 0;
        const returnRate = filteredOrders.length > 0 ? ((statusCount.returned || 0) / filteredOrders.length) * 100 : 0;

        const deliveryTimes = filteredOrders.filter(o => o.delivery_time && o.pickup_time).map(o => {
            return (new Date(o.delivery_time!).getTime() - new Date(o.pickup_time!).getTime()) / (1000 * 60 * 60);
        });
        const avgDeliveryTime = deliveryTimes.length > 0 ? deliveryTimes.reduce((a, b) => a + b) / deliveryTimes.length : 0;

        return { 
            totalRevenue, platformProfit, totalDeliveryFees, avgOrderValue, statusData, offersData, categoryData, 
            maalemStats, revenueTrendData, topClients, conversionRate, avgPlatformMargin, returnRate, 
            avgDeliveryTime, filteredOrders
        };
    }, [orders, offers, items, maalems, clients, loading, timeRange]);

    const enrichedOrders = useMemo(() => {
        return orders.map(order => {
            const offer = offers.find(o => o.offer_id === order.offer);
            const item = offer ? items.find(i => i.item_id === offer.item) : null;
            const client = offer ? clients.find(c => c.client_id === offer.client) : null;
            const maalem = item ? maalems.find(m => m.id_maalem === item.maalem) : null;
            return { ...order, item, client, maalem };
        }).sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
    }, [orders, offers, items, clients, maalems]);

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <span className="text-neutral-500 font-medium animate-pulse">Loading Intelligence Dashboard...</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen mt-24 bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 text-neutral-100 font-sans p-6 md:p-8">
            <div className="max-w-[2000px] mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-xl">
                                <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                                Atelier Command Center
                            </h1>
                        </div>
                        <p className="text-neutral-500 text-sm md:text-base">Real-time financial analysis and logistics management</p>
                    </div>
                    <div className="flex items-center gap-3">
                         <button onClick={() => fetchData()} className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:text-white transition-colors">
                            <RefreshCw className="w-5 h-5" />
                         </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-emerald-500">System Live</span>
                        </div>
                    </div>
                </div>

                {/* Time Range */}
                <div className="flex gap-2">
                    {['today', 'week', 'month', 'all'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                timeRange === range ? 'bg-indigo-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'
                            }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard title="Total Revenue" value={`${analytics?.totalRevenue.toLocaleString()} MAD`} sub="GMV" icon={DollarSign} trend={12.5} />
                    <KPICard title="Platform Profit" value={`${analytics?.platformProfit.toLocaleString()} MAD`} sub="Net Margin" icon={TrendingUp} trend={8.2} />
                    <KPICard title="Active Maalems" value={maalems.length} sub="Partners" icon={Briefcase} trend={5.7} />
                    <KPICard title="Conversion Rate" value={`${analytics?.conversionRate.toFixed(1)}%`} sub="Offer Acceptance" icon={TrendingDown} trend={2.3} />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-500" /> Revenue Trend
                            </h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics?.revenueTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                                    <XAxis dataKey="date" stroke="#525252" fontSize={12} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', {day:'numeric', month:'short'})} />
                                    <YAxis stroke="#525252" fontSize={12} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{r:4}} />
                                    <Line type="monotone" dataKey="orders" name="Orders" stroke={CHART_COLORS.success} strokeWidth={2} dot={{r:4}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-emerald-500" /> Offers Status
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart innerRadius="20%" outerRadius="90%" data={analytics?.offersData} startAngle={180} endAngle={0}>
                                    <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background dataKey="value" cornerRadius={10}>
                                        {analytics?.offersData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </RadialBar>
                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-neutral-800">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <LayoutDashboard className="w-6 h-6 text-indigo-500" /> Order Management Registry
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-950 text-neutral-200 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4 text-left">Order ID</th>
                                    <th className="px-6 py-4 text-left">Item Details</th>
                                    <th className="px-6 py-4 text-left">Parties</th>
                                    <th className="px-6 py-4 text-left">Financials</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {enrichedOrders.slice(0, 10).map((order) => {
                                    // SAFELY DETERMINE ID: Check for 'id', then 'order_id', then 'pk'
                                    const safeId = order.id || order.order_id || order.pk;

                                    return (
                                    <tr key={safeId || Math.random()} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm font-bold text-white">
                                                #{safeId ? safeId.toString().padStart(6, '0') : <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> MISSING ID</span>}
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(order.order_date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {order.item?.photoUrl && <img src={order.item.photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover bg-neutral-800" />}
                                                <div>
                                                    <div className="text-white font-medium truncate max-w-[150px]">{order.item?.title || "Unknown"}</div>
                                                    <div className="text-xs text-neutral-500">Qty: {order.order_quantity}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-xs text-neutral-400">Client: <span className="text-white">{order.client?.firstname} {order.client?.lastname}</span></div>
                                                <div className="text-xs text-neutral-400">Maalem: <span className="text-white">{order.maalem?.firstname} {order.maalem?.lastname}</span></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-white">{order.final_price} MAD</div>
                                            <div className="text-xs text-emerald-500">+{order.platform_margin} Margin</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => {
                                                        console.log("Input changed!", e.target.value);
                                                        if (safeId) {
                                                            handleStatusChange(safeId, e.target.value);
                                                        } else {
                                                            alert("Cannot update: This order is missing an ID.");
                                                        }
                                                    }}
                                                    disabled={updatingOrder === safeId || !safeId}
                                                    className={`appearance-none w-full px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-all ${
                                                        updatingOrder === safeId ? 'opacity-50 cursor-wait' : ''
                                                    } ${STATUS_CHOICES.find(s => s.value === order.status)?.color || 'bg-neutral-800 text-white border-neutral-700'}`}
                                                >
                                                    {STATUS_CHOICES.map((choice) => (
                                                        <option key={choice.value} value={choice.value} className="bg-neutral-900 text-neutral-300">
                                                            {choice.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    {updatingOrder === safeId ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 opacity-60" />}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}