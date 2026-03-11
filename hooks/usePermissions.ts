"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabase";

// ---- Shared types ----
const ROLES = ["Administrador", "Gerente", "Atendente", "Estoquista"] as const;

type PermissionKey = "orders" | "customers" | "finance" | "stock" | "reports" | "team" | "settings" | "labels";
type RoleName = (typeof ROLES)[number];
type PermissionMatrix = Record<RoleName, Record<PermissionKey, boolean>>;

const DEFAULT_MATRIX: PermissionMatrix = {
    Administrador: { orders: true, customers: true, finance: true, stock: true, reports: true, team: true, settings: true, labels: true },
    Gerente: { orders: true, customers: true, finance: true, stock: true, reports: true, team: true, settings: false, labels: true },
    Atendente: { orders: true, customers: true, finance: false, stock: false, reports: false, team: false, settings: false, labels: true },
    Estoquista: { orders: false, customers: false, finance: false, stock: true, reports: false, team: false, settings: false, labels: false },
};

const ROUTE_PERMISSION_MAP: Record<string, PermissionKey> = {
    "/orders": "orders",
    "/customers": "customers",
    "/finance": "finance",
    "/stock": "stock",
    "/reports": "reports",
    "/team": "team",
    "/settings": "settings",
    "/labels": "labels",
};

const ALWAYS_ALLOWED_ROUTES = ["/dashboard"];
const OWNER_EMAIL = "gabriel23900@gmail.com";

function normaliseRole(role: string | null | undefined): RoleName {
    if (!role) return "Atendente";
    const r = role.trim();
    if (r === "Administrador") return "Administrador";
    if (r === "Gerente" || r === "Gerente Geral") return "Gerente";
    if (r === "Estoquista" || r === "Operador de Máquinas" || r === "Motorista") return "Estoquista";
    if (r === "Atendente") return "Atendente";
    console.warn("[usePermissions] Unknown role:", r, "→ defaulting to Atendente");
    return "Atendente";
}

export function usePermissions() {
    const { user, loading: authLoading } = useAuth();

    const [matrix, setMatrix] = useState<PermissionMatrix>(DEFAULT_MATRIX);
    const [staffRole, setStaffRole] = useState<RoleName | "owner" | null>(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { setDataLoaded(true); return; }

        let cancelled = false;

        async function loadAll() {
            try {
                // ── 1. Owner shortcut ─────────────────────────────────────────
                const isOwner = user!.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
                if (isOwner) {
                    if (!cancelled) setStaffRole("owner");
                } else {
                    // ── 2. Call RPC function (server-side, bypasses RLS issues) ──
                    const { data: rpcData, error: rpcError } = await supabase
                        .rpc("get_my_staff_role");

                    if (rpcError) {
                        console.error("[usePermissions] RPC get_my_staff_role error:", rpcError);
                        // Fallback: direct query by user_id
                        const { data: directData } = await supabase
                            .from("staff")
                            .select("role")
                            .eq("user_id", user!.id)
                            .maybeSingle();
                        if (!cancelled) {
                            setStaffRole(normaliseRole(directData?.role));
                        }
                    } else {
                        const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
                        console.log("[usePermissions] RPC result:", row);
                        if (!cancelled) {
                            setStaffRole(normaliseRole(row?.role));
                        }
                    }
                }

                // ── 3. Load permission matrix ─────────────────────────────────
                const { data: settingsData, error: settingsError } = await supabase
                    .from("app_settings")
                    .select("value")
                    .eq("key", "permissions_matrix")
                    .maybeSingle();

                if (!cancelled) {
                    if (settingsError) console.error("[usePermissions] Error loading matrix:", settingsError);

                    if (settingsData?.value) {
                        const parsed = settingsData.value as PermissionMatrix;
                        setMatrix(parsed);
                        localStorage.setItem("lavanpro_permissions", JSON.stringify(parsed));
                    } else {
                        const saved = localStorage.getItem("lavanpro_permissions");
                        if (saved) {
                            try { setMatrix(JSON.parse(saved)); } catch { /* ignore */ }
                        }
                    }
                }
            } catch (err) {
                console.error("[usePermissions] Unexpected error:", err);
            } finally {
                if (!cancelled) setDataLoaded(true);
            }
        }

        loadAll();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, authLoading]);

    const userRole = staffRole;
    const isOwner = userRole === "owner";
    const isAdmin = isOwner || userRole === "Administrador" || userRole === "Gerente";

    const hasPermission = (permission: PermissionKey): boolean => {
        if (!dataLoaded || !user) return false;
        if (isOwner) return true;
        if (!userRole) return false;
        const rolePerms = matrix[userRole as RoleName];
        if (!rolePerms) return false;
        return rolePerms[permission] ?? false;
    };

    const canAccessRoute = (route: string): boolean => {
        if (!dataLoaded || !user) return false;
        if (isOwner) return true;
        if (ALWAYS_ALLOWED_ROUTES.includes(route)) return true;
        const permKey = ROUTE_PERMISSION_MAP[route];
        if (!permKey) return true;
        return hasPermission(permKey);
    };

    const getAccessibleRoutes = (): string[] => {
        if (isOwner) return [...ALWAYS_ALLOWED_ROUTES, ...Object.keys(ROUTE_PERMISSION_MAP)];
        const routes = [...ALWAYS_ALLOWED_ROUTES];
        for (const [route, perm] of Object.entries(ROUTE_PERMISSION_MAP)) {
            if (hasPermission(perm)) routes.push(route);
        }
        return routes;
    };

    return {
        userRole,
        isOwner,
        isAdmin,
        loading: authLoading || !dataLoaded,
        hasPermission,
        canAccessRoute,
        getAccessibleRoutes,
        matrix,
    };
}

export { ROUTE_PERMISSION_MAP, ALWAYS_ALLOWED_ROUTES, DEFAULT_MATRIX, ROLES };
export type { PermissionKey, RoleName, PermissionMatrix };
