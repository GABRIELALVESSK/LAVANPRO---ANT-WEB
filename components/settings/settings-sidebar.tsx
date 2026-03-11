"use client";

import {
    Building2,
    MapPin,
    Users,
    ShieldCheck,
    SlidersHorizontal,
    Cog,
    LayoutGrid,
    Lock,
    ChevronRight,
} from "lucide-react";

export type SettingsTab =
    | "company"
    | "unit"
    | "users"
    | "profiles"
    | "operational"
    | "system"
    | "features";

type PlanTier = "free" | "pro" | "enterprise";

interface NavItem {
    id: SettingsTab;
    label: string;
    description: string;
    icon: React.ElementType;
    requiredPlan?: PlanTier;
    adminOnly?: boolean;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
    {
        label: "Geral",
        items: [
            {
                id: "company",
                label: "Dados da Empresa",
                description: "Razão social, CNPJ, contato",
                icon: Building2,
                adminOnly: true,
            },
            {
                id: "unit",
                label: "Dados da Unidade",
                description: "Endereço, horário, contato local",
                icon: MapPin,
                adminOnly: true,
            },
        ],
    },
    {
        label: "Controle de Acesso",
        items: [
            {
                id: "users",
                label: "Usuários",
                description: "Gerenciar colaboradores",
                icon: Users,
                adminOnly: true,
            },
            {
                id: "profiles",
                label: "Perfis de Acesso",
                description: "Permissões por cargo",
                icon: ShieldCheck,
                adminOnly: true,
            },
        ],
    },
    {
        label: "Configuração",
        items: [
            {
                id: "operational",
                label: "Preferências Operacionais",
                description: "Prazos, notificações, padrões",
                icon: SlidersHorizontal,
            },
            {
                id: "system",
                label: "Parâmetros do Sistema",
                description: "Idioma, moeda, fuso horário",
                icon: Cog,
                adminOnly: true,
            },
            {
                id: "features",
                label: "Status de Funcionalidades",
                description: "Módulos ativos e plano",
                icon: LayoutGrid,
                adminOnly: true,
            },
        ],
    },
];

interface SettingsSidebarProps {
    activeTab: SettingsTab;
    onTabChange: (tab: SettingsTab) => void;
    isAdmin: boolean;
    currentPlan: PlanTier;
}

export function SettingsSidebar({
    activeTab,
    onTabChange,
    isAdmin,
    currentPlan,
}: SettingsSidebarProps) {
    const planRank: Record<PlanTier, number> = {
        free: 0,
        pro: 1,
        enterprise: 2,
    };

    return (
        <nav className="w-72 shrink-0 border-r border-brand-darkBorder bg-brand-bg/50 min-h-full overflow-y-auto py-6 px-4 space-y-6 hidden lg:block">
            {NAV_GROUPS.map((group) => {
                const visibleItems = group.items.filter(
                    (item) => !item.adminOnly || isAdmin
                );
                if (visibleItems.length === 0) return null;

                return (
                    <div key={group.label}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-muted mb-2 px-3">
                            {group.label}
                        </p>
                        <div className="space-y-1">
                            {visibleItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                const isLocked =
                                    item.requiredPlan &&
                                    planRank[currentPlan] < planRank[item.requiredPlan];

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => !isLocked && onTabChange(item.id)}
                                        disabled={!!isLocked}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group ${isActive
                                                ? "bg-brand-primary/10 border border-brand-primary/30 text-brand-text"
                                                : isLocked
                                                    ? "opacity-50 cursor-not-allowed text-brand-muted"
                                                    : "text-brand-muted hover:text-brand-text hover:bg-brand-card border border-transparent"
                                            }`}
                                    >
                                        <div
                                            className={`size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive
                                                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                                                    : "bg-brand-card text-brand-muted group-hover:text-brand-text"
                                                }`}
                                        >
                                            <Icon className="size-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm font-semibold truncate ${isActive ? "text-brand-text" : ""
                                                    }`}
                                            >
                                                {item.label}
                                            </p>
                                            <p className="text-[11px] text-brand-muted truncate">
                                                {item.description}
                                            </p>
                                        </div>
                                        {isLocked ? (
                                            <Lock className="size-4 text-brand-muted shrink-0" />
                                        ) : isActive ? (
                                            <ChevronRight className="size-4 text-brand-primary shrink-0" />
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </nav>
    );
}

/* Mobile tab selector for small screens */
export function SettingsMobileNav({
    activeTab,
    onTabChange,
    isAdmin,
}: {
    activeTab: SettingsTab;
    onTabChange: (tab: SettingsTab) => void;
    isAdmin: boolean;
}) {
    const allItems = NAV_GROUPS.flatMap((g) => g.items).filter(
        (item) => !item.adminOnly || isAdmin
    );

    return (
        <div className="lg:hidden overflow-x-auto pb-2 -mx-2 px-2">
            <div className="flex gap-2">
                {allItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${isActive
                                    ? "bg-brand-primary/10 border-brand-primary/30 text-brand-text"
                                    : "bg-brand-card border-brand-darkBorder text-brand-muted hover:text-brand-text hover:border-brand-primary/50"
                                }`}
                        >
                            <Icon className="size-4" />
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
