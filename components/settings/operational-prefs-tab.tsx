"use client";

import { SlidersHorizontal, Bell, MessageSquare, Tag, Truck, CreditCard, FileText } from "lucide-react";

interface OperationalPrefsData {
    defaultDeliveryDays: number;
    autoLabeling: boolean;
    whatsappNotify: boolean;
    payOnDelivery: boolean;
    defaultReceiptNote: string;
    emailSummary: boolean;
    newOrderAlerts: boolean;
    weeklyReports: boolean;
    orderCreated: boolean;
    orderReady: boolean;
    deliveryScheduled: boolean;
}

interface OperationalPrefsTabProps {
    form: OperationalPrefsData;
    onChange: (form: OperationalPrefsData) => void;
}

function Toggle({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-brand-darkBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
        </label>
    );
}

function SettingRow({
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
        <div className="flex items-center justify-between p-4 border border-brand-darkBorder rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-start gap-3">
                <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
                    <Icon className="size-4" />
                </div>
                <div>
                    <p className="text-sm font-bold text-brand-text">{label}</p>
                    <p className="text-xs text-brand-muted mt-0.5">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

export function OperationalPrefsTab({ form, onChange }: OperationalPrefsTabProps) {
    const update = <K extends keyof OperationalPrefsData>(field: K, value: OperationalPrefsData[K]) => {
        onChange({ ...form, [field]: value });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <SlidersHorizontal className="size-7" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-brand-text">Preferências Operacionais</h3>
                    <p className="text-sm text-brand-muted">Configure prazos, notificações e padrões do fluxo de trabalho</p>
                </div>
            </div>

            {/* Operational Settings */}
            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-6">Fluxo de Trabalho</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-brand-darkBorder rounded-xl hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="size-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
                                <Truck className="size-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-brand-text">Prazo Padrão de Entrega</p>
                                <p className="text-xs text-brand-muted mt-0.5">Dias úteis padrão para conclusão de pedidos</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                max={30}
                                value={form.defaultDeliveryDays}
                                onChange={(e) => update("defaultDeliveryDays", parseInt(e.target.value) || 3)}
                                className="w-16 px-3 py-1.5 bg-brand-bg border border-brand-darkBorder rounded-lg text-sm text-brand-text text-center outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                            <span className="text-sm text-brand-muted">dias</span>
                        </div>
                    </div>

                    <SettingRow icon={Tag} iconColor="bg-violet-500/10 text-violet-500" label="Etiquetagem Automática" description="Gerar etiqueta QR automaticamente ao criar pedido">
                        <Toggle checked={form.autoLabeling} onChange={(v) => update("autoLabeling", v)} />
                    </SettingRow>

                    <SettingRow icon={MessageSquare} iconColor="bg-green-500/10 text-green-500" label="Notificar Cliente por WhatsApp" description="Enviar atualizações de status via WhatsApp">
                        <Toggle checked={form.whatsappNotify} onChange={(v) => update("whatsappNotify", v)} />
                    </SettingRow>

                    <SettingRow icon={CreditCard} iconColor="bg-emerald-500/10 text-emerald-500" label="Permitir Pagamento na Entrega" description="Aceitar pagamento no momento da retirada">
                        <Toggle checked={form.payOnDelivery} onChange={(v) => update("payOnDelivery", v)} />
                    </SettingRow>
                </div>
            </div>

            {/* Receipt Note */}
            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <div className="flex items-center gap-3 mb-4">
                    <FileText className="size-5 text-brand-primary" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted">Observação Padrão em Recibos</h4>
                </div>
                <textarea
                    value={form.defaultReceiptNote}
                    onChange={(e) => update("defaultReceiptNote", e.target.value)}
                    placeholder="Ex: Não nos responsabilizamos por peças deixadas após 30 dias."
                    rows={3}
                    className="w-full px-4 py-3 bg-brand-bg border border-brand-darkBorder rounded-xl focus:ring-2 focus:ring-brand-primary transition-all outline-none text-sm text-brand-text placeholder-brand-muted/50 resize-none"
                />
            </div>

            {/* Notifications */}
            <div className="bg-brand-card p-6 rounded-xl border border-brand-darkBorder">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="size-5 text-brand-primary" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand-muted">Notificações do Sistema</h4>
                </div>
                <div className="space-y-4">
                    <SettingRow icon={Bell} iconColor="bg-blue-500/10 text-blue-500" label="Resumo por E-mail" description="Receba resumos diários de faturamento">
                        <Toggle checked={form.emailSummary} onChange={(v) => update("emailSummary", v)} />
                    </SettingRow>
                    <SettingRow icon={Bell} iconColor="bg-amber-500/10 text-amber-500" label="Alertas de Novos Pedidos" description="Notificações em tempo real no desktop">
                        <Toggle checked={form.newOrderAlerts} onChange={(v) => update("newOrderAlerts", v)} />
                    </SettingRow>
                    <SettingRow icon={Bell} iconColor="bg-indigo-500/10 text-indigo-500" label="Relatórios Semanais" description="Envio automático para a diretoria">
                        <Toggle checked={form.weeklyReports} onChange={(v) => update("weeklyReports", v)} />
                    </SettingRow>
                    <SettingRow icon={Bell} iconColor="bg-green-500/10 text-green-500" label="Pedido Criado" description="Notificar quando um novo pedido for registrado">
                        <Toggle checked={form.orderCreated} onChange={(v) => update("orderCreated", v)} />
                    </SettingRow>
                    <SettingRow icon={Bell} iconColor="bg-teal-500/10 text-teal-500" label="Pedido Pronto para Retirada" description="Avisar quando as peças estiverem prontas">
                        <Toggle checked={form.orderReady} onChange={(v) => update("orderReady", v)} />
                    </SettingRow>
                    <SettingRow icon={Bell} iconColor="bg-cyan-500/10 text-cyan-500" label="Entrega Agendada" description="Lembrete de entregas programadas para o dia">
                        <Toggle checked={form.deliveryScheduled} onChange={(v) => update("deliveryScheduled", v)} />
                    </SettingRow>
                </div>
            </div>
        </div>
    );
}

export type { OperationalPrefsData };
