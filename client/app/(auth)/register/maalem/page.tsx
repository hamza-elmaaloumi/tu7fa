'use client'

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { extractErrorMessage } from "@/app/services/error";
import { 
  Hammer, 
  MapPin, 
  Phone, 
  UserPlus, 
  Loader2, 
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Building2
} from "lucide-react";
import Link from "next/link";

interface FormData {
  firstname: string;
  lastname: string;
  address: string;
  phoneNumber: string;
}

interface AlertState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function RegisterMaalemPage() {
  const router = useRouter();
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false, message: '', type: 'success' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAlert({ show: false, message: '', type: 'success' });

    try {
      await axios.post('http://192.168.1.110:8000/users/maalem/post/', data);
      
      setAlert({ show: true, message: 'Maalem onboarded successfully.', type: 'success' });
      reset(); // Only reset if successful to prevent data loss on error
      
      setTimeout(() => {
        // Redirect to the login page or the admin dashboard
        router.push('/login/maalem');
      }, 2000);

    } catch (err: any) {
      const message = extractErrorMessage(err);
      setAlert({ show: true, message: message || "Onboarding failed", type: 'error' });
      setFocus('firstname');
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable Input Component
  const InputField = ({ 
    icon: Icon, 
    placeholder, 
    name, 
    rules, 
    label,
    type = "text",
    className = ""
  }: { 
    icon: any, 
    placeholder: string, 
    name: keyof FormData, 
    rules: object, 
    label: string,
    type?: string,
    className?: string 
  }) => (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className={`group relative flex items-center transition-all duration-300 border rounded-xl bg-neutral-950 ${errors[name] ? 'border-red-500/50' : 'border-neutral-800 focus-within:border-amber-500/50 focus-within:ring-4 focus-within:ring-amber-500/10'}`}>
        <div className="pl-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <input
          type={type}
          className="w-full h-12 px-4 bg-transparent text-white placeholder-neutral-600 focus:outline-none text-sm font-medium"
          placeholder={placeholder}
          {...register(name, rules)}
        />
      </div>
      {errors[name] && (
        <span className="text-[10px] text-red-400 pl-1 block animate-in slide-in-from-top-1">
          {errors[name]?.message}
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-6 text-neutral-100 font-sans selection:bg-amber-500/30">
      
      {/* Background Ambience (Amber/Gold for Maalem Context) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-orange-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[500px] relative z-10">
        
        {/* Card */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Internal Admin Use Only</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-500">
                    <Hammer className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-serif font-medium text-white tracking-tight">
                    Onboard Maalem
                    </h1>
                    <p className="text-neutral-500 text-sm">
                    Register a new master artisan into the system.
                    </p>
                </div>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField 
                icon={Building2} 
                name="firstname" 
                label="First Name"
                placeholder="Ex. Ahmed" 
                rules={{ required: "First name is required" }} 
              />
              <InputField 
                icon={Building2} 
                name="lastname" 
                label="Last Name"
                placeholder="Ex. Benali" 
                rules={{ required: "Last name is required" }} 
              />
            </div>

            {/* Address */}
            <InputField 
              icon={MapPin} 
              name="address" 
              label="Workshop Address"
              placeholder="Ex. 12 Rue de la Médina, Fes" 
              rules={{ required: "Address is required" }} 
            />

            {/* Phone */}
            <InputField 
              icon={Phone} 
              name="phoneNumber" 
              label="Contact Number"
              placeholder="+212 6XX XXX XXX" 
              rules={{ 
                required: "Phone number is required",
                pattern: {
                  value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                  message: "Invalid phone format"
                }
              }} 
            />

            <div className="pt-4">
                <button
                type="submit"
                disabled={isLoading}
                className={`w-full h-14 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                    isLoading 
                    ? "bg-neutral-800 text-neutral-500 cursor-wait" 
                    : "bg-white text-black hover:bg-amber-50 hover:border-amber-200 hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-900/20"
                }`}
                >
                {isLoading ? (
                    <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                    </>
                ) : (
                    <>
                    <UserPlus className="w-5 h-5" />
                    <span>Register Artisan</span>
                    </>
                )}
                </button>
            </div>
          </form>
        </div>

        {/* Toast Notification */}
        {alert.show && (
          <div className="absolute -bottom-20 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`px-5 py-3 rounded-full border shadow-2xl backdrop-blur-md flex items-center gap-3 text-sm font-medium ${
              alert.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-950/80 border-red-500/30 text-red-400'
            }`}>
              {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {alert.message}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}