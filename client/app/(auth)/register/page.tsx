'use client'

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { extractErrorMessage } from "@/app/services/error";
import { 
  User, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  AlertCircle,
  CheckCircle2
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

export default function RegisterPage() {
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
      await axios.post('http://192.168.1.110:8000/users/client/post/', data);
      
      setAlert({ show: true, message: 'Account created successfully!', type: 'success' });
      reset(); // Only reset on success
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      const message = extractErrorMessage(err);
      setAlert({ show: true, message: message || "Registration failed", type: 'error' });
      setFocus('firstname');
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable Input Component Helper
  const InputField = ({ 
    icon: Icon, 
    placeholder, 
    name, 
    rules, 
    type = "text",
    className = ""
  }: { 
    icon: any, 
    placeholder: string, 
    name: keyof FormData, 
    rules: object, 
    type?: string,
    className?: string 
  }) => (
    <div className={`space-y-1.5 ${className}`}>
      <div className={`group relative flex items-center transition-all duration-300 border rounded-xl bg-neutral-950 ${errors[name] ? 'border-red-500/50' : 'border-neutral-800 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10'}`}>
        <div className="pl-4 text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
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
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-6 text-neutral-100 font-sans selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[500px] relative z-10">
        
        {/* Card */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800 mb-4 border border-neutral-700 text-indigo-400">
               <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
              Join the Atelier
            </h1>
            <p className="text-neutral-500 text-sm">
              Create your client profile to access exclusive pieces.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField 
                icon={User} 
                name="firstname" 
                placeholder="First Name" 
                rules={{ required: "First name is required" }} 
              />
              <InputField 
                icon={User} 
                name="lastname" 
                placeholder="Last Name" 
                rules={{ required: "Last name is required" }} 
              />
            </div>

            {/* Address */}
            <InputField 
              icon={MapPin} 
              name="address" 
              placeholder="Delivery Address" 
              rules={{ required: "Address is required" }} 
            />

            {/* Phone */}
            <InputField 
              icon={Phone} 
              name="phoneNumber" 
              placeholder="+212 6XX XXX XXX" 
              rules={{ 
                required: "Phone number is required",
                pattern: {
                  value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                  message: "Invalid phone format"
                }
              }} 
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-14 mt-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                isLoading 
                ? "bg-neutral-800 text-neutral-500 cursor-wait" 
                : "bg-white text-black hover:bg-neutral-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
             <p className="text-sm text-neutral-500">
               Already have an account?{' '}
               <Link href="/login" className="text-white hover:text-indigo-400 font-medium transition-colors">
                 Sign in here
               </Link>
             </p>
          </div>
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