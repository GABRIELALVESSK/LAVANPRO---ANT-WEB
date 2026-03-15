
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useUnit } from "@/hooks/useUnit";
import { Activity, Shield, Database, Layout, Clock } from "lucide-react";

export function DebugOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { unitId } = useUnit();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [config, setConfig] = useState<any>({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    projectRef: process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/\/\/(.*?)\.supabase/)?.[1],
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionInfo(session);
    };
    checkSession();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setIsVisible(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible) return (
    <div className="fixed bottom-4 right-4 z-[9999] opacity-20 hover:opacity-100 transition-opacity">
      <button 
        onClick={() => setIsVisible(true)}
        className="bg-brand-card p-2 rounded-full border border-brand-darkBorder text-brand-muted"
        title="Debug Panel (Ctrl+Shift+D)"
      >
        <Activity className="size-4" />
      </button>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 bg-[#0f111a]/95 border border-brand-primary/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl text-[10px] font-mono animate-in slide-in-from-right-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-brand-primary font-black uppercase tracking-tighter">
          <Shield className="size-3" /> Forensic Debug
        </div>
        <button onClick={() => setIsVisible(false)} className="text-brand-muted hover:text-white">✕</button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        <Section title="Infrastructure" icon={<Database />}>
          <Field label="SUPABASE_URL" value={config.url} />
          <Field label="PROJECT_REF" value={config.projectRef} />
          <Field label="RUNTIME" value={typeof window !== 'undefined' ? 'Client' : 'Server'} />
        </Section>

        <Section title="Session & Auth" icon={<Shield />}>
          <Field label="USER_ID" value={user?.id} />
          <Field label="EMAIL" value={user?.email} />
          <Field label="EXPIRES_AT" value={sessionInfo?.expires_at ? new Date(sessionInfo.expires_at * 1000).toLocaleString() : 'N/A'} />
        </Section>

        <Section title="Scope" icon={<Layout />}>
          <Field label="ACTIVE_UNIT" value={unitId} />
          <Field label="LOCAL_STORAGE_ITEMS" value={typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.startsWith('lavanpro_')).length.toString() : '0'} />
        </Section>

        <Section title="Persistence Audit" icon={<Clock />}>
          {['lavanpro_orders_v3', 'lavanpro_units', 'lavanpro_customers'].map(key => {
            const isPresent = typeof window !== 'undefined' && !!localStorage.getItem(key);
            return (
              <div key={key} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
                 <span className="text-brand-muted">{key.replace('lavanpro_', '')}</span>
                 <span className={isPresent ? "text-emerald-500" : "text-rose-500"}>
                   {isPresent ? '✓ Presente' : '✕ Ausente'}
                 </span>
              </div>
            );
          })}
        </Section>

        
        <div className="pt-2 text-[9px] text-brand-muted italic text-center">
          Ctrl+Shift+D para alternar visibilidade
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-white/50 font-black uppercase text-[8px] tracking-widest mt-2 first:mt-0">
        {icon} {title}
      </div>
      <div className="bg-white/[0.03] rounded-lg p-2 border border-white/5 space-y-1">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string, value?: string }) {
  return (
    <div className="flex flex-col gap-0.5 overflow-hidden">
      <span className="text-[7px] text-brand-muted uppercase font-black tracking-tighter">{label}</span>
      <span className="text-white truncate" title={value}>{value || 'N/A'}</span>
    </div>
  );
}
