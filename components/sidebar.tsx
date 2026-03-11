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
  Bell,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// All possible navigation items with their required permission key
const ALL_NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Visão Geral", group: "Principal", permission: null }, // always visible
  { href: "/reports", icon: BarChart3, label: "Relatórios", group: "Principal", permission: "reports" as const },
  { href: "/orders", icon: ReceiptText, label: "Pedidos", group: "Principal", permission: "orders" as const },
  { href: "/customers", icon: Users, label: "Clientes", group: "Principal", permission: "customers" as const },
  { href: "/finance", icon: Wallet, label: "Financeiro", group: "Principal", permission: "finance" as const },
  { href: "/stock", icon: Package, label: "Estoque", group: "Operações", permission: "stock" as const },
  { href: "/team", icon: UserCog, label: "Equipe", group: "Operações", permission: "team" as const },
  { href: "/labels", icon: QrCode, label: "Etiquetagem QR", group: "Operações", permission: "labels" as const },
  { href: "/settings", icon: Settings, label: "Configurações", group: "Operações", permission: "settings" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { canAccessRoute } = usePermissions();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
                  return (
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
              <p className="text-[11px] text-brand-muted truncate">
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
  );
}
