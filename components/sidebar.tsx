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
  MessageSquare,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

import { useSubscription, PlanTier } from "@/hooks/useSubscription";
import { useTheme } from "next-themes";
import { useEffect, useState, createContext, useContext } from "react";
import { UnitSelector } from "@/components/unit-selector";
import { useIsMobile } from "@/hooks/useIsMobile";

// ─── Sidebar Context (controla abrir/fechar no mobile) ─────────────
const SidebarContext = createContext<{
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}>({ isOpen: false, toggle: () => {}, close: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isOpen, toggle: () => setIsOpen(p => !p), close: () => setIsOpen(false) }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ─── Mobile Header (hamburger + title) ─────────────────────────────
export function MobileHeader({ title }: { title?: string }) {
  const { toggle } = useSidebar();
  const { isMobile, isTablet } = useIsMobile();

  if (!isMobile && !isTablet) return null;

  return (
    <div className="mobile-top-bar lg:hidden">
      <button
        onClick={toggle}
        className="p-2 -ml-1 rounded-xl bg-brand-card border border-brand-darkBorder text-brand-text hover:bg-brand-primary/10 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="size-7 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
          <WashingMachine className="size-4 text-white" />
        </div>
        <span className="text-sm font-bold text-brand-text truncate uppercase tracking-tight">
          {title || "LavanPro"}
        </span>
      </div>
    </div>
  );
}

// All possible navigation items with their required permission key
const ALL_NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Visão Geral", group: "Principal", permission: "dashboard" as const },
  { href: "/reports", icon: BarChart3, label: "Relatórios", group: "Principal", permission: "reports" as const },
  { href: "/orders", icon: ReceiptText, label: "Pedidos", group: "Principal", permission: "orders" as const },
  { href: "/customers", icon: Users, label: "Clientes", group: "Principal", permission: "customers" as const },
  { href: "/services", icon: ShoppingBag, label: "Serviços", group: "Principal", permission: "services" as const },
  { href: "/finance", icon: Wallet, label: "Financeiro", group: "Principal", permission: "finance" as const },
  { href: "/stock", icon: Package, label: "Estoque", group: "Operações", permission: "stock" as const },
  { href: "/team", icon: UserCog, label: "Equipe", group: "Operações", permission: "team" as const },
  { href: "/labels", icon: QrCode, label: "Etiquetagem QR", group: "Operações", permission: "labels" as const },
  { href: "/chat", icon: MessageSquare, label: "Mensagens IA", group: "Operações", permission: "chat" as const },
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
  const { isStarter, isEnterprise, plan, isTrialExpired, trialDaysRemaining } = useSubscription();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { isMobile, isTablet } = useIsMobile();
  const { isOpen, close } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Drawer fecha ao trocar de rota
  useEffect(() => {
    close();
  }, [pathname]);

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
    if (item.permission === null) return true;
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

  // ─── Conteúdo interno da sidebar (reutilizado no desktop e no drawer) ───
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 text-brand-text mb-6">
          <div className="size-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <WashingMachine className="size-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold leading-tight tracking-tight uppercase">LavanPro</h2>
            <p className="text-[10px] text-brand-muted font-medium">Sistema de Gestão</p>
          </div>
          {/* Botão fechar no mobile */}
          {(isMobile || isTablet) && (
            <button onClick={close} className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-card transition-colors">
              <X className="size-5" />
            </button>
          )}
        </div>

        <div className="mb-6 relative">
          <UnitSelector onUnitChange={(id) => {
            // Context update handled by UnitSelector + BusinessDataProvider
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
        {/* Trial Status Card */}
        {mounted && plan === 'free' && !isTrialExpired && (
          <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20 rounded-2xl p-4 space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Crown className="size-8 text-brand-primary" />
            </div>
            
            <div className="flex items-center gap-2 text-brand-primary">
              <RefreshCw className="size-3.5 animate-spin-slow" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Período de Teste</span>
            </div>

            <div className="space-y-1 relative">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-brand-text">
                  {trialDaysRemaining}
                </span>
                <span className="text-[10px] font-bold text-brand-muted uppercase">de 7 dias</span>
              </div>
              <div className="h-1.5 w-full bg-brand-darkBorder rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-primary transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(trialDaysRemaining / 7) * 100}%` 
                  }}
                />
              </div>
            </div>

            <button 
              onClick={() => router.push('/settings?tab=status')}
              className="w-full py-2 bg-brand-primary text-white text-[11px] font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Assinar Plano
            </button>
          </div>
        )}


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
            <input 
              type="file" 
              id="user-avatar-upload" 
              className="hidden" 
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && user?.id) {
                  try {
                    setIsUploadingAvatar(true);
                    
                    // Upload to Supabase Storage
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.id}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `${fileName}`;

                    // Tenta garantir que o bucket existe (opcional se já souber que existe)
                    const { error: uploadError } = await supabase.storage
                      .from('avatars')
                      .upload(filePath, file, { 
                        cacheControl: '3600',
                        upsert: true 
                      });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                      .from('avatars')
                      .getPublicUrl(filePath);
                    
                    // Update user metadata with the URL + cache buster
                    const finalUrl = `${publicUrl}?t=${Date.now()}`;
                    
                    const { error: updateError } = await supabase.auth.updateUser({
                      data: { avatar_url: finalUrl }
                    });

                    if (updateError) throw updateError;
                    
                    // Forçar atualização local sem refresh total se possível, 
                    // mas o alert e reload garantem que o usuário veja a mudança
                    alert("Foto de perfil atualizada!");
                    window.location.reload(); 
                  } catch (err: any) {
                    console.error("Avatar upload error:", err);
                    alert("Erro ao enviar foto: " + (err.message || "Tente novamente"));
                  } finally {
                    setIsUploadingAvatar(false);
                  }
                }
              }}
            />
            <label 
              htmlFor="user-avatar-upload"
              className="size-9 rounded-full bg-brand-primary/20 flex items-center justify-center overflow-hidden relative shrink-0 cursor-pointer group hover:ring-2 hover:ring-brand-primary transition-all shadow-lg"
              title="Alterar foto de perfil"
            >
              {isUploadingAvatar ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                  <RefreshCw className="size-4 text-white animate-spin" />
                </div>
              ) : null}
              {(() => {
                const avatar_url = user?.user_metadata?.avatar_url;
                if (!avatar_url) {
                  return (
                    <div className="size-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xs">
                      {user?.user_metadata?.full_name?.substring(0, 1) || user?.email?.substring(0, 1).toUpperCase() || "U"}
                    </div>
                  );
                }
                return (
                  <img 
                    src={avatar_url} 
                    alt="User avatar" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    onError={(e) => {
                      // Se a imagem falhar, remove a URL para mostrar as iniciais
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent && !parent.querySelector('.fallback-avatar')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'fallback-avatar size-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xs';
                        fallback.innerText = user?.user_metadata?.full_name?.substring(0, 1) || user?.email?.substring(0, 1).toUpperCase() || "U";
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                );
              })()}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <UserCog className="size-3 text-white" />
              </div>
            </label>
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
    </>
  );

  return (
    <>
      {/* ─── DESKTOP: Sidebar normal (inalterada) ─── */}
      <aside className="hidden lg:flex w-64 bg-brand-bg border-r border-brand-darkBorder flex-col shrink-0 min-h-screen">
        {sidebarContent}
      </aside>

      {/* ─── MOBILE / TABLET: Drawer off-canvas ─── */}
      {(isMobile || isTablet) && (
        <>
          {/* Overlay */}
          <div
            className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`}
            onClick={close}
          />
          {/* Drawer */}
          <div className={`mobile-drawer bg-brand-bg border-r border-brand-darkBorder flex flex-col ${isOpen ? 'open' : ''}`}>
            {sidebarContent}
          </div>
        </>
      )}

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
