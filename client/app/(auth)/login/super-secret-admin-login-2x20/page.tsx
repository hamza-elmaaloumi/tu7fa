'use client'

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { extractErrorMessage } from "@/app/services/error";
import { useUser } from "@/app/context/UserContext";
import {
    User,
    Lock,
    ArrowRight,
    Loader2,
    ShieldCheck,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

interface FormData {
    username: string;
    password: string;
}

interface AlertState {
    show: boolean;
    message: string;
    type: 'success' | 'error';
}

export default function LoginPage() {
    const { setUser } = useUser();
    const router = useRouter();

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<AlertState>({ show: false, message: '', type: 'success' });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setAlert({ show: false, message: '', type: 'success' });

        try {
            console.log('Submitting login for:', data.username, "with password: ", data.password);
            const res = await axios.post('http://192.168.1.110:8000/users/admin-secret-path-login/', {
                username: data.username,
                password: data.password
            });
            console.log("Login response:", res.data);

            setAlert({ show: true, message: 'Authentication successful. Redirecting...', type: 'success' });
            setUser({ type: 'admin', id: res.data.admin_id });

            // Delay redirect slightly for user to see success state
            setTimeout(() => {
                router.push('/admin/offers');
            }, 1500);

        } catch (err: any) {
            const message = extractErrorMessage(err);
            setAlert({ show: true, message: message || "Login failed", type: 'error' });
            // We don't reset() here so the user can fix their typo
            console.log("Login error:", err.response.data);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-6 text-neutral-100 font-sans selection:bg-indigo-500/30">

            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-[420px] relative z-10">

                {/* Card */}
                <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl">

                    {/* Header */}
                    <div className="text-center mb-10 space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800 mb-4 border border-neutral-700 text-indigo-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-serif font-medium text-white tracking-tight">
                            Admin Access
                        </h1>
                        <p className="text-neutral-500 text-sm">
                            Secure entry for verified administrators.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">
                                Username
                            </label>
                            <div className={`group relative flex items-center transition-all duration-300 border rounded-xl bg-neutral-950 ${errors.username ? 'border-red-500/50' : 'border-neutral-800 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10'}`}>
                                <div className="pl-4 text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    autoComplete="username"
                                    className="w-full h-14 px-4 bg-transparent text-white placeholder-neutral-600 focus:outline-none text-base font-medium"
                                    placeholder="Enter your username"
                                    {...register("username", {
                                        required: "Username is required"
                                    })}
                                />
                            </div>
                            {errors.username && (
                                <div className="flex items-center gap-2 text-red-400 text-xs mt-2 ml-1 animate-in slide-in-from-top-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{errors.username.message}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">
                                Password
                            </label>
                            <div className={`group relative flex items-center transition-all duration-300 border rounded-xl bg-neutral-950 ${errors.password ? 'border-red-500/50' : 'border-neutral-800 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10'}`}>
                                <div className="pl-4 text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    autoComplete="current-password"
                                    className="w-full h-14 px-4 bg-transparent text-white placeholder-neutral-600 focus:outline-none text-base font-medium"
                                    placeholder="Enter your password"
                                    {...register("password", {
                                        required: "Password is required"
                                    })}
                                />
                            </div>
                            {errors.password && (
                                <div className="flex items-center gap-2 text-red-400 text-xs mt-2 ml-1 animate-in slide-in-from-top-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{errors.password.message}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full h-14 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${isLoading
                                ? "bg-neutral-800 text-neutral-500 cursor-wait"
                                : "bg-white text-black hover:bg-neutral-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Secure Login</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
                        <p className="text-xs text-neutral-600">
                            By logging in, you agree to our <span className="text-neutral-400 hover:text-white cursor-pointer transition-colors">Terms of Service</span>.
                        </p>
                    </div>
                </div>

                {/* Toast Notification */}
                {alert.show && (
                    <div className="absolute -bottom-20 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className={`px-4 py-3 rounded-full border shadow-2xl backdrop-blur-md flex items-center gap-3 text-sm font-medium ${alert.type === 'success'
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