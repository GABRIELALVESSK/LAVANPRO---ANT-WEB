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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Visão Geral" },
    { href: "/reports", icon: BarChart3, label: "Relatórios" },
    { href: "/orders", icon: ReceiptText, label: "Pedidos" },
    { href: "/customers", icon: Users, label: "Clientes" },
    { href: "/finance", icon: Wallet, label: "Financeiro" },
    { href: "/settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <aside className="w-64 bg-brand-bg border-r border-brand-darkBorder flex flex-col shrink-0 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="size-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <WashingMachine className="size-5 text-white" />
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            Lavanderia Pro
          </h2>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-brand-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  : "text-brand-muted hover:text-white hover:bg-brand-card"
                  }`}
              >
                <Icon className="size-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden relative">
              <Image
                src="https://picsum.photos/seed/avatar/100/100"
                alt="User avatar"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Usuário"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || "carregando..."}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
            title="Sair do sistema"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
