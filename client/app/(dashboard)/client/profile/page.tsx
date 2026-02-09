'use client'

import { useUser } from "@/app/context/UserContext";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Save, 
  Loader2, 
  LogOut, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

// --- Types ---
interface ClientProfile {
  client_id: number;
  firstname: string;
  lastname: string;
  date_joined: string;
  address: string;
  phoneNumber: string;
}

interface FormData {
  firstname: string;
  lastname: string;
  address: string;
}

interface AlertState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

// --- Utils ---
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();

  console.log('Rendering ProfilePage for user:', user.id, 'of type', user.type);
  
  // States
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false, message: '', type: 'success' });
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  // --- Fetch Data ---
  useEffect(() => {
    if (user?.type !== 'client') {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://192.168.1.110:8000/users/client/${user.id}/`);
        setProfile(res.data);
        // Pre-fill form
        reset({
          firstname: res.data.firstname,
          lastname: res.data.lastname,
          address: res.data.address,
        });
      } catch (err) {
        console.error(err);
        setAlert({ show: true, message: 'Could not retrieve profile data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router, reset]);

  // --- Handlers ---
  const onSubmit = async (data: FormData) => {
    if (!profile) return;
    setSaving(true);
    setAlert({ show: false, message: '', type: 'success' });

    try {
      const payload = { ...profile, ...data };
      const res = await axios.put(`http://192.168.1.110:8000/users/client/update/${user?.id}/`, payload);
      
      setProfile(res.data);
      setAlert({ show: true, message: 'Profile updated successfully', type: 'success' });
      
      // Auto-hide alert
      setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
    } catch (err: any) {
      console.error(err);
      setAlert({ show: true, message: 'Update failed. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // In a real app, you might clear tokens/cookies here
    router.push('/login');
  };

  // --- Render Helpers ---
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-neutral-500 font-medium">Accessing secure profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen mt-24 w-full bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30 py-12 px-6">
      
      <div className="max-w-3xl mx-auto">
        
        {/* Header / Avatar Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 text-3xl font-serif font-bold text-white border-4 border-neutral-900">
            {profile.firstname[0]}{profile.lastname[0]}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-serif font-medium text-white">
              {profile.firstname} {profile.lastname}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 text-sm font-medium uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Client</span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            
            {/* Section: Editable Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 mb-4">
                <User className="w-5 h-5 text-neutral-500" />
                <h2 className="text-lg font-medium text-white">Personal Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">First Name</label>
                  <input
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    {...register('firstname', { required: "Required" })}
                  />
                  {errors.firstname && <span className="text-xs text-red-400 ml-1">{errors.firstname.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    {...register('lastname', { required: "Required" })}
                  />
                  {errors.lastname && <span className="text-xs text-red-400 ml-1">{errors.lastname.message}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    {...register('address', { required: "Required" })}
                  />
                </div>
                {errors.address && <span className="text-xs text-red-400 ml-1">{errors.address.message}</span>}
              </div>
            </div>

            {/* Section: Read Only */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 mb-4">
                <Lock className="w-5 h-5 text-neutral-500" />
                <h2 className="text-lg font-medium text-white">Account Security</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 opacity-75">
                  <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input
                      type="text"
                      readOnly
                      value={profile.phoneNumber}
                      className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-neutral-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2 opacity-75">
                  <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">Member Since</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input
                      type="text"
                      readOnly
                      value={formatDate(profile.date_joined)}
                      className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-neutral-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-col-reverse md:flex-row items-center gap-4 justify-between">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-neutral-500 hover:text-red-400 transition-colors px-4 py-2 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

              <button
                type="submit"
                disabled={saving}
                className={`w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                  saving 
                  ? "bg-neutral-800 text-neutral-400 cursor-wait" 
                  : "bg-white text-black hover:bg-neutral-200 hover:scale-[1.02] shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {alert.show && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className={`px-6 py-3 rounded-full border shadow-2xl backdrop-blur-md flex items-center gap-3 text-sm font-medium ${
            alert.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-950/90 border-red-500/30 text-red-400'
          }`}>
            {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {alert.message}
          </div>
        </div>
      )}

    </div>
  );
}