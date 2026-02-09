'use client'

import { useUser } from "@/app/context/UserContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { 
    Bell, 
    BellOff, 
    Loader2, 
    Inbox 
} from "lucide-react";

export default function NotificationsPage() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!user.id) return setNotifications([]);
        setLoading(true);
        console.log('Fetching notifications for user:', user.id, 'of type', user.type);
        try{
            const url = user.type === 'client' ? `http://192.168.1.110:8000/notify/client-notifications/${user.id}` :  user.type === 'maalem' ? `http://192.168.1.110:8000/notify/maalem-notifications/${user.id}` : '';  
            const res = await axios.get(url);
            setNotifications(res.data || []);
            for (const n of res.data) {
                const resPatch = await axios.patch(`http://192.168.1.110:8000/notify/notifications/${n.notification_id}/update-delete/`, { is_read: true });
            }
        }catch(err: any){
            console.log('Error fetching notifications:', err?.response?.data ?? err.message ?? err);
            setNotifications([]);
            
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        fetchNotifications();
    }, [user]);

    // --- Loading State ---
    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-neutral-500 font-medium text-sm">Syncing updates...</p>
            </div>
        );
    }

    // --- Main Render ---
    return (
        <div className="min-h-screen mt-12 bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
            <div className="max-w-2xl mx-auto px-6 py-12">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-serif font-medium text-white mb-1">
                            Inbox
                        </h1>
                        <p className="text-neutral-500 text-sm">
                            Recent updates and alerts.
                        </p>
                    </div>
                    <div className="p-3 bg-neutral-900 rounded-full border border-neutral-800 text-neutral-400">
                        <Inbox className="w-5 h-5" />
                    </div>
                </div>

                {/* Content */}
                {notifications.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-neutral-800 rounded-3xl bg-neutral-900/20">
                        <BellOff className="w-12 h-12 mb-4 text-neutral-600 opacity-50" />
                        <h3 className="text-lg font-medium text-white mb-1">All caught up</h3>
                        <p className="text-neutral-500 text-sm">You have no new notifications at this time.</p>
                    </div>
                ) : (
                    // Notification List
                    <ul className="space-y-4">
                        {notifications.map((n: any, i: number) => (
                            <li 
                                key={n.id ?? i} 
                                className="group relative bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 p-5 rounded-2xl hover:bg-neutral-900 hover:border-neutral-700 transition-all duration-300"
                            >
                                <div className="flex gap-4 items-start">
                                    {/* Icon */}
                                    <div className="mt-1 flex-shrink-0 p-2 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        <Bell className="w-4 h-4" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-white font-medium text-sm group-hover:text-indigo-200 transition-colors">
                                                {n.title ?? n.head ?? 'Notification'}
                                            </h3>
                                            {/* Optional: If data had a timestamp, it would go here. 
                                                Using a dot to indicate unread status visually if needed. */}
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-neutral-400 text-sm leading-relaxed">
                                            {n.message ?? n.body ?? JSON.stringify(n)}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}