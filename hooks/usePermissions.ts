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

/**
 * Hook that reads the permission matrix from Supabase (with localStorage fallback)
 * and resolves the current user's role to provide real-time permission checks.
 */
export function usePermissions() {
    const { user, loading } = useAuth();
    const [matrix, setMatrix] = useState<PermissionMatrix>(DEFAULT_MATRIX);
    const [matrixLoaded, setMatrixLoaded] = useState(false);

    // Determine user's role
    const userRole: RoleName | "owner" | null = (() => {
        if (!user) return null;

        const role = user.user_metadata?.role;

        // Owner / super-admin — always full access
        if (role === "owner" || user.email === "gabriel23900@gmail.com") return "owner";

        // Map known roles
        if (role === "Gerente" || role === "Gerente Geral") return "Gerente";
        if (role === "Administrador") return "Administrador";
        if (role === "Estoquista") return "Estoquista";
        if (role === "Atendente") return "Atendente";

        // Default for unknown roles
        return "Atendente";
    })();

    const isOwner = userRole === "owner";
    const isAdmin = isOwner || userRole === "Administrador" || userRole === "Gerente";

    // Load permission matrix: try Supabase first, fallback to localStorage
    useEffect(() => {
        let cancelled = false;

        async function loadMatrix() {
            try {
                const { data, error } = await supabase
                    .from("app_settings")
                    .select("value")
                    .eq("key", "permissions_matrix")
                    .single();

                if (!cancelled) {
                    if (!error && data?.value) {
                        const parsed = data.value as PermissionMatrix;
                        setMatrix(parsed);
                        // Sync to localStorage for faster subsequent loads
                        localStorage.setItem("lavanpro_permissions", JSON.stringify(parsed));
                    } else {
                        // Supabase failed — try localStorage
                        const saved = localStorage.getItem("lavanpro_permissions");
                        if (saved) {
                            try { setMatrix(JSON.parse(saved)); } catch { /* ignore */ }
                        }
                    }
                }
            } catch {
                // Network error — try localStorage
                if (!cancelled) {
                    const saved = localStorage.getItem("lavanpro_permissions");
                    if (saved) {
                        try { setMatrix(JSON.parse(saved)); } catch { /* ignore */ }
                    }
                }
            } finally {
                if (!cancelled) setMatrixLoaded(true);
            }
        }

        loadMatrix();
        return () => { cancelled = true; };
    }, []);

    /**
     * Check if the current user has access to a specific permission module.
     */
    const hasPermission = (permission: PermissionKey): boolean => {
        if (loading || !user) return false;
        if (isOwner) return true; // Owner always has full access
        if (!userRole) return false;
        const rolePerms = matrix[userRole as RoleName];
        if (!rolePerms) return false;
        return rolePerms[permission] ?? false;
    };

    /**
     * Check if the current user has access to a specific route.
     */
    const canAccessRoute = (route: string): boolean => {
        if (loading || !user) return false;
        if (isOwner) return true;
        if (ALWAYS_ALLOWED_ROUTES.includes(route)) return true;

        const permKey = ROUTE_PERMISSION_MAP[route];
        if (!permKey) return true; // Unknown routes are allowed by default
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
        loading: loading || !matrixLoaded,
        hasPermission,
        canAccessRoute,
        getAccessibleRoutes,
        matrix,
    };
}

export { ROUTE_PERMISSION_MAP, ALWAYS_ALLOWED_ROUTES, DEFAULT_MATRIX, ROLES };
export type { PermissionKey, RoleName, PermissionMatrix };
