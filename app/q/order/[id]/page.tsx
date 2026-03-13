"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ClipboardList, Loader2, PackageX, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function ResolverOrderPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const resolveOrder = async () => {
            try {
                // 1. Check Authentication
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push(`/login?next=/q/order/${id}`);
                    return;
                }

                // 2. Validate Order Format
                const orderId = String(id).toUpperCase().replace("#", "");
                
                // For now, in this client-side architecture, we just redirect to the existing pedido page
                // which handles searching in local storage/db.
                router.push(`/pedido/${orderId}`);
            } catch (err) {
                console.error("Resolver error:", err);
                setError("Ocorreu um erro ao processar o pedido.");
                setLoading(false);
            }
        };

        resolveOrder();
    }, [id, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-6 font-sans">
                <div className="relative">
                    <div className="size-20 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                    <ClipboardList className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-brand-primary" />
                </div>
                <h1 className="mt-8 text-xl font-black text-white tracking-tight">Localizando Pedido...</h1>
                <p className="mt-2 text-brand-muted text-sm">{id}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-6 text-center">
                <div className="size-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6">
                    <PackageX className="size-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Pedido não encontrado</h1>
                <p className="text-brand-muted max-w-xs mb-8">{error}</p>
                <Link 
                    href="/dashboard"
                    className="bg-brand-bg border border-brand-darkBorder text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/5 transition-all"
                >
                    <LayoutDashboard className="size-4" /> Voltar ao Painel
                </Link>
            </div>
        );
    }

    return null;
}
