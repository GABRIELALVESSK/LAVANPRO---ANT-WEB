"use client";

import { AccessGuard } from "@/components/access-guard";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/sidebar";
import { SettingsSidebar, SettingsMobileNav } from "@/components/settings/settings-sidebar";
import { CompanyDataTab } from "@/components/settings/company-data-tab";
import { UnitDataTab } from "@/components/settings/unit-data-tab";
import { UsersTab } from "@/components/settings/users-tab";
import { AccessProfilesTab } from "@/components/settings/access-profiles-tab";
import { OperationalPrefsTab } from "@/components/settings/operational-prefs-tab";
import { SystemParamsTab } from "@/components/settings/system-params-tab";
import { FeatureStatusTab } from "@/components/settings/feature-status-tab";
import { motion, AnimatePresence } from "framer-motion";
import type { SettingsTab } from "@/components/settings/settings-sidebar";
import type { CompanyFormData } from "@/components/settings/company-data-tab";
import type { UnitFormData } from "@/components/settings/unit-data-tab";
import type { OperationalPrefsData } from "@/components/settings/operational-prefs-tab";
import type { SystemParamsData } from "@/components/settings/system-params-tab";

// Plan tier configuration
type PlanTier = "free" | "pro" | "enterprise";

const DEFAULT_OPENING_HOURS: Record<string, { open: string; close: string; active: boolean }> = {
  mon: { open: "08:00", close: "18:00", active: true },
  tue: { open: "08:00", close: "18:00", active: true },
  wed: { open: "08:00", close: "18:00", active: true },
  thu: { open: "08:00", close: "18:00", active: true },
  fri: { open: "08:00", close: "18:00", active: true },
  sat: { open: "08:00", close: "13:00", active: true },
  sun: { open: "08:00", close: "12:00", active: false },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);
  const { user, loading } = useAuth();

  const [currentPlan, setCurrentPlan] = useState<PlanTier>("free");
  const [planStatus, setPlanStatus] = useState<string>("trialing");
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);

  const isAdmin =
    user?.user_metadata?.role === "owner" ||
    user?.user_metadata?.role === "Gerente" ||
    user?.user_metadata?.role === "Gerente Geral" ||
    user?.user_metadata?.role === "Administrador" ||
    user?.email === "gabriel23900@gmail.com";

  // Fetch plan from Supabase
  useEffect(() => {
    if (user) {
      const fetchPlan = async () => {
        const { data, error } = await supabase.rpc('get_my_subscription');
        if (data && data.length > 0) {
          const sub = data[0];
          setCurrentPlan(sub.plan as PlanTier);
          setPlanStatus(sub.status);
          setTrialEndsAt(sub.trial_end ? new Date(sub.trial_end) : null);
        }
      };
      // For now we don't block the page load while fetching
      fetchPlan();
    }
  }, [user]);

  // Form states
  const [companyForm, setCompanyForm] = useState<CompanyFormData>({
    razaoSocial: "",
    nomeFantasia: "Lavanderia Pro",
    cnpj: "",
    inscricaoEstadual: "",
    email: "contato@lavanderiapro.com",
    phone: "(11) 3000-4000",
    website: "",
  });

  const [unitForm, setUnitForm] = useState<UnitFormData>({
    name: "Lavanderia Pro - Centro",
    street: "Av. Paulista",
    number: "1000",
    complement: "",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    phone: "(11) 3000-4000",
    email: "centro@lavanderiapro.com",
    openingHours: DEFAULT_OPENING_HOURS,
  });

  const [operationalForm, setOperationalForm] = useState<OperationalPrefsData>({
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

  const [systemForm, setSystemForm] = useState<SystemParamsData>({
    language: "pt-BR",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    decimalPlaces: 2,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCompany = localStorage.getItem("lavanpro_company");
    if (savedCompany) {
      try { setCompanyForm(JSON.parse(savedCompany)); } catch { /* ignore */ }
    }
    const savedUnit = localStorage.getItem("lavanpro_unit");
    if (savedUnit) {
      try { setUnitForm(JSON.parse(savedUnit)); } catch { /* ignore */ }
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
    if (!loading && !isAdmin) {
      setActiveTab("operational");
    }
  }, [loading, isAdmin]);

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
      localStorage.setItem("lavanpro_unit", JSON.stringify(unitForm));
      localStorage.setItem("lavanpro_operational", JSON.stringify(operationalForm));
      localStorage.setItem("lavanpro_system", JSON.stringify(systemForm));
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
              {activeTab !== "users" && activeTab !== "profiles" && activeTab !== "features" && (
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
            {loading && (
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
              <div className="px-8 py-8 max-w-4xl">
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
                    <UnitDataTab form={unitForm} onChange={setUnitForm} />
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
      </div>
    </AccessGuard>
  );
}
