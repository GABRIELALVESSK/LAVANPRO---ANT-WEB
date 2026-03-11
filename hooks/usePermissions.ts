"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabase";

// ---- Shared types (must match access-profiles-tab.tsx) ----
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

// Map routes → permission keys
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

// Routes that are always accessible to authenticated users
const ALWAYS_ALLOWED_ROUTES = ["/dashboard"];

// Owner email — always full access regardless of staff table
const OWNER_EMAIL = "gabriel23900@gmail.com";

/**
 * Normalise roles from the staff table to match our RoleName union.
 * Handles variants like 'Operador de Máquinas', 'Motorista', etc.
 */
function normaliseRole(role: string | null | undefined): RoleName | "owner" {
    if (!role) return "Atendente";
    if (role === "Administrador") return "Administrador";
    if (role === "Gerente" || role === "Gerente Geral") return "Gerente";
    if (role === "Estoquista" || role === "Operador de Máquinas" || role === "Motorista") return "Estoquista";
    if (role === "Atendente") return "Atendente";
    return "Atendente"; // safe default
}

/**
 * Hook that:
 * 1. Reads the user's current role from the `staff` table (source of truth set by admin)
 * 2. Reads the permission matrix from `app_settings` in Supabase
 * 3. Provides real-time permission checks based on current role + matrix
 */
export function usePermissions() {
    const { user, loading: authLoading } = useAuth();

    const [matrix, setMatrix] = useState<PermissionMatrix>(DEFAULT_MATRIX);
    const [staffRole, setStaffRole] = useState<RoleName | "owner" | null>(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        if (authLoading) return; // wait for auth
        if (!user) {
            setDataLoaded(true);
            return;
        }

        let cancelled = false;

        async function loadAll() {
            try {
                // 1. Fetch role from `staff` table by user email — this is what the admin edits
                const isOwner = user!.email === OWNER_EMAIL;

                if (!isOwner) {
                    const { data: staffData } = await supabase
                        .from("staff")
                        .select("role")
                        .eq("email", user!.email)
                        .single();

                    if (!cancelled) {
                        if (staffData?.role) {
                            setStaffRole(normaliseRole(staffData.role));
                        } else {
                            // Fallback to auth metadata if not found in staff table
                            const metaRole = user!.user_metadata?.role;
                            setStaffRole(normaliseRole(metaRole));
                        }
                    }
                } else {
                    if (!cancelled) setStaffRole("owner");
                }

                // 2. Fetch permission matrix from app_settings
                const { data: settingsData, error: settingsError } = await supabase
                    .from("app_settings")
                    .select("value")
                    .eq("key", "permissions_matrix")
                    .single();

                if (!cancelled) {
                    if (!settingsError && settingsData?.value) {
                        const parsed = settingsData.value as PermissionMatrix;
                        setMatrix(parsed);
                        localStorage.setItem("lavanpro_permissions", JSON.stringify(parsed));
                    } else {
                        // Fallback to localStorage
                        const saved = localStorage.getItem("lavanpro_permissions");
                        if (saved) {
                            try { setMatrix(JSON.parse(saved)); } catch { /* ignore */ }
                        }
                    }
                }
            } catch {
                // On any error, try localStorage for the matrix
                if (!cancelled) {
                    const saved = localStorage.getItem("lavanpro_permissions");
                    if (saved) {
                        try { setMatrix(JSON.parse(saved)); } catch { /* ignore */ }
                    }
                }
            } finally {
                if (!cancelled) setDataLoaded(true);
            }
        }

        loadAll();
        return () => { cancelled = true; };
    }, [user, authLoading]);

    const userRole = staffRole;
    const isOwner = userRole === "owner";
    const isAdmin = isOwner || userRole === "Administrador" || userRole === "Gerente";

    /**
     * Check if the current user has access to a specific permission module.
     */
    const hasPermission = (permission: PermissionKey): boolean => {
        if (!dataLoaded || !user) return false;
        if (isOwner) return true;
        if (!userRole) return false;
        const rolePerms = matrix[userRole as RoleName];
        if (!rolePerms) return false;
        return rolePerms[permission] ?? false;
    };

    /**
     * Check if the current user has access to a specific route.
     */
    const canAccessRoute = (route: string): boolean => {
        if (!dataLoaded || !user) return false;
        if (isOwner) return true;
        if (ALWAYS_ALLOWED_ROUTES.includes(route)) return true;

        const permKey = ROUTE_PERMISSION_MAP[route];
        if (!permKey) return true;
        return hasPermission(permKey);
    };

    /**
     * Get all accessible routes for the current user (for sidebar filtering).
     */
    const getAccessibleRoutes = (): string[] => {
        if (isOwner) return [...ALWAYS_ALLOWED_ROUTES, ...Object.keys(ROUTE_PERMISSION_MAP)];

        const routes = [...ALWAYS_ALLOWED_ROUTES];
        for (const [route, perm] of Object.entries(ROUTE_PERMISSION_MAP)) {
            if (hasPermission(perm)) {
                routes.push(route);
            }
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
