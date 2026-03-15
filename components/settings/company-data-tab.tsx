"use client";

import { Building2, Upload } from "lucide-react";

interface CompanyFormData {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    inscricaoEstadual: string;
    email: string;
    phone: string;
    website: string;
}

interface CompanyDataTabProps {
    form: CompanyFormData;
    onChange: (form: CompanyFormData) => void;
}

export function CompanyDataTab({ form, onChange }: CompanyDataTabProps) {
    const update = (field: keyof CompanyFormData, value: string) => {
        onChange({ ...form, [field]: value });
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
                    <div className="size-24 rounded-xl bg-brand-bg border-2 border-dashed border-brand-darkBorder flex items-center justify-center text-brand-muted hover:border-brand-primary/50 hover:text-brand-primary transition-colors cursor-pointer group">
                        <Upload className="size-8 group-hover:scale-110 transition-transform" />
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
                            value={form.cnpj}
                            onChange={(e) => update("cnpj", e.target.value)}
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
                            placeholder="(00) 0000-0000"
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
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
        </div>
    );
}

export type { CompanyFormData };
