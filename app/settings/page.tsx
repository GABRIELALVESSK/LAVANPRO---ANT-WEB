"use client";

import { AccessGuard } from "@/components/access-guard";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/sidebar";
import { SettingsSidebar, SettingsMobileNav } from "@/components/settings/settings-sidebar";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import type { SettingsTab } from "@/components/settings/settings-sidebar";
import { PaymentSuccessModal } from "@/components/settings/payment-success-modal";
import { notifyDataChanged } from "@/lib/dataSync";

// Dynamically import all tabs with no SSR to avoid 500 errors
const CompanyDataTab = dynamic(() => import("@/components/settings/company-data-tab").then(m => m.CompanyDataTab), { ssr: false });
const UnitDataTab = dynamic(() => import("@/components/settings/unit-data-tab").then(m => m.UnitDataTab), { ssr: false });
const UsersTab = dynamic(() => import("@/components/settings/users-tab").then(m => m.UsersTab), { ssr: false });
const AccessProfilesTab = dynamic(() => import("@/components/settings/access-profiles-tab").then(m => m.AccessProfilesTab), { ssr: false });
const OperationalPrefsTab = dynamic(() => import("@/components/settings/operational-prefs-tab").then(m => m.OperationalPrefsTab), { ssr: false });
const SystemParamsTab = dynamic(() => import("@/components/settings/system-params-tab").then(m => m.SystemParamsTab), { ssr: false });
const FeatureStatusTab = dynamic(() => import("@/components/settings/feature-status-tab").then(m => m.FeatureStatusTab), { ssr: false });

// Plan tier configuration
type PlanTier = "free" | "pro" | "enterprise";

function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentPlan, setCurrentPlan] = useState<PlanTier>("free");
  const [planStatus, setPlanStatus] = useState<string>("trialing");
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccessModal(true);
      // Limpa a URL para não mostrar o modal de novo no refresh
      router.replace("/settings");
    }
    
    // Check for tab parameter
    const tabParam = searchParams.get("tab") as SettingsTab;
    if (tabParam && ["company", "unit", "users", "profiles", "operational", "system", "features"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, router]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return (
      user?.user_metadata?.role === "owner" ||
      user?.user_metadata?.role === "Gerente" ||
      user?.user_metadata?.role === "Gerente Geral" ||
      user?.user_metadata?.role === "Administrador" ||
      user?.email === "gabriel23900@gmail.com"
    );
  }, [user]);

  // Fetch plan from Supabase
  useEffect(() => {
    if (user) {
      const fetchPlan = async () => {
        // 1. Sincroniza ativamente com Sandbox Asaas primeiro
        try {
          await fetch("/api/asaas/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ownerId: user.id })
          });
        } catch (e) {
          console.log("Sync error:", e);
        }

        // 2. Lê a versão mais atual do BD
        const { data, error } = await supabase.rpc('get_my_subscription');
        if (data && data.length > 0) {
          const sub = data[0];
          setCurrentPlan(sub.plan as PlanTier);
          setPlanStatus(sub.status);
          setTrialEndsAt(sub.trial_end ? new Date(sub.trial_end) : null);

          // Avisa outros componentes (o Sidebar) que o plano mudou ativamente
          window.dispatchEvent(new CustomEvent('refresh-subscription'));
        }
      };
      fetchPlan();
    }
  }, [user]);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    razaoSocial: "",
    nomeFantasia: "Lavanderia Pro",
    cnpj: "",
    inscricaoEstadual: "",
    email: "contato@lavanderiapro.com",
    phone: "(11) 3000-4000",
    website: "",
    logo: "",
  });

  const [operationalForm, setOperationalForm] = useState({
    defaultDeliveryDays: 3,
    autoLabeling: true,
    whatsappNotify: false,
    payOnDelivery: true,
    defaultReceiptNote: "",
    emailSummary: true,
    newOrderAlerts: true,
    weeklyReports: false,
    orderCreated: true,
    orderReady: true,
    deliveryScheduled: true,
  });

  const [systemForm, setSystemForm] = useState({
    language: "pt-BR",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    decimalPlaces: 2,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedCompany = localStorage.getItem("lavanpro_company");
    if (savedCompany) {
      try { setCompanyForm(JSON.parse(savedCompany)); } catch { /* ignore */ }
    }
    const savedOperational = localStorage.getItem("lavanpro_operational");
    if (savedOperational) {
      try { setOperationalForm(JSON.parse(savedOperational)); } catch { /* ignore */ }
    }
    const savedSystem = localStorage.getItem("lavanpro_system");
    if (savedSystem) {
      try { setSystemForm(JSON.parse(savedSystem)); } catch { /* ignore */ }
    }
  }, []);

  // Set default tab for non-admins
  useEffect(() => {
    if (!loading && !isAdmin && activeTab === 'company') {
      setActiveTab("operational");
    }
  }, [loading, isAdmin, activeTab]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      localStorage.setItem("lavanpro_company", JSON.stringify(companyForm));
      localStorage.setItem("lavanpro_operational", JSON.stringify(operationalForm));
      localStorage.setItem("lavanpro_system", JSON.stringify(systemForm));
      notifyDataChanged();
      showToast("Todas as alterações foram salvas com sucesso!", "success");
    } catch {
      showToast("Erro ao salvar alterações.", "error");
    } finally {
      setIsSavingAll(false);
    }
  };

  const TAB_TITLES: Record<SettingsTab, string> = {
    company: "Dados da Empresa",
    unit: "Dados da Unidade",
    users: "Usuários",
    profiles: "Perfis de Acesso",
    operational: "Preferências Operacionais",
    system: "Parâmetros do Sistema",
    features: "Status de Funcionalidades",
  };

  return (
    <AccessGuard permission="settings">
      <div className="flex min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary/30 selection:text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="flex items-center justify-between px-8 py-4 border-b border-brand-darkBorder sticky top-0 bg-brand-bg/90 backdrop-blur-md z-20">
            <div>
              <h1 className="text-2xl font-black text-brand-text tracking-tight">Configurações</h1>
              <p className="text-sm text-brand-muted">
                {TAB_TITLES[activeTab]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab !== "users" && activeTab !== "profiles" && activeTab !== "features" && activeTab !== "unit" && (
                <button
                  onClick={handleSaveAll}
                  disabled={isSavingAll}
                  className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                >
                  {isSavingAll ? (
                    <>
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </button>
              )}
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden relative">
            {(loading || !user) && (
              <div className="absolute inset-0 bg-brand-bg/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="size-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
              </div>
            )}

            {/* Settings sidebar */}
            <SettingsSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isAdmin={isAdmin}
              currentPlan={currentPlan}
            />

            {/* Content area */}
            <main className="flex-1 overflow-y-auto">
              <div className="px-8 py-8 max-w-4xl pb-24">
                {/* Mobile nav */}
                <SettingsMobileNav
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  isAdmin={isAdmin}
                />

                <div className="mt-4 lg:mt-0">
                  {activeTab === "company" && (
                    <CompanyDataTab form={companyForm} onChange={setCompanyForm} />
                  )}
                  {activeTab === "unit" && (
                    <UnitDataTab currentPlan={currentPlan} />
                  )}
                  {activeTab === "users" && (
                    <UsersTab user={user} showToast={showToast} />
                  )}
                  {activeTab === "profiles" && <AccessProfilesTab />}
                  {activeTab === "operational" && (
                    <OperationalPrefsTab form={operationalForm} onChange={setOperationalForm} />
                  )}
                  {activeTab === "system" && (
                    <SystemParamsTab form={systemForm} onChange={setSystemForm} />
                  )}
                  {activeTab === "features" && (
                    <FeatureStatusTab currentPlan={currentPlan} />
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Toast Container */}
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                className={`pointer-events-auto px-6 py-4 rounded-xl border shadow-2xl flex items-center gap-3 ${toast.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                  : toast.type === "error"
                    ? "bg-rose-500/10 border-rose-500/50 text-rose-400"
                    : "bg-blue-500/10 border-blue-500/50 text-blue-400"
                  }`}
              >
                {toast.type === "success" && (
                  <div className="size-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </div>
                )}
                {toast.type === "error" && (
                  <div className="size-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12" /><path d="m6 6 12 12" /></svg>
                  </div>
                )}
                <span className="text-sm font-bold">{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {showSuccessModal && (
            <PaymentSuccessModal onClose={() => setShowSuccessModal(false)} plan={currentPlan} />
        )}
      </div>
    </AccessGuard>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-brand-bg flex items-center justify-center">
      <div className="size-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
    </div>}>
      <SettingsContent />
    </Suspense>
  );
}
