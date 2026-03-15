"use client";

import { ShieldCheck, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const ROLES = ["Administrador", "Gerente", "Atendente", "Estoquista"] as const;

const PERMISSIONS = [
    { key: "dashboard", label: "Visão Geral", description: "Acesso ao painel principal e métricas" },
    { key: "orders", label: "Pedidos", description: "Criar, editar e visualizar pedidos" },
    { key: "customers", label: "Clientes", description: "Gerenciar cadastro de clientes" },
    { key: "services", label: "Serviços", description: "Gerenciar catálogo de serviços e preços" },
    { key: "finance", label: "Financeiro", description: "Acesso a relatórios financeiros" },
    { key: "stock", label: "Estoque", description: "Controle de insumos e produtos" },
    { key: "reports", label: "Relatórios", description: "Visualizar relatórios gerenciais" },
    { key: "team", label: "Equipe", description: "Gerenciar colaboradores" },
    { key: "chat", label: "Mensagens IA", description: "Acesso ao assistente de mensagens" },
    { key: "labels", label: "Etiquetagem QR", description: "Gerar e vincular QR codes" },
    { key: "settings", label: "Configurações", description: "Alterar configurações do sistema" },
] as const;

type PermissionKey = (typeof PERMISSIONS)[number]["key"];
type RoleName = (typeof ROLES)[number];
type PermissionMatrix = Record<RoleName, Record<PermissionKey, boolean>>;

const DEFAULT_MATRIX: PermissionMatrix = {
    Administrador: { dashboard: true, orders: true, customers: true, services: true, finance: true, stock: true, reports: true, team: true, chat: true, labels: true, settings: true },
    Gerente: { dashboard: true, orders: true, customers: true, services: true, finance: true, stock: true, reports: true, team: true, chat: true, labels: true, settings: false },
    Atendente: { dashboard: true, orders: true, customers: true, services: true, finance: false, stock: false, reports: false, team: false, chat: false, labels: true, settings: false },
    Estoquista: { dashboard: false, orders: false, customers: false, services: false, finance: false, stock: true, reports: false, team: false, chat: false, labels: false, settings: false },
};

export function AccessProfilesTab() {
    const [matrix, setMatrix] = useState<PermissionMatrix>(DEFAULT_MATRIX);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    // Load from Supabase on mount
    const loadMatrix = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("app_settings")
                .select("value")
                .eq("key", "permissions_matrix")
                .single();

            let loadedMatrix: PermissionMatrix | null = null;

            if (error) {
                // If table doesn't exist or no row, try localStorage fallback
                console.warn("Supabase load failed, trying localStorage:", error.message);
                const saved = localStorage.getItem("lavanpro_permissions");
                if (saved) {
                    try { loadedMatrix = JSON.parse(saved); } catch { /* ignore */ }
                }
            } else if (data?.value) {
                loadedMatrix = data.value as PermissionMatrix;
                // Also sync to localStorage for backward compatibility
                localStorage.setItem("lavanpro_permissions", JSON.stringify(loadedMatrix));
            }

            if (loadedMatrix) {
                const merged = { ...DEFAULT_MATRIX };
                for (const r of ROLES) {
                    if (loadedMatrix[r]) {
                        merged[r] = { ...DEFAULT_MATRIX[r], ...loadedMatrix[r] };
                    }
                }
                setMatrix(merged);
            }
        } catch (err) {
            console.error("Error loading permissions:", err);
            // Fallback to localStorage
            const saved = localStorage.getItem("lavanpro_permissions");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const merged = { ...DEFAULT_MATRIX };
                    for (const r of ROLES) {
                        if (parsed[r]) {
                            merged[r] = { ...DEFAULT_MATRIX[r], ...parsed[r] };
                        }
                    }
                    setMatrix(merged);
                } catch { /* ignore */ }
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMatrix();
    }, [loadMatrix]);

    // Save to Supabase + localStorage
    const saveMatrix = useCallback(async (newMatrix: PermissionMatrix) => {
        setSaving(true);
        setSaveStatus("idle");

        // Always save to localStorage for immediate local use
        localStorage.setItem("lavanpro_permissions", JSON.stringify(newMatrix));

        try {
            // Try upsert to Supabase
            const { error } = await supabase
                .from("app_settings")
                .upsert(
                    {
                        key: "permissions_matrix",
                        value: newMatrix,
                    },
                    { onConflict: "key" }
                );

            if (error) {
                console.error("Supabase save failed:", error.message);
                setSaveStatus("error");
            } else {
                setSaveStatus("success");
            }
        } catch (err) {
            console.error("Error saving permissions:", err);
            setSaveStatus("error");
        } finally {
            setSaving(false);
            // Clear status after a few seconds
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    }, []);

    const togglePermission = (role: RoleName, permission: PermissionKey) => {
        if (role === "Administrador") return; // Admin always has all
        const newMatrix = {
            ...matrix,
            [role]: {
                ...(matrix[role] || DEFAULT_MATRIX[role] || {}),
                [permission]: !(matrix[role]?.[permission] ?? false),
            },
        };
        setMatrix(newMatrix);
        saveMatrix(newMatrix);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="flex items-center gap-3 text-brand-muted">
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-sm font-medium">Carregando permissões...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-14 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20">
                        <ShieldCheck className="size-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-text">Perfis de Acesso</h3>
                        <p className="text-sm text-brand-muted">Defina as permissões de cada cargo no sistema</p>
                    </div>
                </div>
                {/* Save status indicator */}
                <div className="flex items-center gap-2">
                    {saving && (
                        <div className="flex items-center gap-2 text-brand-muted text-xs font-medium">
                            <Loader2 className="size-3.5 animate-spin" />
                            Salvando...
                        </div>
                    )}
                    {saveStatus === "success" && (
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="size-3.5" />
                            Salvo para todos os usuários
                        </div>
                    )}
                    {saveStatus === "error" && (
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                            <AlertCircle className="size-3.5" />
                            Erro — salvo apenas localmente
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl">
                <Info className="size-5 text-brand-primary shrink-0 mt-0.5" />
                <div className="text-sm text-brand-muted">
                    <p className="font-semibold text-brand-text">Como funciona?</p>
                    <p>Cada cargo possui permissões que definem quais módulos do sistema o colaborador pode acessar. O perfil <strong>Administrador</strong> sempre mantém acesso total. As alterações são salvas automaticamente e aplicadas <strong>para todos os usuários</strong> do sistema.</p>
                </div>
            </div>

            {/* Permission Matrix */}
            <div className="bg-brand-card rounded-xl border border-brand-darkBorder shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-brand-bg/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-brand-muted sticky left-0 bg-brand-bg/50 z-10 min-w-[200px]">Módulo</th>
                                {ROLES.map((role) => (
                                    <th key={role} className="px-6 py-4 text-xs font-bold uppercase text-brand-muted text-center min-w-[130px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{role}</span>
                                            {role === "Administrador" && (
                                                <span className="text-[10px] text-brand-primary font-medium normal-case">(acesso total)</span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-darkBorder">
                            {PERMISSIONS.map((perm) => (
                                <tr key={perm.key} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 sticky left-0 bg-brand-card z-10">
                                        <p className="text-sm font-semibold text-brand-text">{perm.label}</p>
                                        <p className="text-xs text-brand-muted">{perm.description}</p>
                                    </td>
                                    {ROLES.map((role) => (
                                        <td key={role} className="px-6 py-4 text-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={matrix[role]?.[perm.key] ?? false}
                                                    onChange={() => togglePermission(role, perm.key)}
                                                    disabled={role === "Administrador" || saving}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-10 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary ${role === "Administrador" ? "bg-brand-primary opacity-60 cursor-not-allowed" : "bg-brand-darkBorder"
                                                    }`}></div>
                                            </label>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
