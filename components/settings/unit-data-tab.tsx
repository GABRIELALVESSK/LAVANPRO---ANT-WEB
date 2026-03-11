"use client";

import { MapPin, Clock } from "lucide-react";

interface UnitFormData {
    name: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    openingHours: Record<string, { open: string; close: string; active: boolean }>;
}

const DAYS = [
    { key: "mon", label: "Segunda-feira" },
    { key: "tue", label: "Terça-feira" },
    { key: "wed", label: "Quarta-feira" },
    { key: "thu", label: "Quinta-feira" },
    { key: "fri", label: "Sexta-feira" },
    { key: "sat", label: "Sábado" },
    { key: "sun", label: "Domingo" },
];

interface UnitDataTabProps {
    form: UnitFormData;
    onChange: (form: UnitFormData) => void;
}

export function UnitDataTab({ form, onChange }: UnitDataTabProps) {
    const update = (field: keyof Omit<UnitFormData, "openingHours">, value: string) => {
        onChange({ ...form, [field]: value });
    };

    const updateHours = (day: string, field: "open" | "close" | "active", value: string | boolean) => {
        onChange({
            ...form,
            openingHours: {
                ...form.openingHours,
                [day]: { ...form.openingHours[day], [field]: value },
            },
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <MapPin className="size-7" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-brand-text">Dados da Unidade</h3>
                    <p className="text-sm text-brand-muted">Endereço, contato e horário de funcionamento da unidade</p>
                </div>
            </div>

            {/* Unit info */}
            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-6">Identificação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Nome da Unidade</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Ex: Lavanderia Pro - Centro"
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Telefone da Unidade</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="(00) 0000-0000"
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">E-mail da Unidade</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="email"
                            placeholder="unidade@empresa.com"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-6">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    <div className="space-y-2 md:col-span-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Rua / Avenida</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Av. Paulista"
                            value={form.street}
                            onChange={(e) => update("street", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Número</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="1000"
                            value={form.number}
                            onChange={(e) => update("number", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Compl.</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Sala 1"
                            value={form.complement}
                            onChange={(e) => update("complement", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Bairro</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="Bela Vista"
                            value={form.neighborhood}
                            onChange={(e) => update("neighborhood", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Cidade</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="São Paulo"
                            value={form.city}
                            onChange={(e) => update("city", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Estado</label>
                        <select
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            value={form.state}
                            onChange={(e) => update("state", e.target.value)}
                        >
                            <option value="">UF</option>
                            {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                                <option key={uf} value={uf}>{uf}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2 md:col-span-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">CEP</label>
                        <input
                            className="w-full px-4 py-2.5 bg-brand-bg border border-brand-darkBorder rounded-lg focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text"
                            type="text"
                            placeholder="00000-000"
                            value={form.zipCode}
                            onChange={(e) => update("zipCode", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Opening hours */}
            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="size-5 text-brand-primary" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted">Horário de Funcionamento</h4>
                </div>
                <div className="space-y-3">
                    {DAYS.map((day) => {
                        const hours = form.openingHours[day.key] || { open: "08:00", close: "18:00", active: day.key !== "sun" };
                        return (
                            <div
                                key={day.key}
                                className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${hours.active ? "border-brand-darkBorder bg-brand-bg/30" : "border-transparent bg-brand-bg/10 opacity-50"
                                    }`}
                            >
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={hours.active}
                                        onChange={(e) => updateHours(day.key, "active", e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-brand-darkBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                                </label>
                                <span className="text-sm font-semibold text-brand-text w-36">{day.label}</span>
                                {hours.active && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={hours.open}
                                            onChange={(e) => updateHours(day.key, "open", e.target.value)}
                                            className="px-3 py-1.5 bg-brand-bg border border-brand-darkBorder rounded-lg text-sm text-brand-text outline-none focus:ring-2 focus:ring-brand-primary"
                                        />
                                        <span className="text-brand-muted text-sm">até</span>
                                        <input
                                            type="time"
                                            value={hours.close}
                                            onChange={(e) => updateHours(day.key, "close", e.target.value)}
                                            className="px-3 py-1.5 bg-brand-bg border border-brand-darkBorder rounded-lg text-sm text-brand-text outline-none focus:ring-2 focus:ring-brand-primary"
                                        />
                                    </div>
                                )}
                                {!hours.active && (
                                    <span className="text-xs text-brand-muted font-medium">Fechado</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export type { UnitFormData };
