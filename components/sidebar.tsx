"use client";

import {
  WashingMachine,
  LayoutDashboard,
  BarChart3,
  ReceiptText,
  Users,
  Wallet,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Package,
  UserCog,
  QrCode,
  Crown,
  ChevronDown,
  Building2,
  Lock,
  Check,
  ShoppingBag,
  MessageSquare
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useSubscription, PlanTier } from "@/hooks/useSubscription";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { UnitSelector } from "@/components/unit-selector";

// All possible navigation items with their required permission key
const ALL_NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Visão Geral", group: "Principal", permission: null },
  { href: "/reports", icon: BarChart3, label: "Relatórios", group: "Principal", permission: "reports" as const },
  { href: "/orders", icon: ReceiptText, label: "Pedidos", group: "Principal", permission: "orders" as const },
  { href: "/customers", icon: Users, label: "Clientes", group: "Principal", permission: "customers" as const },
  { href: "/services", icon: ShoppingBag, label: "Serviços", group: "Principal", permission: "settings" as const },
  { href: "/finance", icon: Wallet, label: "Financeiro", group: "Principal", permission: "finance" as const },
  { href: "/stock", icon: Package, label: "Estoque", group: "Operações", permission: "stock" as const },
  { href: "/team", icon: UserCog, label: "Equipe", group: "Operações", permission: "team" as const },
  { href: "/labels", icon: QrCode, label: "Etiquetagem QR", group: "Operações", permission: "labels" as const },
  { href: "/chat", icon: MessageSquare, label: "Mensagens IA", group: "Operações", permission: "settings" as const },
  { href: "/settings", icon: Settings, label: "Configurações", group: "Operações", permission: "settings" as const },
];

const PREMIUM_ROUTES = ["/finance", "/labels", "/team", "/reports", "/stock", "/chat"];
const ENTERPRISE_ONLY_ROUTES = ["/reports", "/chat"];
const PRO_REQUIRED_ROUTES = ["/finance", "/labels", "/team", "/stock"];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { canAccessRoute } = usePermissions();
  const { isStarter, isEnterprise, plan } = useSubscription();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleUpgrade = async (newPlan: PlanTier) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.rpc('update_my_subscription', { new_plan: newPlan });
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      console.error("Erro ao atualizar plano", err);
      alert("Não foi possível atualizar o plano no momento. Tente novamente.");
      setIsUpdating(false);
    }
  };

  // Filter navigation items based on actual permissions
  const visibleItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.permission === null) return true; // Dashboard always visible
    return canAccessRoute(item.href);
  });

  // Group the visible items
  const groups: { label: string; items: typeof ALL_NAV_ITEMS }[] = [];
  const groupMap = new Map<string, typeof ALL_NAV_ITEMS>();

  for (const item of visibleItems) {
    if (!groupMap.has(item.group)) {
      groupMap.set(item.group, []);
    }
    groupMap.get(item.group)!.push(item);
  }

  for (const [label, items] of groupMap) {
    groups.push({ label, items });
  }

  return (
    <>
      <aside className="w-64 bg-brand-bg border-r border-brand-darkBorder flex flex-col shrink-0 min-h-screen">
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 text-brand-text mb-6">
            <div className="size-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
              <WashingMachine className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight tracking-tight">Lavanderia Pro</h2>
              <p className="text-[10px] text-brand-muted font-medium">Sistema de Gestão</p>
            </div>
          </div>

          {/* Unit Selector (Centralized control) */}
          <div className="mb-6 relative">
            <UnitSelector onUnitChange={(id) => {
              localStorage.setItem("lavanpro_selected_unit", id);
              window.dispatchEvent(new CustomEvent("unit-changed", { detail: id }));
            }} />
          </div>

          {/* Nav Groups */}
          <nav className="space-y-5">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-brand-muted mb-2 px-1">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    // Logic to check if route is locked based on current plan:
                    let isLocked = false;
                    if (isStarter && PREMIUM_ROUTES.includes(item.href)) {
                      isLocked = true;
                    } else if (ENTERPRISE_ONLY_ROUTES.includes(item.href) && !isEnterprise) {
                      isLocked = true;
                    }

                    return isLocked ? (
                      <button
                        key={item.href}
                        onClick={() => setIsPlansModalOpen(true)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-brand-muted hover:bg-brand-card/50 opacity-80`}
                        title="Recurso Premium"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="size-4 shrink-0 text-brand-muted/70" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <Lock className="size-3.5 text-amber-500/70" />
                      </button>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                          ? "bg-brand-primary text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)]"
                          : "text-brand-muted hover:text-brand-text hover:bg-brand-card"
                          }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="text-sm font-medium">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto size-1.5 rounded-full bg-white/60" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-auto p-5 border-t border-brand-darkBorder space-y-4">
          {/* Theme toggle */}
          {mounted && (
            <div className="flex items-center justify-between bg-brand-card rounded-xl p-1 border border-brand-darkBorder">
              <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-lg flex-1 flex justify-center transition-colors ${theme === "light"
                  ? "bg-brand-bg text-brand-primary shadow-sm"
                  : "text-brand-muted hover:text-brand-text"
                  }`}
                title="Tema Claro"
              >
                <Sun className="size-4" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-2 rounded-lg flex-1 flex justify-center transition-colors ${theme === "system"
                  ? "bg-brand-bg text-brand-primary shadow-sm"
                  : "text-brand-muted hover:text-brand-text"
                  }`}
                title="Tema do Sistema"
              >
                <Monitor className="size-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-lg flex-1 flex justify-center transition-colors ${theme === "dark"
                  ? "bg-brand-bg text-brand-primary shadow-sm"
                  : "text-brand-muted hover:text-brand-text"
                  }`}
                title="Tema Escuro"
              >
                <Moon className="size-4" />
              </button>
            </div>
          )}

          {/* User info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-full bg-brand-primary/20 flex items-center justify-center overflow-hidden relative shrink-0">
                <Image
                  src="https://picsum.photos/seed/avatar/100/100"
                  alt="User avatar"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-brand-text truncate">
                  {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário"}
                </p>
                <p className="text-[11px] text-brand-muted truncate text-ellipsis w-24">
                  {user?.email || "carregando..."}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-brand-muted hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors shrink-0"
              title="Sair do sistema"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Plans Modal Overlay for Upsell */}
      {isPlansModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-6xl py-12 flex flex-col items-center">
            <button
              onClick={() => setIsPlansModalOpen(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-white bg-brand-card/50 p-2 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center p-3 bg-amber-500/20 text-amber-500 rounded-full mb-4">
                <Lock className="size-8" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3">Recurso Profissional Fechado</h2>
              <p className="text-brand-muted max-w-lg mx-auto">Para acessar este e outros recursos avançados, faça o upgrade e escale o potencial da sua lavanderia com a LavanPro.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

              {/* Starter */}
              <div className="bg-brand-card border border-brand-darkBorder rounded-2xl p-8 flex flex-col relative opacity-50">
                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">R$97</span>
                  <span className="text-brand-muted text-sm">/mês</span>
                </div>
                <p className="text-sm text-brand-muted mb-8">Ideal para pequenas lavanderias ou iniciantes.</p>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Gestão básica</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">1 Usuário</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Controle de caixa</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Suporte via email</span></li>
                </ul>

                <button
                  disabled
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-bg text-white border border-brand-darkBorder transition-colors disabled:opacity-50"
                >
                  Seu Plano Atual
                </button>
              </div>

              {/* Profissional */}
              <div className="bg-brand-card border-2 border-brand-primary rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-brand-primary/20">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-full">
                  Mais Escolhido
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Profissional</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">R$197</span>
                  <span className="text-brand-muted text-sm">/mês</span>
                </div>
                <p className="text-sm text-brand-muted mb-8">Libere Etiquetas QR, Gestão Financeira, Relatórios e mais.</p>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Tudo do Starter</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Etiquetas QR (E-tags)</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Financeiro e Controle de Caixa</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Módulo de Estoque</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Até 3 Usuários e Equipe</span></li>
                </ul>

                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={isUpdating}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-primary text-white hover:bg-brand-primaryHover transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                >
                  {isUpdating ? 'Aguarde...' : 'Desbloquear Profissional'}
                </button>
              </div>

              {/* Enterprise */}
              <div className="bg-brand-card border border-brand-darkBorder rounded-2xl p-8 flex flex-col relative">
                <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">R$397</span>
                  <span className="text-brand-muted text-sm">/mês</span>
                </div>
                <p className="text-sm text-brand-muted mb-8">Para grandes operações e redes de lavanderias.</p>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Tudo do Profissional</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Usuários Ilimitados</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Relatórios BI e Avançados</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Acesso a API Aberta</span></li>
                  <li className="flex items-start gap-3"><Check className="size-4 text-brand-primary shrink-0 mt-0.5" /><span className="text-sm text-brand-text">Múltiplas Unidades</span></li>
                </ul>

                <button
                  onClick={() => handleUpgrade('enterprise')}
                  disabled={isUpdating}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-bg text-white border border-brand-darkBorder hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Aguarde...' : 'Escolher Enterprise'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
