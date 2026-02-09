'use client'

import { useUser } from "@/app/context/UserContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { extractErrorMessage } from "@/app/services/error";
import { 
  PlusCircle, 
  Upload, 
  Package, 
  Tag, 
  DollarSign, 
  Hash, 
  Image as ImageIcon,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles
} from "lucide-react";
import Link from "next/link";

interface FormData {
    title: string;
    description: string;
    category: string;
    photoUrl: string;
    maalemAskPrice: number;
    minSellPrice: number;
    stockQuantity: number;
}

interface AlertState { 
    show: boolean; 
    message: string; 
    type: 'success' | 'error'; 
}

export default function NewMaalemProductPage() {
    const { user } = useUser();
    const router = useRouter();
    const [alert, setAlert] = useState<AlertState>({ show: false, message: '', type: 'success' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

    useEffect(() => {
        if (user?.type !== 'maalem') {
            router.push('/products');
            return;
        }
    }, [user, router]);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setAlert({ show: false, message: '', type: 'success' });

        try {
            const payload = { ...data, maalem: user.id };
            console.log('maalem id is ', user.id)
            await axios.post('http://192.168.1.110:8000/inventory/item/post/', payload);
            
            setAlert({ show: true, message: 'Masterpiece created successfully!', type: 'success' });
            
            setTimeout(() => {
                router.push('/maalem/products');
            }, 1500);
            
        } catch (err: any) {
            const message = extractErrorMessage(err);
            setAlert({ show: true, message: message || 'Failed to create product', type: 'error' });
            console.log('error happened', err.response.data);
        } finally {
            setIsSubmitting(false);
        }
    };

    const InputField = ({ 
        icon: Icon, 
        label, 
        name, 
        type = "text", 
        placeholder,
        rules,
        className = ""
    }: { 
        icon: any, 
        label: string, 
        name: keyof FormData, 
        type?: string, 
        placeholder: string,
        rules: object,
        className?: string 
    }) => (
        <div className={`space-y-2 ${className}`}>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Icon className="w-3 h-3" />
                {label}
            </label>
            {type === 'textarea' ? (
                <textarea
                    className="w-full min-h-[120px] bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all"
                    placeholder={placeholder}
                    {...register(name, rules)}
                />
            ) : (
                <input
                    type={type}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    placeholder={placeholder}
                    {...register(name, { 
                        required: `${label} is required`,
                        ...(type === 'number' ? { 
                            valueAsNumber: true,
                            min: { value: 0, message: 'Value must be positive' }
                        } : {}),
                        ...rules
                    })}
                />
            )}
            {errors[name] && (
                <span className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[name]?.message}
                </span>
            )}
        </div>
    );

    return (
        <div className="min-h-screen mt-24 bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30 py-12 px-6">
            
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-6xl mx-auto">
                
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <Link 
                            href="/maalem/products"
                            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group mb-2"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Back to Inventory</span>
                        </Link>
                        <h1 className="text-3xl font-serif font-medium text-white">
                            New Masterpiece
                        </h1>
                        <p className="text-neutral-500 text-sm mt-2">
                            Add a new creation to your portfolio
                        </p>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-3 text-indigo-400">
                        <Sparkles className="w-6 h-6" />
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-3xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        
                        {/* Section 1: Basic Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                                <Package className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-medium text-white">Basic Information</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <InputField 
                                    icon={Tag}
                                    label="Title"
                                    name="title"
                                    placeholder="E.g., Handwoven Berber Rug"
                                    rules={{ required: true }}
                                />
                                
                                <InputField 
                                    icon={Tag}
                                    label="Category"
                                    name="category"
                                    placeholder="E.g., Textiles, Pottery, Jewelry"
                                    rules={{ required: true }}
                                />
                            </div>

                            <InputField 
                                icon={Package}
                                label="Description"
                                name="description"
                                type="textarea"
                                placeholder="Describe your masterpiece in detail..."
                                rules={{ required: true, minLength: { value: 20, message: 'Minimum 20 characters' } }}
                            />
                        </div>

                        {/* Section 2: Visual Identity */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                                <ImageIcon className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-medium text-white">Visual Identity</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <InputField 
                                    icon={Upload}
                                    label="Photo URL"
                                    name="photoUrl"
                                    placeholder="https://example.com/image.jpg"
                                    rules={{ 
                                        required: true,
                                        pattern: {
                                            value: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i,
                                            message: 'Please enter a valid image URL'
                                        }
                                    }}
                                />
                                
                                {/* <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                                        <ImageIcon className="w-3 h-3" />
                                        Preview
                                    </label>
                                    <div className="w-full aspect-video bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center overflow-hidden">
                                        <div className="text-center text-neutral-600">
                                            <div className="mx-auto mb-2 w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm">Image preview</p>
                                            <p className="text-xs">Appears when URL is valid</p>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>

                        {/* Section 3: Pricing & Inventory */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                                <DollarSign className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-medium text-white">Pricing & Inventory</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <InputField 
                                    icon={DollarSign}
                                    label="Ask Price (MAD)"
                                    name="maalemAskPrice"
                                    type="number"
                                    placeholder="0"
                                    rules={{ 
                                        required: true,
                                        min: { value: 1, message: 'Must be at least 1 MAD' }
                                    }}
                                />
                                
                                <InputField 
                                    icon={DollarSign}
                                    label="Minimum Sell Price (MAD)"
                                    name="minSellPrice"
                                    type="number"
                                    placeholder="0"
                                    rules={{ 
                                        required: true,
                                        min: { value: 1, message: 'Must be at least 1 MAD' },
                                        validate: (value: any, formValues: any) => 
                                            value <= formValues.maalemAskPrice || 
                                            'Min price cannot exceed ask price'
                                    }}
                                />
                                
                                <InputField 
                                    icon={Hash}
                                    label="Stock Quantity"
                                    name="stockQuantity"
                                    type="number"
                                    placeholder="0"
                                    rules={{ 
                                        required: true,
                                        min: { value: 1, message: 'Must be at least 1' }
                                    }}
                                />
                            </div>

                            <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-4">
                                <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                    Pricing Guidelines
                                </h3>
                                <ul className="text-xs text-neutral-500 space-y-1 list-disc pl-5">
                                    <li>Ask Price is what clients will see first</li>
                                    <li>Minimum Sell Price is your lowest acceptable offer</li>
                                    <li>Platform fee will be added on top of your ask price</li>
                                    <li>Stock quantity can be updated later</li>
                                </ul>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-8 border-t border-neutral-800 flex flex-col-reverse md:flex-row items-center gap-4 justify-between">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full md:w-auto px-6 py-3 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all duration-300 font-medium"
                            >
                                Cancel
                            </button>
                            
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                                    isSubmitting 
                                    ? "bg-neutral-800 text-neutral-400 cursor-wait" 
                                    : "bg-white text-black hover:bg-neutral-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Create Masterpiece</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Toast Notification */}
            {alert.show && (
                <div className="fixed bottom-8 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 z-50">
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