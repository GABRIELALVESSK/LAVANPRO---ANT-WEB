"use client";

import {
  WashingMachine,
  LayoutDashboard,
  BarChart3,
  ReceiptText,
  Users,
  Wallet,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Visão Geral" },
    { href: "/reports", icon: BarChart3, label: "Relatórios" },
    { href: "/orders", icon: ReceiptText, label: "Pedidos" },
    { href: "/customers", icon: Users, label: "Clientes" },
    { href: "/finance", icon: Wallet, label: "Financeiro" },
    { href: "/settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <aside className="w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
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
              Admin Dashboard
            </p>
            <p className="text-xs text-slate-400 truncate">
              admin@lavanderiapro.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
