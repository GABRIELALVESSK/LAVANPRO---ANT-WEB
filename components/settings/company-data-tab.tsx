"use client";

import { Building2, Upload, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface CompanyFormData {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    inscricaoEstadual: string;
    email: string;
    phone: string;
    website: string;
    logo: string;
    // Address fields (integrated from Unit for single-unit users)
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    responsible?: string;
}

interface CompanyDataTabProps {
    form: CompanyFormData;
    onChange: (form: CompanyFormData) => void;
}

export function CompanyDataTab({ form, onChange }: CompanyDataTabProps) {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    const update = (field: keyof CompanyFormData, value: string) => {
        onChange({ ...form, [field]: value });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user?.id) {
            if (file.size > 2 * 1024 * 1024) {
                alert("O arquivo é muito grande! Máximo 2MB.");
                return;
            }

            try {
                setIsUploading(true);
                
                // Upload to Supabase Storage in 'company' bucket
                const fileExt = file.name.split('.').pop();
                const fileName = `logo_${user.id}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('company_assets')
                    .upload(filePath, file, { 
                        cacheControl: '3600',
                        upsert: true 
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('company_assets')
                    .getPublicUrl(filePath);
                
                // Use the URL with a tiny cache buster just in case
                update("logo", `${publicUrl}?t=${Date.now()}`);
            } catch (err: any) {
                console.error("Logo upload error:", err);
                alert("Erro ao enviar logo: " + (err.message || "Tente novamente"));
            } finally {
                setIsUploading(false);
            }
        }
    };

    const formatCNPJ = (value: string) => {
        const x = value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
        if (!x) return value;
        return !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '/' + x[4] + (x[5] ? '-' + x[5] : '');
    };

    const formatPhone = (value: string) => {
        const x = value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        if (!x) return value;
        return !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                    <Building2 className="size-7" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-brand-text">Dados da Empresa</h3>
                    <p className="text-sm text-brand-muted">Informações jurídicas e comerciais da sua empresa</p>
                </div>
            </div>

            {/* Logo upload */}
            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 block">Logo da Empresa</label>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="logo-upload"
                        />
                        <label 
                            htmlFor="logo-upload"
                            className="size-24 rounded-xl bg-brand-bg border-2 border-dashed border-brand-darkBorder flex items-center justify-center text-brand-muted hover:border-brand-primary/50 hover:text-brand-primary transition-colors cursor-pointer group overflow-hidden relative"
                        >
                            {isUploading && (
                                <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center">
                                    <RefreshCw className="size-6 text-white animate-spin" />
                                </div>
                            )}
                            {form.logo ? (
                                <img 
                                    src={form.logo} 
                                    alt="Logo preview" 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = ""; // Clear src to trigger fallback or hide
                                        // Option: set a fallback state if needed, but for now just show default icon if src is empty
                                        onChange({ ...form, logo: "" });
                                    }}
                                />
                            ) : (
                                <Upload className="size-8 group-hover:scale-110 transition-transform" />
                            )}
                        </label>
                        {form.logo && (
                            <button 
                                onClick={() => onChange({ ...form, logo: "" })}
                                className="absolute -top-2 -right-2 size-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                            >
                                <span className="text-[10px] font-bold">✕</span>
                            </button>
                        )}
                    </div>
                    <div className="text-sm text-brand-muted space-y-1">
                        <p className="font-semibold text-brand-text">Arraste uma imagem ou clique para upload</p>
                        <p>PNG, JPG ou SVG. Máximo 2MB.</p>
                        <p>Recomendado: 200×200 pixels</p>
                    </div>
                </div>
            </div>

            {/* Form fields */}
            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-6">Informações Jurídicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Razão Social</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Ex: Lavanderia Pro LTDA"
                            value={form.razaoSocial}
                            onChange={(e) => update("razaoSocial", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nome Fantasia</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Ex: Lavanderia Pro"
                            value={form.nomeFantasia}
                            onChange={(e) => update("nomeFantasia", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">CNPJ</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="00.000.000/0001-00"
                            maxLength={18}
                            value={form.cnpj}
                            onChange={(e) => update("cnpj", formatCNPJ(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Inscrição Estadual</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="000.000.000.000"
                            value={form.inscricaoEstadual}
                            onChange={(e) => update("inscricaoEstadual", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-6">Contato Corporativo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">E-mail Corporativo</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="email"
                            placeholder="contato@empresa.com"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Telefone Principal</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                            value={form.phone}
                            onChange={(e) => update("phone", formatPhone(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Website</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="url"
                            placeholder="https://www.empresa.com.br"
                            value={form.website}
                            onChange={(e) => update("website", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-6">Endereço & Responsável</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Responsável pela Unidade</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Nome do gerente ou responsável"
                            value={form.responsible || ""}
                            onChange={(e) => update("responsible", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">CEP</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="00000-000"
                            value={form.zipCode || ""}
                            onChange={(e) => update("zipCode", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Estado (UF)</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Ex: SP"
                            maxLength={2}
                            value={form.state || ""}
                            onChange={(e) => update("state", e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Cidade</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Ex: São Paulo"
                            value={form.city || ""}
                            onChange={(e) => update("city", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Bairro</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Ex: Centro"
                            value={form.neighborhood || ""}
                            onChange={(e) => update("neighborhood", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 flex-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Rua/Logradouro</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Rua..."
                            value={form.street || ""}
                            onChange={(e) => update("street", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 w-32">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Número</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="123"
                            value={form.number || ""}
                            onChange={(e) => update("number", e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { CompanyFormData };
