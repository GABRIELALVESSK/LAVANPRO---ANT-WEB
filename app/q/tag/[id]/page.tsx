"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Tag, Loader2, PackageX, LogIn, ChevronRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function ResolverTagPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tagInfo, setTagInfo] = useState<any>(null);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        const resolveTag = async () => {
            try {
                // 1. Check Authentication
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push(`/login?next=/q/tag/${id}`);
                    return;
                }

                // 2. Load data from Supabase
                const { data, error: rpcError } = await supabase.rpc('get_laundry_data');
                if (rpcError || !data) {
                    setError("Erro ao carregar banco de dados de etiquetas.");
                    setLoading(false);
                    return;
                }

                const labels = data.labels || [];
                const tagCode = String(id).toUpperCase();
                
                // Fuzzy match (TAG-001 vs 1 vs TAG1)
                const tagNumMatch = tagCode.match(/\d+/);
                const tagNum = tagNumMatch ? parseInt(tagNumMatch[0]) : null;

                const foundLabel = labels.find((l: any) => 
                    l.code === tagCode || 
                    l.code === `TAG-${String(tagNum).padStart(3, "0")}` ||
                    (tagNum !== null && l.displayNumber === tagNum)
                );

                if (!foundLabel) {
                    setError(`Etiqueta ${tagCode} não cadastrada no sistema.`);
                    setLoading(false);
                    return;
                }

                setTagInfo(foundLabel);

                // 3. Check for active order
                if (foundLabel.status === "assigned" && foundLabel.currentOrderId) {
                    // Redirect to order page
                    router.push(`/pedido/${foundLabel.currentOrderId.replace("#", "")}`);
                } else {
                    // Tag is available
                    setIsAvailable(true);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Resolver error:", err);
                setError("Ocorreu um erro ao processar o código.");
                setLoading(false);
            }
        };

        resolveTag();
    }, [id, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-6 font-sans">
                <div className="relative">
                    <div className="size-20 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                    <Tag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-brand-primary" />
                </div>
                <h1 className="mt-8 text-xl font-black text-white tracking-tight">Resolvendo Etiqueta...</h1>
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
                <h1 className="text-2xl font-black text-white mb-2">Ops! Código Inválido</h1>
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

    if (isAvailable) {
        return (
            <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-6 text-center">
                <div className="size-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/20">
                    <Tag className="size-10 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Etiqueta Livre</h1>
                <p className="text-brand-muted max-w-xs mb-8">
                    A tag <span className="text-white font-bold">{tagInfo?.code}</span> está disponível e não possui pedidos vinculados no momento.
                </p>
                
                <div className="grid grid-cols-1 w-full max-w-xs gap-3">
                    <button 
                        onClick={() => router.push(`/labels?tag=${tagInfo?.code}`)}
                        className="bg-brand-primary text-[#0F1115] px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-brand-primary/20"
                    >
                        Vincular a um Pedido <ChevronRight className="size-4" />
                    </button>
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="bg-brand-bg border border-brand-darkBorder text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                    >
                        Menu Principal
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
