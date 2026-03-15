"use client";

import { Cog, Globe, DollarSign, Clock, Calendar, Hash } from "lucide-react";

interface SystemParamsData {
    language: string;
    currency: string;
    timezone: string;
    dateFormat: string;
    decimalPlaces: number;
}

interface SystemParamsTabProps {
    form: SystemParamsData;
    onChange: (form: SystemParamsData) => void;
}

function ParamRow({
    icon: Icon,
    iconColor,
    label,
    description,
    children,
}: {
    icon: React.ElementType;
    iconColor: string;
    label: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between p-5 border border-brand-darkBorder rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-start gap-3">
                <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-brand-text">{label}</p>
                    <p className="text-xs text-brand-muted mt-0.5">{description}</p>
                </div>
            </div>
            <div className="shrink-0 ml-4">{children}</div>
        </div>
    );
}

export function SystemParamsTab({ form, onChange }: SystemParamsTabProps) {
    const update = <K extends keyof SystemParamsData>(field: K, value: SystemParamsData[K]) => {
        onChange({ ...form, [field]: value });
    };

    const selectClass = "px-4 py-2 bg-brand-bg border border-brand-darkBorder rounded-lg text-sm font-semibold focus:ring-2 focus:ring-brand-primary outline-none text-brand-text min-w-[180px]";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                    <Cog className="size-7" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-brand-text">Parâmetros do Sistema</h3>
                    <p className="text-sm text-brand-muted">Configure idioma, moeda, fuso horário e formatos do sistema</p>
                </div>
            </div>

            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-6">Regionalização</h4>
                <div className="space-y-4">
                    <ParamRow icon={Globe} iconColor="bg-blue-500/10 text-blue-500" label="Idioma do Painel" description="Define o idioma de toda a interface do sistema">
                        <select className={selectClass} value={form?.language || "pt-BR"} onChange={(e) => update("language", e.target.value)}>
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es">Español</option>
                        </select>
                    </ParamRow>

                    <ParamRow icon={DollarSign} iconColor="bg-emerald-500/10 text-emerald-500" label="Moeda Padrão" description="Moeda utilizada para exibição de preços e relatórios">
                        <select className={selectClass} value={form?.currency || "BRL"} onChange={(e) => update("currency", e.target.value)}>
                            <option value="BRL">Real (R$ BRL)</option>
                            <option value="USD">Dólar ($ USD)</option>
                            <option value="EUR">Euro (€ EUR)</option>
                        </select>
                    </ParamRow>

                    <ParamRow icon={Clock} iconColor="bg-violet-500/10 text-violet-500" label="Fuso Horário" description="Horário base para registros e relatórios">
                        <select className={selectClass} value={form?.timezone || "America/Sao_Paulo"} onChange={(e) => update("timezone", e.target.value)}>
                            <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                            <option value="America/Manaus">Manaus (GMT-4)</option>
                            <option value="America/Cuiaba">Cuiabá (GMT-4)</option>
                            <option value="America/Belem">Belém (GMT-3)</option>
                            <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
                            <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                        </select>
                    </ParamRow>
                </div>
            </div>

            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-6">Formatação</h4>
                <div className="space-y-4">
                    <ParamRow icon={Calendar} iconColor="bg-amber-500/10 text-amber-500" label="Formato de Data" description="Define como as datas são exibidas no sistema">
                        <select className={selectClass} value={form?.dateFormat || "DD/MM/YYYY"} onChange={(e) => update("dateFormat", e.target.value)}>
                            <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                            <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                            <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                        </select>
                    </ParamRow>

                    <ParamRow icon={Hash} iconColor="bg-rose-500/10 text-rose-500" label="Casas Decimais" description="Quantidade de casas decimais em valores monetários">
                        <select className={selectClass} value={(form?.decimalPlaces ?? 2).toString()} onChange={(e) => update("decimalPlaces", parseInt(e.target.value))}>
                            <option value="0">0 casas</option>
                            <option value="2">2 casas</option>
                            <option value="3">3 casas</option>
                            <option value="4">4 casas</option>
                        </select>
                    </ParamRow>
                </div>
            </div>
        </div>
    );
}

export type { SystemParamsData };
